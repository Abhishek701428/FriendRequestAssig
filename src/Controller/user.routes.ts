import express from 'express';
import { signup, login, getUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from '../Controller/user.controller'
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/users', authenticate, getUsers);
router.post('/friends/:targetUserId', authenticate, sendFriendRequest);
router.post('/friends/accept/:requestId', authenticate, acceptFriendRequest);  // Accept friend request
router.post('/friends/reject/:requestId', authenticate, rejectFriendRequest);  // Reject friend request

export default router;
