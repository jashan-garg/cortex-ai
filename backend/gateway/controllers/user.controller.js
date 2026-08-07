import redis from '../../shared/redis/redis.js';

export const getCurrentUser = async (req, res) => {
  try {
    const sessionId = req.cookies?.session;
    if (!sessionId) return res.status(200).json(null);

    const session = await redis.get(`session-${sessionId}`);
    if (!session) {
      res.clearCookie('session', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      return res.status(200).json(null);
    }

    return res.status(200).json(JSON.parse(session));
  } catch (error) {
    return res.status(500).json({ message: `Error getting current user` });
  }
};
