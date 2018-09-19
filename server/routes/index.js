import express from 'express';
import User from '../controller/userController';
import Dairy from '../controller/diaryController';
import helper from '../helpers';

const router = express.Router();

router.post(
  '/auth/signup',
  helper.validateInput.signUp,
  helper.validateInput.validationHandler,
  User.signUp
);

router.post(
  '/auth/login',
  helper.validateInput.logIn,
  helper.validateInput.validationHandler,
  User.logIn
);

router.get('/entries/', helper.verifyAuthToken, Dairy.getAllEntries);

router.post(
  '/entries',
  helper.verifyAuthToken,
  helper.validateInput.post,
  helper.validateInput.validationHandler,
  Dairy.createNewEntry
);

router.get(
  '/entries/:id',
  helper.verifyAuthToken,
  helper.validateInput.params,
  helper.validateInput.validationHandler,
  Dairy.getSelectedEntries
);

router.put(
  '/entries/:id',
  helper.verifyAuthToken,
  helper.validateInput.params,
  helper.validateInput.validationHandler,
  Dairy.updateSelectedEntry
);

router.delete(
  '/entries/:id',
  helper.verifyAuthToken,
  helper.validateInput.params,
  helper.validateInput.validationHandler,
  Dairy.deleteSelectedEntry
);

router.get('/profile/', helper.verifyAuthToken, User.getProfile);
router.put('/profile/', helper.verifyAuthToken, User.updateProfile);

export default router;
