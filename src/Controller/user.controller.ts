import { Request, Response } from 'express';
import User from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);
const JWT_SECRET = process.env.JWT_SECRET;

// Signup
export const signup = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Check if the username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'Username already taken' });
  }

  // Hash the password and create a new user
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: 'User registered successfully' });
};

// Login
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id }, JWT_SECRET);
  res.json({ token });
};

// Get Users and Friends
export const getUsers = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = await User.findById(userId).populate('friends friendRequests');
  const users = await User.find({ _id: { $ne: userId } });
  res.json({ users, friends: user?.friends, friendRequests: user?.friendRequests });
};

// Send Friend Request
export const sendFriendRequest = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { targetUserId } = req.params;

  if (!targetUserId) {
    return res.status(400).json({ message: 'Target user ID is missing' });
  }

  if (!isValidObjectId(targetUserId)) {
    return res.status(400).json({ message: 'Invalid target user ID' });
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  targetUser.friendRequests.push(userId);
  await targetUser.save();
  res.json({ message: 'Friend request sent' });
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { requestId } = req.params;

  try {
    const user = await User.findById(userId);
    const requester = await User.findById(requestId);

    if (!user || !requester) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.friends.push(requester._id);
    requester.friends.push(user._id);

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requestId);

    await user.save();
    await requester.save();

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error accepting friend request' });
  }
};

// Reject Friend Request
export const rejectFriendRequest = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { requestId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove friend request
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requestId);

    await user.save();

    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error rejecting friend request' });
  }
};