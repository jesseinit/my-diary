import express from 'express';
import diaries from '../../config/db';

const router = express.Router();

router.get('/entries', (req, res) => {
  res.status(200).send(diaries);
});

router.get('/entries/:id', (req, res) => {
  const diary = diaries.find(d => d.id === parseInt(req.params.id));
  if (!diary) {
    res.status(404).send({ status: 404, message: 'Diary post not found' });
  }
  res.send(diary);
});

export default router;
