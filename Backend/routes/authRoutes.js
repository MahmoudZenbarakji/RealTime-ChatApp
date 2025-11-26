const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logout);

module.exports = router;

