const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counselor',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'resolved', 'declined'],
    default: 'pending'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatRoomSchema.index({ user: 1, counselor: 1 });
chatRoomSchema.index({ status: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);

