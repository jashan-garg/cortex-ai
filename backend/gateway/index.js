import express from 'express';
import dotenv from 'dotenv';
import proxy from 'express-http-proxy';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getCurrentUser } from './controllers/user.controller.js';
import protect from './middleware/auth.middleware.js';
import { proxyWithHeader } from './utils/proxyWithHeader.js';
import morgan from 'morgan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());

app.use(
  '/api/auth',
  proxy(process.env.AUTH_SERVICE, {
    proxyReqPathResolver: (req) => {
      return req.originalUrl;
    },
  })
);
app.use('/api/auth', proxy(process.env.AUTH_SERVICE));
app.use('/api/chat', protect, proxyWithHeader(process.env.CHAT_SERVICE));
app.use('/api/agent', protect, proxy(process.env.AGENT_SERVICE));
app.use('/api/billing', protect, proxyWithHeader(process.env.BILLING_SERVICE));
app.get('/api/me', protect, getCurrentUser);
app.get('/', (req, res) => {
  res.send('Gateway server');
});

app.listen(PORT, () => {
  console.log(`Gateway server is running on port ${PORT}`);
});
