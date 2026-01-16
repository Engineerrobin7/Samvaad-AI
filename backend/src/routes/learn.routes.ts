import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Learn routes placeholder' }));

export default router;
