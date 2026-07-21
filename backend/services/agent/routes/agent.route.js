import { Router } from 'express';
import { agent, getPdf, getPpt } from '../controllers/agent.controller.js';
import multer from '../config/multer.js';

const router = Router();

router.post('/chat', multer.single('file'), agent);
router.get('/get-pdf/:key', getPdf);
router.get('/get-ppt/:key', getPpt);

export default router;
