import redis from '../../shared/redis/redis.js';

const protect = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.session;
    if (!sessionId)
      return res.status(400).json({ message: `User is not authorized.` });
    const session = await redis.get(`session-${sessionId}`);
    if (!session)
      return res
        .status(400)
        .json({ message: `Session expired. Kindly Re-Login` });

    req.user = JSON.parse(session);
    res.cookie('session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      partitioned: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    next();
  } catch (error) {
    return res.status(500).json({ message: `Authentication server error.` });
  }
};

export default protect;
