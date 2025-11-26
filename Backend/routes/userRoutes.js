const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getCounselors,
  getCounselorById,
  getChatHistory,
  getMessages
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);
router.use(authorize('user'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/counselors', getCounselors);
router.get('/counselors/:id', getCounselorById);
router.get('/chats', getChatHistory);
router.get('/chats/:chatRoomId/messages', getMessages);

module.exports = router;

