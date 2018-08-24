import { body, param, validationResult } from 'express-validator/check';

const signUp = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('fullname')
    .isString()
    .isLength({ min: 2 })
    .withMessage('Fullname should contain at least two characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password should contain atleast 8 characters')
];

const logIn = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password should contain atleast 8 characters')
];

const params = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid Parameter Passed')
];

const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: errors.array().map(error => error.msg) });
  } else {
    next();
  }
};

const validations = { signUp, logIn, params, validationHandler };

export default validations;
