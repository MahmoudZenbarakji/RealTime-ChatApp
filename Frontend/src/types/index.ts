export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'counselor' | 'admin';
  profilePicture?: string;
  isBlocked?: boolean;
}

export interface Counselor {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  specialization: string;
  bio: string;
  experience: number;
  certifications: string[];
  isAvailable: boolean;
  rating: {
    average: number;
    count: number;
  };
  totalSessions: number;
  activeChats: number;
}

export interface ChatRoom {
  _id: string;
  user: User;
  counselor: Counselor;
  status: 'pending' | 'active' | 'resolved' | 'declined';
  lastMessage?: Message;
  lastMessageAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chatRoom: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  _id: string;
  chatRoom: string;
  user: string;
  counselor: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  counselorProfile: Counselor | null;
}

export interface Statistics {
  totalUsers: number;
  totalCounselors: number;
  totalSessions: number;
  activeChats: number;
  pendingChats: number;
  totalMessages: number;
  counselorPerformance: Array<{
    id: string;
    name: string;
    email: string;
    rating: number;
    totalSessions: number;
    activeChats: number;
  }>;
}

