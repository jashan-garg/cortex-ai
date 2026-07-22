import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import router from './routes/agent.route.js';
import nodeFetch from 'node-fetch';
global.fetch = nodeFetch;
const app = express();
const PORT = process.env.PORT || 8003;

app.use(express.json());
app.use('/', router);

app.use((err, req, res, next) => {
  console.log(err);
  if (err.status) return res.status(err.status).json(err.data);
  return res.status(500).json(`Internal server error`);
});

app.get('/', (req, res) => {
  res.send('Agent server');
});

app.listen(PORT, () => {
  console.log(`Agent server is running on port ${PORT}`);
  connectDB();
});
