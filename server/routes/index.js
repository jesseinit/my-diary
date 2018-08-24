import express from 'express';
import diaries from '../config/db';
import user from '../controller/userController';
import diary from '../controller/diaryController';
import helper from '../helpers';

const router = express.Router();

router.post(
  '/auth/signup',
  helper.validateInput.signUp,
  helper.validateInput.validationHandler,
  user.signUp
);

router.post(
  '/auth/login',
  helper.validateInput.logIn,
  helper.validateInput.validationHandler,
  user.logIn
);

router.get('/entries', helper.verifyAuthToken, diary.getAllEntries);

router.get(
  '/entries/:id',
  helper.verifyAuthToken,
  helper.validateInput.params,
  helper.validateInput.validationHandler,
  diary.getSelectedEntries
);

router.post('/entries', helper.verifyAuthToken, diary.createNewEntry);

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
