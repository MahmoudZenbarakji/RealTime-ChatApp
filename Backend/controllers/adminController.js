const User = require('../models/User');
const Counselor = require('../models/Counselor');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Rating = require('../models/Rating');

// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Block/Unblock user
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get all counselors
exports.getCounselors = async (req, res, next) => {
  try {
    const counselors = await Counselor.find()
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: counselors
    });
  } catch (error) {
    next(error);
  }
};

// Add counselor
exports.addCounselor = async (req, res, next) => {
  try {
    const { name, email, password, specialization, bio, experience, certifications } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user with counselor role
    const user = await User.create({
      name,
      email,
      password,
      role: 'counselor'
    });

    // Create counselor profile
    const counselor = await Counselor.create({
      userId: user._id,
      specialization,
      bio,
      experience,
      certifications: certifications || []
    });

    const populatedCounselor = await Counselor.findById(counselor._id)
      .populate('userId', 'name email profilePicture');

    res.status(201).json({
      success: true,
      data: populatedCounselor
    });
  } catch (error) {
    next(error);
  }
};

// Update counselor
exports.updateCounselor = async (req, res, next) => {
  try {
    const { specialization, bio, experience, certifications, isAvailable } = req.body;

    const counselor = await Counselor.findByIdAndUpdate(
      req.params.counselorId,
      {
        specialization,
        bio,
        experience,
        certifications,
        isAvailable
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email profilePicture');

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

// Delete counselor
exports.deleteCounselor = async (req, res, next) => {
  try {
    const counselor = await Counselor.findById(req.params.counselorId);
    if (!counselor) {
      return res.status(404).json({ message: 'Counselor not found' });
    }

    // Delete user account
    await User.findByIdAndDelete(counselor.userId);

    // Delete counselor profile
    await Counselor.findByIdAndDelete(req.params.counselorId);

    res.json({
      success: true,
      message: 'Counselor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get statistics
exports.getStatistics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalCounselors = await User.countDocuments({ role: 'counselor' });
    const totalSessions = await ChatRoom.countDocuments({ status: 'resolved' });
    const activeChats = await ChatRoom.countDocuments({ status: 'active' });
    const pendingChats = await ChatRoom.countDocuments({ status: 'pending' });
    const totalMessages = await Message.countDocuments();

    // Counselor performance
    const counselors = await Counselor.find()
      .populate('userId', 'name email')
      .select('userId rating totalSessions activeChats');

    const counselorPerformance = counselors.map(c => ({
      id: c._id,
      name: c.userId.name,
      email: c.userId.email,
      rating: c.rating.average,
      totalSessions: c.totalSessions,
      activeChats: c.activeChats
    }));

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCounselors,
        totalSessions,
        activeChats,
        pendingChats,
        totalMessages,
        counselorPerformance
      }
    });
  } catch (error) {
    next(error);
  }
};

