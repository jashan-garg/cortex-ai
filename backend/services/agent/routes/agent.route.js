import { Router } from 'express';
import { agent, getPdf, getPpt } from '../controllers/agent.controller.js';

const router = Router();

router.post('/chat', agent);
router.get('/get-pdf/:key', getPdf);
router.get('/get-ppt/:key', getPpt);

export default router;
