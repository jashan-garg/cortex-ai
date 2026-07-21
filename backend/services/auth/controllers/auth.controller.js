import { getAuth } from 'firebase-admin/auth';
import { app } from '../config/firebase.js';
import User from '../models/user.model.js';
import crypto from 'crypto';
import redis from '../../../shared/redis/redis.js';

export const login = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = await getAuth(app).verifyIdToken(token);
    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user)
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture,
      });

    const sessionId = crypto.randomUUID();
    await redis.set(
      `session-${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
      }),
      'EX',
      7 * 24 * 60 * 60
    );

    res.cookie('session', sessionId, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server login error' });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies?.session;
    await redis.del(`session-${sessionId}`);
    res.clearCookie(`session`);
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    return res.status(500).json({ message: `logout error: ${error}` });
  }
};

export const updateUserPayment = async (req, res) => {
  try {
    const { userId, plan, credits } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent downgrades and re-purchases of same or lower tier
    const planHierarchy = { free: 0, starter: 1, pro: 2 };
    const currentTier = planHierarchy[user.plan] || 0;
    const newTier = planHierarchy[plan] || 0;

    if (newTier <= currentTier) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan upgrade. You can only upgrade to a higher tier.',
      });
    }

    // Prevent credit stacking — reset to new plan's full credits
    user.plan = plan;
    user.credits = credits;
    user.totalCredits = credits;
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    // Update all active sessions for this user
    const sessionKeys = await redis.keys('session-*');
    for (const key of sessionKeys) {
      const sessionData = await redis.get(key);
      if (!sessionData) continue;

      const parsed = JSON.parse(sessionData);
      if (parsed.userId === userId.toString()) {
        parsed.plan = user.plan;
        parsed.credits = user.credits;
        parsed.totalCredits = user.totalCredits;
        parsed.planExpiresAt = user.planExpiresAt;
        await redis.set(key, JSON.stringify(parsed), 'EX', 7 * 24 * 60 * 60);
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Update user payment error:', error);
    return res.status(500).json({
      success: false,
      message: `Update user payment error: ${error.message}`,
    });
  }
};

export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;
    const COST = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 10,
      ppt: 10,
      vision: 10,
    };

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const requiredCredits = COST[agent] || 1;
    if (user.credits < requiredCredits) {
      return res.status(400).json({
        success: false,
        message: 'Not enough credits.',
      });
    }

    user.credits -= requiredCredits;
    await user.save();

    // Update all sessions for this user
    const sessionKeys = await redis.keys('session-*');
    for (const key of sessionKeys) {
      const sessionData = await redis.get(key);
      if (!sessionData) continue;

      const parsed = JSON.parse(sessionData);
      if (parsed.userId === userId.toString()) {
        parsed.credits = user.credits;
        await redis.set(key, JSON.stringify(parsed), 'EX', 7 * 24 * 60 * 60);
      }
    }

    return res.json({
      success: true,
      credits: user.credits,
    });
  } catch (error) {
    console.error('Deduct credits error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
