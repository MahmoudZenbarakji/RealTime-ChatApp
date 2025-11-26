import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userAPI, chatAPI } from '../services/api';
import type { Counselor, ChatRoom } from '../types';

export const Home = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'counselors' | 'chats'>('counselors');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [counselorsRes, chatsRes] = await Promise.all([
        userAPI.getCounselors(),
        userAPI.getChatHistory(),
      ]);
      setCounselors(counselorsRes.data);
      setChatHistory(chatsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (counselorId: string) => {
    try {
      const response = await chatAPI.createChatRoom(counselorId);
      navigate(`/chat/${response.data._id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to start chat');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">SocialCare</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={() => navigate('/profile')}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab('counselors')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'counselors'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Available Counselors
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'chats'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Chats
            </button>
          </div>
        </div>

        {activeTab === 'counselors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {counselors.map((counselor) => (
              <div
                key={counselor._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {counselor.userId.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-lg">{counselor.userId.name}</h3>
                    <p className="text-sm text-gray-500">{counselor.specialization}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 text-sm">{counselor.bio || 'No bio available'}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm">
                      {counselor.rating.average.toFixed(1)} ({counselor.rating.count} reviews)
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {counselor.experience} years exp.
                  </span>
                </div>
                <button
                  onClick={() => handleStartChat(counselor._id)}
                  disabled={!counselor.isAvailable}
                  className={`w-full py-2 px-4 rounded-lg font-medium ${
                    counselor.isAvailable
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {counselor.isAvailable ? 'Start Chat' : 'Not Available'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="bg-white rounded-lg shadow-md">
            {chatHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No chat history yet. Start a chat with a counselor!
              </div>
            ) : (
              <div className="divide-y">
                {chatHistory.map((chat) => (
                  <div
                    key={chat._id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/chat/${chat._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {chat.counselor.userId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold">{chat.counselor.userId.name}</h3>
                          <p className="text-sm text-gray-500">{chat.counselor.specialization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            chat.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : chat.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {chat.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(chat.lastMessageAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

