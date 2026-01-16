import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Chat room routes placeholder' }));

export default router;
