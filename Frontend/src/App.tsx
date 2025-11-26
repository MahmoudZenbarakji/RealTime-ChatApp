import {Routes,Route,BrowserRouter,Navigate} from "react-router-dom"
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { initializeSocket, getSocket } from './services/socket';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { CounselorDashboard } from './pages/CounselorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      initializeSocket(accessToken);
    }
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, accessToken]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:chatRoomId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['counselor']}>
              <CounselorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor/chat/:chatRoomId"
          element={
            <ProtectedRoute allowedRoles={['counselor']}>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor/profile"
          element={
            <ProtectedRoute allowedRoles={['counselor']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

