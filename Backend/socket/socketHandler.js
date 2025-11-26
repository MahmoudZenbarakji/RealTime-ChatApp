const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Counselor = require('../models/Counselor');

// Store active users and their socket connections
const activeUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

// Authenticate socket connection
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || user.isBlocked) {
      return next(new Error('Authentication error'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

// Initialize socket handler
const initializeSocket = (io) => {
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;

    console.log(`User connected: ${userId} (${userRole})`);

    // Store user connection
    activeUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // If counselor, join counselor room
    if (userRole === 'counselor') {
      const counselor = await Counselor.findOne({ userId });
      if (counselor) {
        socket.join(`counselor:${counselor._id}`);
      }
    }

    // Emit online status to relevant users
    socket.broadcast.emit('user:online', { userId });

    // Join chat room
    socket.on('join:room', async (data) => {
      try {
        const { chatRoomId } = data;
        const chatRoom = await ChatRoom.findById(chatRoomId);

        if (!chatRoom) {
          return socket.emit('error', { message: 'Chat room not found' });
        }

        // Verify user has access to this chat room
        if (userRole === 'user' && chatRoom.user.toString() !== userId) {
          return socket.emit('error', { message: 'Access denied' });
        }

        if (userRole === 'counselor') {
          const counselor = await Counselor.findOne({ userId });
          if (counselor && chatRoom.counselor.toString() !== counselor._id.toString()) {
            return socket.emit('error', { message: 'Access denied' });
          }
        }

        socket.join(`chat:${chatRoomId}`);
        socket.emit('joined:room', { chatRoomId });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Leave chat room
    socket.on('leave:room', (data) => {
      const { chatRoomId } = data;
      socket.leave(`chat:${chatRoomId}`);
      socket.emit('left:room', { chatRoomId });
    });

    // Send message
    socket.on('send:message', async (data) => {
      try {
        const { chatRoomId, content } = data;

        if (!content || !content.trim()) {
          return socket.emit('error', { message: 'Message content is required' });
        }

        const chatRoom = await ChatRoom.findById(chatRoomId);
        if (!chatRoom) {
          return socket.emit('error', { message: 'Chat room not found' });
        }

        // Verify access
        if (userRole === 'user' && chatRoom.user.toString() !== userId) {
          return socket.emit('error', { message: 'Access denied' });
        }

        if (userRole === 'counselor') {
          const counselor = await Counselor.findOne({ userId });
          if (counselor && chatRoom.counselor.toString() !== counselor._id.toString()) {
            return socket.emit('error', { message: 'Access denied' });
          }
        }

        // Only allow messages in active chats
        if (chatRoom.status !== 'active') {
          return socket.emit('error', { message: 'Chat is not active' });
        }

        // Create message
        const message = await Message.create({
          chatRoom: chatRoomId,
          sender: userId,
          content: content.trim()
        });

        // Populate sender info
        await message.populate('sender', 'name profilePicture');

        // Update chat room
        chatRoom.lastMessage = message._id;
        chatRoom.lastMessageAt = new Date();
        await chatRoom.save();

        // Emit to all users in the chat room
        io.to(`chat:${chatRoomId}`).emit('new:message', {
          message: {
            _id: message._id,
            chatRoom: message.chatRoom,
            sender: message.sender,
            content: message.content,
            isRead: message.isRead,
            createdAt: message.createdAt
          }
        });

        // Notify the other user if they're not in the room
        const otherUserId = userRole === 'user' 
          ? (await Counselor.findById(chatRoom.counselor)).userId.toString()
          : chatRoom.user.toString();

        if (activeUsers.has(otherUserId)) {
          io.to(`user:${otherUserId}`).emit('notification', {
            type: 'new_message',
            chatRoomId,
            message: message.content.substring(0, 50)
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      const { chatRoomId } = data;
      socket.to(`chat:${chatRoomId}`).emit('user:typing', {
        userId,
        chatRoomId,
        isTyping: true
      });
    });

    socket.on('typing:stop', (data) => {
      const { chatRoomId } = data;
      socket.to(`chat:${chatRoomId}`).emit('user:typing', {
        userId,
        chatRoomId,
        isTyping: false
      });
    });

    // Mark message as read
    socket.on('message:read', async (data) => {
      try {
        const { messageId, chatRoomId } = data;
        const message = await Message.findById(messageId);

        if (!message || message.chatRoom.toString() !== chatRoomId) {
          return socket.emit('error', { message: 'Message not found' });
        }

        // Only mark as read if user is not the sender
        if (message.sender.toString() !== userId && !message.isRead) {
          message.isRead = true;
          message.readAt = new Date();
          await message.save();

          // Notify sender
          io.to(`chat:${chatRoomId}`).emit('message:read', {
            messageId,
            chatRoomId
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      activeUsers.delete(userId);
      userSockets.delete(socket.id);
      socket.broadcast.emit('user:offline', { userId });
    });
  });

  return io;
};

module.exports = { initializeSocket, activeUsers };

