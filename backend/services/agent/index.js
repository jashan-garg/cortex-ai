import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import router from './routes/agent.route.js';
import nodeFetch from 'node-fetch';
global.fetch = nodeFetch;
const app = express();
const PORT = process.env.PORT || 8003;

app.use(express.json());
app.use((req, res, next) => {
  console.log('Incoming path:', req.method, req.originalUrl);
  next();
});
app.use('/', router);

app.get('/', (req, res) => {
  res.send('Agent server');
});

app.listen(PORT, () => {
  console.log(`Agent server is running on port ${PORT}`);
  connectDB();
});
