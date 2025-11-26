const Counselor = require('../models/Counselor');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');

// Get counselor profile
exports.getProfile = async (req, res, next) => {
  try {
    const counselor = await Counselor.findOne({ userId: req.user.id })
      .populate('userId', 'name email profilePicture');

    if (!counselor) {
      return res.status(404).json({ message: 'Counselor profile not found' });
    }

    res.json({
      success: true,
      data: counselor
    });
  } catch (error) {
    next(error);
  }
};

// Update counselor profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { specialization, bio, experience, certifications, isAvailable } = req.body;
    
    const counselor = await Counselor.findOneAndUpdate(
      { userId: req.user.id },
      {
        specialization,
        bio,
        experience,
        certifications,
        isAvailable
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email profilePicture');

    res.json({
      success: true,
      data: counselor
    });
  } catch (error) {
    next(error);
  }
};

// Get pending chat requests
exports.getPendingChats = async (req, res, next) => {
  try {
    const counselor = await Counselor.findOne({ userId: req.user.id });
    if (!counselor) {
      return res.status(404).json({ message: 'Counselor profile not found' });
    }

    const pendingChats = await ChatRoom.find({
      counselor: counselor._id,
      status: 'pending'
    })
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingChats
    });
  } catch (error) {
    next(error);
  }
};

// Get active chats
exports.getActiveChats = async (req, res, next) => {
  try {
    const counselor = await Counselor.findOne({ userId: req.user.id });
    if (!counselor) {
      return res.status(404).json({ message: 'Counselor profile not found' });
    }

    const activeChats = await ChatRoom.find({
      counselor: counselor._id,
      status: 'active'
    })
      .populate('user', 'name email profilePicture')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      data: activeChats
    });
  } catch (error) {
    next(error);
  }
};

// Accept chat request
exports.acceptChat = async (req, res, next) => {
  try {
    const counselor = await Counselor.findOne({ userId: req.user.id });
    if (!counselor) {
      return res.status(404).json({ message: 'Counselor profile not found' });
    }

    const chatRoom = await ChatRoom.findById(req.params.chatRoomId);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    if (chatRoom.counselor.toString() !== counselor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (chatRoom.status !== 'pending') {
      return res.status(400).json({ message: 'Chat request already processed' });
    }

    chatRoom.status = 'active';
    await chatRoom.save();

    counselor.activeChats += 1;
    await counselor.save();

    res.json({
      success: true,
      data: chatRoom
    });
  } catch (error) {
    next(error);
  }
};

// Decline chat request
exports.declineChat = async (req, res, next) => {
  try {
    const counselor = await Counselor.findOne({ userId: req.user.id });
    if (!counselor) {
      return res.status(404).json({ message: 'Counselor profile not found' });
    }

    const chatRoom = await ChatRoom.findById(req.params.chatRoomId);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    if (chatRoom.counselor.toString() !== counselor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (chatRoom.status !== 'pending') {
      return res.status(400).json({ message: 'Chat request already processed' });
    }

    chatRoom.status = 'declined';
    await chatRoom.save();

    res.json({
      success: true,
      message: 'Chat request declined'
    });
  } catch (error) {
    next(error);
  }
};

// Mark session as resolved
exports.resolveSession = async (req, res, next) => {
  try {
    const counselor = await Counselor.findOne({ userId: req.user.id });
    if (!counselor) {
      return res.status(404).json({ message: 'Counselor profile not found' });
    }

    const chatRoom = await ChatRoom.findById(req.params.chatRoomId);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    if (chatRoom.counselor.toString() !== counselor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (chatRoom.status !== 'active') {
      return res.status(400).json({ message: 'Only active sessions can be resolved' });
    }

    chatRoom.status = 'resolved';
    chatRoom.resolvedAt = new Date();
    await chatRoom.save();

    counselor.activeChats = Math.max(0, counselor.activeChats - 1);
    counselor.totalSessions += 1;
    await counselor.save();

    res.json({
      success: true,
      data: chatRoom
    });
  } catch (error) {
    next(error);
  }
};

// Get chat history
exports.getChatHistory = async (req, res, next) => {
  try {
    const counselor = await Counselor.findOne({ userId: req.user.id });
    if (!counselor) {
      return res.status(404).json({ message: 'Counselor profile not found' });
    }

    const chatRooms = await ChatRoom.find({ counselor: counselor._id })
      .populate('user', 'name email profilePicture')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      data: chatRooms
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile for a chat
exports.getUserProfile = async (req, res, next) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.chatRoomId)
      .populate('user', 'name email profilePicture');

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const counselor = await Counselor.findOne({ userId: req.user.id });
    if (chatRoom.counselor.toString() !== counselor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get previous cases with this user
    const previousCases = await ChatRoom.find({
      user: chatRoom.user._id,
      counselor: counselor._id,
      status: 'resolved'
    }).sort({ resolvedAt: -1 });

    res.json({
      success: true,
      data: {
        user: chatRoom.user,
        previousCases
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get messages for a chat room (counselor)
exports.getMessages = async (req, res, next) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.chatRoomId);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const counselor = await Counselor.findOne({ userId: req.user.id });
    if (!counselor) {
      return res.status(404).json({ message: 'Counselor profile not found' });
    }

    // Check if counselor has access to this chat room
    if (chatRoom.counselor.toString() !== counselor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ chatRoom: req.params.chatRoomId })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

