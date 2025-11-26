const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getPendingChats,
  getActiveChats,
  acceptChat,
  declineChat,
  resolveSession,
  getChatHistory,
  getUserProfile,
  getMessages
} = require('../controllers/counselorController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);
router.use(authorize('counselor'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/chats/pending', getPendingChats);
router.get('/chats/active', getActiveChats);
router.post('/chats/:chatRoomId/accept', acceptChat);
router.post('/chats/:chatRoomId/decline', declineChat);
router.post('/chats/:chatRoomId/resolve', resolveSession);
router.get('/chats', getChatHistory);
router.get('/chats/:chatRoomId/user', getUserProfile);
router.get('/chats/:chatRoomId/messages', getMessages);

module.exports = router;
