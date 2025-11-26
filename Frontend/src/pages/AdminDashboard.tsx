import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { adminAPI } from '../services/api';
import type { User, Counselor, Statistics } from '../types';

export const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'counselors' | 'statistics'>('statistics');
  const [loading, setLoading] = useState(true);
  const [showAddCounselor, setShowAddCounselor] = useState(false);
  const [newCounselor, setNewCounselor] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    bio: '',
    experience: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, counselorsRes, statsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getCounselors(),
        adminAPI.getStatistics(),
      ]);
      setUsers(usersRes.data);
      setCounselors(counselorsRes.data);
      setStatistics(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string) => {
    try {
      await adminAPI.toggleBlockUser(userId);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to toggle block status');
    }
  };

  const handleAddCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.addCounselor(newCounselor);
      setShowAddCounselor(false);
      setNewCounselor({
        name: '',
        email: '',
        password: '',
        specialization: '',
        bio: '',
        experience: 0,
      });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add counselor');
    }
  };

  const handleDeleteCounselor = async (counselorId: string) => {
    if (!confirm('Are you sure you want to delete this counselor?')) return;
    try {
      await adminAPI.deleteCounselor(counselorId);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete counselor');
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
              <h1 className="text-2xl font-bold text-indigo-600">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
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
              onClick={() => setActiveTab('statistics')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'statistics'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'users'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('counselors')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'counselors'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Counselors ({counselors.length})
            </button>
          </div>
        </div>

        {activeTab === 'statistics' && statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
              <p className="text-3xl font-bold text-indigo-600">{statistics.totalUsers}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Counselors</h3>
              <p className="text-3xl font-bold text-indigo-600">{statistics.totalCounselors}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Sessions</h3>
              <p className="text-3xl font-bold text-indigo-600">{statistics.totalSessions}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700">Active Chats</h3>
              <p className="text-3xl font-bold text-green-600">{statistics.activeChats}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700">Pending Chats</h3>
              <p className="text-3xl font-bold text-yellow-600">{statistics.pendingChats}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Messages</h3>
              <p className="text-3xl font-bold text-indigo-600">{statistics.totalMessages}</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">All Users</h2>
            </div>
            <div className="divide-y">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{u.name}</h3>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  <button
                    onClick={() => handleToggleBlock(u.id)}
                    className={`px-4 py-2 rounded-lg ${
                      u.isBlocked
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {u.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'counselors' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Counselors</h2>
              <button
                onClick={() => setShowAddCounselor(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Add Counselor
              </button>
            </div>
            {showAddCounselor && (
              <div className="p-4 border-b bg-gray-50">
                <form onSubmit={handleAddCounselor} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newCounselor.name}
                      onChange={(e) => setNewCounselor({ ...newCounselor, name: e.target.value })}
                      required
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newCounselor.email}
                      onChange={(e) => setNewCounselor({ ...newCounselor, email: e.target.value })}
                      required
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={newCounselor.password}
                      onChange={(e) => setNewCounselor({ ...newCounselor, password: e.target.value })}
                      required
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Specialization"
                      value={newCounselor.specialization}
                      onChange={(e) => setNewCounselor({ ...newCounselor, specialization: e.target.value })}
                      required
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Experience (years)"
                      value={newCounselor.experience}
                      onChange={(e) => setNewCounselor({ ...newCounselor, experience: parseInt(e.target.value) })}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Bio"
                      value={newCounselor.bio}
                      onChange={(e) => setNewCounselor({ ...newCounselor, bio: e.target.value })}
                      className="px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCounselor(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div className="divide-y">
              {counselors.map((c) => (
                <div key={c._id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{c.userId.name}</h3>
                    <p className="text-sm text-gray-500">{c.userId.email}</p>
                    <p className="text-sm text-gray-500">{c.specialization}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCounselor(c._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

