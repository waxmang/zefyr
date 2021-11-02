const express = require('express');

const config = require('config');
const Closet = require('../../models/Closet');
const jwtAuth = require('../../middleware/jwtAuth');

const router = express.Router();

// @route   POST api/closet
// @desc    Update closet
// @access  Private
router.post('/', jwtAuth, async (req, res) => {
  try {
    let closet = await Closet.findOne({ user: req.user.id });

    if (closet) {
      closet = await Closet.findOneAndUpdate(
        { user: req.user.id },
        // { $set: { categories: req.body.categories } },
        { new: true }
      );
    }

    res.json(closet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/', jwtAuth, async (req, res) => {
  try {
    const closetFields = {
      categories: req.body.categories,
      sharedUsers: req.body.sharedUsers,
    };

    // Remove null values from itemFields
    Object.keys(closetFields).forEach(
      (k) => !closetFields[k] && delete closetFields[k]
    );

    const closet = await Closet.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: closetFields,
      }
    );

    res.json(closet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/closet
// @desc    Get a user's closet
// @access  Private
router.get('/', jwtAuth, async (req, res) => {
  try {
    const closet = await Closet.findOne({ user: req.user.id });

    res.json(closet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
