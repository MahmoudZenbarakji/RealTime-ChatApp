import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userAPI, chatAPI, counselorAPI } from '../services/api';
import { getSocket, socketEvents } from '../services/socket';
import type { Message, ChatRoom } from '../types';

export const Chat = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socket = getSocket();

  useEffect(() => {
    if (!chatRoomId || !socket) return;

    loadChatRoom();
    loadMessages();

    // Join room
    socketEvents.joinRoom(socket, chatRoomId);

    // Listen for new messages
    socketEvents.onNewMessage(socket, (data) => {
      if (data.message.chatRoom === chatRoomId) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    });

    // Listen for typing indicators
    socketEvents.onUserTyping(socket, (data) => {
      if (data.chatRoomId === chatRoomId && data.userId !== user?.id) {
        setTypingUser(data.userId);
        setIsTyping(data.isTyping);
        if (!data.isTyping) {
          setTimeout(() => {
            setIsTyping(false);
            setTypingUser(null);
          }, 3000);
        }
      }
    });

    return () => {
      if (socket) {
        socketEvents.off(socket, 'new:message');
        socketEvents.off(socket, 'user:typing');
        socketEvents.leaveRoom(socket, chatRoomId);
      }
    };
  }, [chatRoomId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRoom = async () => {
    try {
      if (user?.role === 'counselor') {
        const response = await counselorAPI.getChatHistory();
        const room = response.data.find((r: ChatRoom) => r._id === chatRoomId);
        setChatRoom(room || null);
      } else {
        const response = await userAPI.getChatHistory();
        const room = response.data.find((r: ChatRoom) => r._id === chatRoomId);
        setChatRoom(room || null);
      }
    } catch (error) {
      console.error('Error loading chat room:', error);
    }
  };

  const loadMessages = async () => {
    if (!chatRoomId) return;
    try {
      if (user?.role === 'counselor') {
        const response = await counselorAPI.getMessages(chatRoomId);
        setMessages(response.data);
      } else {
        const response = await userAPI.getMessages(chatRoomId);
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !chatRoomId) return;

    socketEvents.sendMessage(socket, chatRoomId, newMessage);
    setNewMessage('');
    socketEvents.stopTyping(socket, chatRoomId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socket || !chatRoomId) return;

    socketEvents.startTyping(socket, chatRoomId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketEvents.stopTyping(socket!, chatRoomId!);
    }, 1000);
  };

  const handleRate = async () => {
    const rating = prompt('Rate this counselor (1-5):');
    if (rating && chatRoomId) {
      const numRating = parseInt(rating);
      if (numRating >= 1 && numRating <= 5) {
        try {
          await chatAPI.rateCounselor({
            chatRoomId,
            rating: numRating,
          });
          alert('Thank you for your rating!');
        } catch (error: any) {
          alert(error.response?.data?.message || 'Failed to submit rating');
        }
      }
    }
  };

  if (!chatRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading chat...</div>
      </div>
    );
  }

  const otherUser = user?.role === 'counselor' ? chatRoom.user : chatRoom.counselor.userId;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold">
              {otherUser.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <h2 className="font-semibold">{otherUser.name}</h2>
            {user?.role === 'user' && (
              <p className="text-sm text-gray-500">{chatRoom.counselor.specialization}</p>
            )}
          </div>
        </div>
        {chatRoom.status === 'resolved' && user?.role === 'user' && (
          <button
            onClick={handleRate}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
          >
            Rate Counselor
          </button>
        )}
        {chatRoom.status === 'active' && user?.role === 'counselor' && (
          <button
            onClick={async () => {
              try {
                await counselorAPI.resolveSession(chatRoom._id);
                navigate('/counselor/dashboard');
              } catch (error: any) {
                alert(error.response?.data?.message || 'Failed to resolve session');
              }
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Resolve Session
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender._id === user?.id;
          return (
            <div
              key={message._id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                {!isOwn && (
                  <p className="text-xs font-semibold mb-1">{message.sender.name}</p>
                )}
                <p>{message.content}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        {isTyping && typingUser && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {chatRoom.status === 'active' && (
        <form onSubmit={handleSendMessage} className="bg-white p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Send
            </button>
          </div>
        </form>
      )}

      {chatRoom.status !== 'active' && (
        <div className="bg-yellow-100 border-t border-yellow-400 p-4 text-center">
          <p className="text-yellow-800">
            {chatRoom.status === 'pending'
              ? 'Waiting for counselor to accept your chat request...'
              : chatRoom.status === 'resolved'
              ? 'This session has been resolved.'
              : 'This chat has been declined.'}
          </p>
        </div>
      )}
    </div>
  );
};

