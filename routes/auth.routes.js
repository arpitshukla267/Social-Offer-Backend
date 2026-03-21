import express from 'express';
import { signUp, signIn, verifyToken } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.get('/verify', verifyToken);

export default router;
