import express from 'express';
import diaries from '../../config/db';

const router = express.Router();

router.get('/entries', (req, res) => {
  res.status(200).send(diaries);
});

router.get('/entries/:id', (req, res) => {
  const diary = diaries.find(d => d.id === parseInt(req.params.id));

  if (!diary) {
    res.status(404).send({ message: 'Dairy story not found' });
  }

  res.status(404).send(diary);
});

router.post('/entries', (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: 'Oops - Bad Request' });
  }
  const diary = {
    id: diaries.length + 1,
    post: req.body.post.trim()
  };
  diaries.push(diary);
  res.status(201).send(diaries);
});

router.put('/entries/:id', (req, res) => {
  const diary = diaries.find(story => story.id === parseInt(req.params.id));
  if (!diary) {
    res.status(404).send({ message: 'Diary story not found' });
    return;
  }
  diary.post = req.body.post.trim();
  res.status(200).send(diaries);
});

export default router;
