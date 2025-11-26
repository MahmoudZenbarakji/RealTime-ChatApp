const express = require('express');
const router = express.Router();
const {
  createChatRoom,
  rateCounselor
} = require('../controllers/chatController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/create', authenticate, authorize('user'), createChatRoom);
router.post('/rate', authenticate, authorize('user'), rateCounselor);

module.exports = router;

