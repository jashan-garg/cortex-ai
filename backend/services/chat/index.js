import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import router from './routes/chat.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());
app.use((req, res, next) => {
  console.log('Incoming path:', req.method, req.originalUrl);
  next();
});

app.use('/', router);
app.get('/', (req, res) => {
  res.send('Chat server');
});

app.listen(PORT, () => {
  console.log(`Chat server is running on port ${PORT}`);
  connectDB();
});
