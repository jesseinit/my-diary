import { body, param, validationResult } from 'express-validator/check';

const signUp = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .isLength({ max: 100 }),
  body('fullname')
    .isLength({ min: 2 })
    .withMessage('Fullname should contain at least two characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password should contain atleast 6 characters')
];

const logIn = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .isLength({ max: 100 })
    .withMessage('Please enter a email less than 100 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password should contain atleast 6 characters')
];

const params = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid Parameter Passed')
];

const post = [
  body('title')
    .isLength({ max: 100 })
    .withMessage('Title should not exceed 100 Characters')
];

const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: errors.array().map(error => error.msg) });
  } else {
    next();
  }
};

const validations = { signUp, logIn, params, post, validationHandler };

export default validations;
