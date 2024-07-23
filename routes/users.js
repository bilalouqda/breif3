const express = require('express');
const { createUser, loginUser, getAllUsers, getUserById, updateUser, deleteUser, verifyEmail, refreshToken } = require('../controllers/userController');
const { authMiddleware,authorize } = require('../middleware/authMiddleware');
const rateLimit = require('./utils/rateLimite');

const router = express.Router();

router.post('/register',rateLimit, createUser);
router.post('/login', rateLimit ,loginUser);
router.post('/verify-email/:token', verifyEmail);
router.get('/', authMiddleware, authorize('admin'), getAllUsers);
router.get('/:id', authMiddleware, authorize('admin', 'user'), getUserById); 
router.put('/:id', authMiddleware, authorize('admin', 'user'), updateUser);
router.delete('/:id', authMiddleware, authorize('admin'), deleteUser);
router.post('/refresh-token', refreshToken);


module.exports = router;
