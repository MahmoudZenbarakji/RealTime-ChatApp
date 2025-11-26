const express = require('express');
const router = express.Router();
const {
  getUsers,
  toggleBlockUser,
  getCounselors,
  addCounselor,
  updateCounselor,
  deleteCounselor,
  getStatistics
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:userId/block', toggleBlockUser);
router.get('/counselors', getCounselors);
router.post('/counselors', addCounselor);
router.put('/counselors/:counselorId', updateCounselor);
router.delete('/counselors/:counselorId', deleteCounselor);
router.get('/statistics', getStatistics);

module.exports = router;

