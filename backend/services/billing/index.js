import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import router from './routes/billing.route.js';

const app = express();
const PORT = process.env.PORT || 8004;

app.use(express.json());
app.use((req, res, next) => {
  console.log('Incoming path:', req.method, req.originalUrl);
  next();
});
app.use('/', router);

app.get('/', (req, res) => {
  res.send('Billing server');
});

app.listen(PORT, () => {
  console.log(`Billing server is running on port ${PORT}`);
  connectDB();
});
