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

router.post('/entries', (req, res) => {
  if (!req.body.post || req.body.post.length < 2) {
    res.status(400).send({ status: 400, message: 'Oops - Bad Request' });
  }
  const diary = {
    id: diaries.length + 1,
    post: req.body.post
  };
  diaries.push(diary);
  res.status(201).send(diaries);
});

export default router;
