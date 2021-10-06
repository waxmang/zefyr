const bcrypt = require('bcryptjs');
const config = require('config');
const express = require('express');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const jwtAuth = require('../../middleware/jwtAuth');
const User = require('../../models/User');

const router = express.Router();

// @route   GET api/auth
// @desc    Test route
// @access  Private
router.get('/', jwtAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth
// @desc    Authenticate a user and get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(401)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Compare password with user password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
