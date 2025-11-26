const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
    unique: true
  },
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
ratingSchema.index({ counselor: 1 });
ratingSchema.index({ chatRoom: 1 });

module.exports = mongoose.model('Rating', ratingSchema);

