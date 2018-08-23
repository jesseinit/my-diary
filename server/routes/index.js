import express from 'express';
import diaries from '../config/db';
import user from '../controller/userController';
import helper from '../helpers';

const router = express.Router();

router.post(
  '/auth/signup',
  helper.validateInput.signUp,
  helper.validateInput.validationHandler,
  user.signUp
);

router.get('/entries', (req, res) => {
  res.status(200).send(diaries);
});

router.get('/entries/:id', (req, res) => {
  const diary = diaries.find(story => story.id === parseInt(req.params.id));

  if (!diary) {
    res.status(404).send({ err: 'Dairy story not found' });
  }

  res.status(404).send(diary);
});

router.post('/entries', (req, res) => {
  if (!req.body.title || !req.body.post) {
    res.status(400).send({ err: 'Oops - Bad Request' });
  }
  const diary = {
    id: diaries.length + 1,
    title: req.body.title.trim(),
    post: req.body.post.trim()
  };
  diaries.push(diary);
  res.status(201).send(diaries);
});

router.put('/entries/:id', (req, res) => {
  const diary = diaries.find(story => story.id === parseInt(req.params.id));
  if (!diary) {
    res.status(404).send({ err: 'Diary story not found' });
    return;
  }
  diary.title = req.body.title.trim();
  diary.post = req.body.post.trim();
  res.status(200).send(diaries);
});

export default router;
