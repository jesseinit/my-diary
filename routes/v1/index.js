import express from 'express';
import diaries from '../../config/db';

const router = express.Router();

router.get('/entries', (req, res) => {
  res.status(200).send(diaries);
});

export default router;
