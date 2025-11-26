# SocialCare Chat Platform

A full-stack web application for connecting people with certified social counselors through real-time chat.

## 🎯 Features

### User Features
- ✅ Register/Login with JWT authentication
- ✅ Edit profile
- ✅ Browse available counselors
- ✅ Start a chat with a counselor
- ✅ Real-time messaging with Socket.IO
- ✅ Rate counselors after sessions
- ✅ View chat history
- ✅ Notifications for new messages

### Counselor Features
- ✅ Login
- ✅ Accept or decline new chat sessions
- ✅ Real-time chat
- ✅ Manage chat history
- ✅ Mark sessions as resolved
- ✅ View user profiles and previous cases

### Admin Features
- ✅ Login to Admin Dashboard
- ✅ Add/Delete/Update Counselors
- ✅ View all users
- ✅ View statistics (sessions, active chats, counselor performance)
- ✅ Block/Unblock users

## 🔧 Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcrypt for authentication
- Socket.IO for real-time communication

### Frontend
- React.js + TypeScript
- Vite
- TailwindCSS for styling
- Zustand for state management
- Axios for API calls
- Socket.IO client for real-time features

## 📁 Project Structure

```
.
├── Backend/
│   ├── controllers/     # Route controllers
│   ├── database/        # Database connection
│   ├── middleware/      # Auth, error handling
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── socket/          # Socket.IO handlers
│   ├── seeders/         # Database seeders
│   ├── server.js        # Express server
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API & Socket services
│   │   ├── store/       # Zustand stores
│   │   ├── types/       # TypeScript types
│   │   └── App.tsx
│   └── package.json
└── docker-compose.yml
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection string:
```


5. Seed the database (optional):
```bash
node seeders/seed.js
```

6. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

5. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`





2. Access the application:
- Frontend: `http://localhost`
- Backend API: `http://localhost:3000`
- MongoDB: `localhost:27017`

### Individual Docker Builds

**Backend:**
```bash
cd Backend
docker build -t socialcare-backend .
docker run -p 3000:3000 --env-file .env socialcare-backend
```

**Frontend:**
```bash
cd Frontend
docker build -t socialcare-frontend .
docker run -p 80:80 socialcare-frontend
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User Routes (requires user role)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/counselors` - Get available counselors
- `GET /api/users/counselors/:id` - Get counselor details
- `GET /api/users/chats` - Get chat history
- `GET /api/users/chats/:chatRoomId/messages` - Get messages

### Counselor Routes (requires counselor role)
- `GET /api/counselors/profile` - Get counselor profile
- `PUT /api/counselors/profile` - Update counselor profile
- `GET /api/counselors/chats/pending` - Get pending chats
- `GET /api/counselors/chats/active` - Get active chats
- `POST /api/counselors/chats/:chatRoomId/accept` - Accept chat
- `POST /api/counselors/chats/:chatRoomId/decline` - Decline chat
- `POST /api/counselors/chats/:chatRoomId/resolve` - Resolve session

### Admin Routes (requires admin role)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/block` - Toggle block user
- `GET /api/admin/counselors` - Get all counselors
- `POST /api/admin/counselors` - Add counselor
- `PUT /api/admin/counselors/:counselorId` - Update counselor
- `DELETE /api/admin/counselors/:counselorId` - Delete counselor
- `GET /api/admin/statistics` - Get statistics

### Chat Routes
- `POST /api/chat/create` - Create chat room
- `POST /api/chat/rate` - Rate counselor

## 🔌 Socket.IO Events

### Client → Server
- `join:room` - Join a chat room
- `leave:room` - Leave a chat room
- `send:message` - Send a message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `message:read` - Mark message as read

### Server → Client
- `new:message` - New message received
- `user:typing` - User typing indicator
- `message:read` - Message read confirmation
- `notification` - General notification
- `user:online` - User came online
- `user:offline` - User went offline

## 🧪 Test Accounts

After running the seeder:

**Admin:**
- Email: `admin@socialcare.com`
- Password: `admin123`

**Counselors:**
- Email: `sarah@counselor.com` (or any counselor email)
- Password: `counselor123`

**Users:**
- Email: `john@user.com` (or any user email)
- Password: `user123`

## 🛠️ Development

### Running Tests
```bash
cd Backend
npm test
```

### Linting
```bash
cd Frontend
npm run lint
```

## 📦 Production Deployment

### Environment Variables

Make sure to set proper environment variables in production:

**Backend:**
- Use strong JWT secrets
- Set proper MongoDB connection string
- Set FRONTEND_URL to your production domain

**Frontend:**
- Set VITE_API_URL to your production API URL
- Set VITE_SOCKET_URL to your production Socket.IO URL

### Recommended Platforms
- **Backend**: Render, Railway, Heroku, AWS
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: MongoDB Atlas

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@socialcare.com or open an issue in the repository.
