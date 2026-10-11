const { body, validationResult } = require('express-validator');

exports.rules = {
  name: body('name').trim().isLength({ min: 10, max: 60 }).withMessage('Name must be 10-60 characters'),
  email: body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  address: body('address').trim().isLength({ min: 1, max: 400 }).withMessage('Address is required (max 400 characters)'),
  password: (field = 'password') =>
    body(field)
      .isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 characters')
      .matches(/[A-Z]/).withMessage('Password needs at least one uppercase letter')
      .matches(/[^A-Za-z0-9]/).withMessage('Password needs at least one special character'),
};

exports.check = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((e) => e.msg);
  res.status(400).json({ message: errors[0], errors });
};
