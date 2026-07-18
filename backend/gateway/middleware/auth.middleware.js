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
    next();
  } catch (error) {
    return res.status(500).json({ message: `Authentication server error.` });
  }
};

export default protect;
