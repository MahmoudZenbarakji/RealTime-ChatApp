import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { counselorAPI } from '../services/api';
import type { ChatRoom } from '../types';

export const CounselorDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [pendingChats, setPendingChats] = useState<ChatRoom[]>([]);
  const [activeChats, setActiveChats] = useState<ChatRoom[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'history'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pendingRes, activeRes] = await Promise.all([
        counselorAPI.getPendingChats(),
        counselorAPI.getActiveChats(),
      ]);
      setPendingChats(pendingRes.data);
      setActiveChats(activeRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (chatRoomId: string) => {
    try {
      await counselorAPI.acceptChat(chatRoomId);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept chat');
    }
  };

  const handleDecline = async (chatRoomId: string) => {
    try {
      await counselorAPI.declineChat(chatRoomId);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to decline chat');
    }
  };

  const handleResolve = async (chatRoomId: string) => {
    try {
      await counselorAPI.resolveSession(chatRoomId);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to resolve session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Counselor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={() => navigate('/counselor/profile')}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Profile
              </button>
              <button
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
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
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'pending'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending ({pendingChats.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'active'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active ({activeChats.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'history'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow-md">
            {pendingChats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending chat requests</div>
            ) : (
              <div className="divide-y">
                {pendingChats.map((chat) => (
                  <div key={chat._id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {chat.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold">{chat.user.name}</h3>
                          <p className="text-sm text-gray-500">{chat.user.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAccept(chat._id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(chat._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="bg-white rounded-lg shadow-md">
            {activeChats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No active chats</div>
            ) : (
              <div className="divide-y">
                {activeChats.map((chat) => (
                  <div
                    key={chat._id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/counselor/chat/${chat._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {chat.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold">{chat.user.name}</h3>
                          <p className="text-sm text-gray-500">{chat.user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(chat._id);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            Chat history feature coming soon
          </div>
        )}
      </div>
    </div>
  );
};

