const express = require('express');

const config = require('config');
const Garage = require('../../models/Garage');
const jwtAuth = require('../../middleware/jwtAuth');

const router = express.Router();

// @route   POST api/garage
// @desc    Update garage
// @access  Private
router.post('/', jwtAuth, async (req, res) => {
  try {
    let garage = await Garage.findOne({ user: req.user.id });

    if (garage) {
      garage = await Garage.findOneAndUpdate(
        { user: req.user.id },
        // { $set: { categories: req.body.categories } },
        { new: true }
      );
    }

    res.json(garage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/', jwtAuth, async (req, res) => {
  try {
    const garageFields = {
      categories: req.body.categories,
      sharedUsers: req.body.sharedUsers,
    };

    // Remove null values from itemFields
    Object.keys(garageFields).forEach(
      (k) => !garageFields[k] && delete garageFields[k]
    );

    const garage = await Garage.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: garageFields,
      }
    );

    res.json(garage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/garage
// @desc    Get a user's garage
// @access  Private
router.get('/', jwtAuth, async (req, res) => {
  try {
    const garage = await Garage.findOne({ user: req.user.id });

    res.json(garage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
