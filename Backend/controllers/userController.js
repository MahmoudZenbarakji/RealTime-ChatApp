const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Counselor = require('../models/Counselor');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, profilePicture } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (profilePicture) updates.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get available counselors
exports.getCounselors = async (req, res, next) => {
  try {
    const counselors = await Counselor.find({ isAvailable: true })
      .populate('userId', 'name email profilePicture')
      .select('-__v');

    res.json({
      success: true,
      data: counselors
    });
  } catch (error) {
    next(error);
  }
};

// Get counselor details
exports.getCounselorById = async (req, res, next) => {
  try {
    const counselor = await Counselor.findById(req.params.id)
      .populate('userId', 'name email profilePicture')
      .select('-__v');

    if (!counselor) {
      return res.status(404).json({ message: 'Counselor not found' });
    }

    res.json({
      success: true,
      data: counselor
    });
  } catch (error) {
    next(error);
  }
};

// Get user chat history
exports.getChatHistory = async (req, res, next) => {
  try {
    const chatRooms = await ChatRoom.find({ user: req.user.id })
      .populate('counselor', 'specialization bio rating')
      .populate({
        path: 'counselor',
        populate: { path: 'userId', select: 'name email profilePicture' }
      })
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      data: chatRooms
    });
  } catch (error) {
    next(error);
  }
};

// Get messages for a chat room
exports.getMessages = async (req, res, next) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.chatRoomId);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Check if user has access to this chat room
    if (chatRoom.user.toString() !== req.user.id.toString()) {
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

