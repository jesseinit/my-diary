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
  if (!req.body) {
    res.status(400).send({ err: 'Oops - Bad Request' });
  }
  const diary = {
    id: diaries.length + 1,
    post: req.body.post.trim()
  };
  diaries.push(diary);
  res.status(201).send(diaries);
});

router.put('/entries/:id', (req, res) => {
  if (
    req.body.length === 0 ||
    !req.body.post ||
    req.body.post.length < 2 ||
    req.body.post.match(/^ *$/)
  ) {
    res.status(400).send({ status: 400, message: 'Oops - Bad Request' });
  }
  const diary = diaries.find(d => d.id === parseInt(req.params.id));
  if (!diary) {
    res.status(404).send({ status: 404, message: 'Diary post not found' });
    return;
  }
  diary.post = req.body.post.trim();
  res.status(200).send(diaries);
});

export default router;
