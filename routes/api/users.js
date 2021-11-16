const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const config = require('config');
const User = require('../../models/User');
const Closet = require('../../models/closet/Closet');

const router = express.Router();

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').isLength({ min: 6 }),
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        name,
        email,
        password,
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

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

      // Create new empty Closet when user registers
      const closet = new Closet({
        user: user.id,
        categories: [],
        sharedUsers: [user.id],
      });

      await closet.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/users/:emailAddress
// @desc    Find user by email address
// @access  Public
router.get('/', async (req, res) => {
  const { email } = req.query;
  console.log(email);
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: 'Email address does not exist' });
    } else {
      res.json(user);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
