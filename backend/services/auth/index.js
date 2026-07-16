import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import router from './routes/auth.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());

app.use((req, res, next) => {
    console.log('Incoming path:', req.method, req.originalUrl);
    next();
});

app.use('/api/auth', router);

app.get('/', (req, res) => {
    res.send('Auth server');
});

app.listen(PORT, () => {
    console.log(`Auth server is running on port ${PORT}`);
    connectDB();
});
