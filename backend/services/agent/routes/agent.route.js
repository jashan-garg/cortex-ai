import { Router } from 'express';
import { agent, getPdf } from '../controllers/agent.controller.js';

const router = Router();

router.post('/chat', agent);
router.get('/get-pdf/:key', getPdf);

export default router;
