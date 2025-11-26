const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Counselor = require('../models/Counselor');
const Rating = require('../models/Rating');

// Create chat room (user starts a chat)
exports.createChatRoom = async (req, res, next) => {
  try {
    const { counselorId } = req.body;

    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({ message: 'Counselor not found' });
    }

    if (!counselor.isAvailable) {
      return res.status(400).json({ message: 'Counselor is not available' });
    }

    // Check if there's already a pending or active chat
    const existingChat = await ChatRoom.findOne({
      user: req.user.id,
      counselor: counselorId,
      status: { $in: ['pending', 'active'] }
    });

    if (existingChat) {
      return res.status(400).json({ 
        message: 'You already have an active or pending chat with this counselor',
        chatRoom: existingChat
      });
    }

    const chatRoom = await ChatRoom.create({
      user: req.user.id,
      counselor: counselorId,
      status: 'pending'
    });

    const populatedChatRoom = await ChatRoom.findById(chatRoom._id)
      .populate('counselor', 'specialization bio rating')
      .populate({
        path: 'counselor',
        populate: { path: 'userId', select: 'name email profilePicture' }
      })
      .populate('user', 'name email profilePicture');

    res.status(201).json({
      success: true,
      data: populatedChatRoom
    });
  } catch (error) {
    next(error);
  }
};

// Rate counselor
exports.rateCounselor = async (req, res, next) => {
  try {
    const { chatRoomId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    if (chatRoom.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only the user can rate the counselor' });
    }

    if (chatRoom.status !== 'resolved') {
      return res.status(400).json({ message: 'Can only rate resolved sessions' });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({ chatRoom: chatRoomId });
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this session' });
    }

    // Create rating
    const newRating = await Rating.create({
      chatRoom: chatRoomId,
      user: req.user.id,
      counselor: chatRoom.counselor,
      rating,
      comment: comment || ''
    });

    // Update counselor rating
    const counselor = await Counselor.findById(chatRoom.counselor);
    const allRatings = await Rating.find({ counselor: counselor._id });
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    counselor.rating = {
      average: Math.round(averageRating * 10) / 10,
      count: allRatings.length
    };
    await counselor.save();

    res.json({
      success: true,
      data: newRating
    });
  } catch (error) {
    next(error);
  }
};

