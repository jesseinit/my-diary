import express from 'express';
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

router.put(
  '/entries/:id',
  helper.verifyAuthToken,
  helper.validateInput.params,
  helper.validateInput.validationHandler,
  diary.updateSelectedEntry
);

export default router;
