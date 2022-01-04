const express = require('express');
const { check, validationResult } = require('express-validator');

const Step = require('../../models/trip/Step');
const Trip = require('../../models/trip/Trip');
const PackingList = require('../../models/closet/PackingList');
const jwtAuth = require('../../middleware/jwtAuth');
const itemRouter = require('./steps');
// console.log(TEST);

const router = express.Router();

router.use('/:tripId/steps', itemRouter);

// @route   POST api/trips
// @desc    Create new trip
// @access  Private
router.post('/', jwtAuth, async (req, res) => {
  try {
    const tripFields = {
      user: req.user.id,
      name: req.body.name,
      description: req.body.description,
      links: req.body.links,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      steps: [],
      sharedReadUsers: [],
      sharedEditUsers: [],
      packingLists: [],
    };

    // Remove null values from itemFields
    Object.keys(tripFields).forEach(
      (k) => !tripFields[k] && delete tripFields[k]
    );

    // Create a new item associated with the closet ID
    const newTrip = new Trip(tripFields);

    const trip = await newTrip.save();

    res.json(trip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/trips
// @desc    Modify trip
// @access  Private
router.put('/:tripId', jwtAuth, async (req, res) => {
  const { tripId } = req.params;

  try {
    const oldTrip = await Trip.findById(tripId);

    // Check if user has edit permissions
    if (
      !(
        req.user.id === oldTrip.user.toString() ||
        oldTrip.sharedEditUsers.includes(req.user.id)
      )
    ) {
      return res
        .status(401)
        .json({ msg: 'User does not have edit permissions' });
    }

    const tripFields = {
      name: req.body.name,
      description: req.body.description,
      links: req.body.links,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      steps: req.body.steps,
      sharedReadUsers: req.body.sharedReadUsers,
      sharedEditUsers: req.body.sharedEditUsers,
      packingLists: req.body.packingLists,
    };

    // Remove null values from tripFields
    Object.keys(tripFields).forEach(
      (k) => !tripFields[k] && delete tripFields[k]
    );

    const trip = await Trip.findByIdAndUpdate(tripId, {
      $set: tripFields,
    });

    res.json(trip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/trips
// @desc    Get all user's trips that they either own or have read permissions for
// @access  Private
router.get('/', jwtAuth, async (req, res) => {
  try {
    const trips = await Trip.find({
      $or: [{ user: req.user.id }, { sharedReadUsers: { $in: [req.user.id] } }],
    });

    res.json(trips);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/trips/:tripId
// @desc    Get all user's trips that they either own or have read permissions for
// @access  Private
router.get('/:tripId', jwtAuth, async (req, res) => {
  const { tripId } = req.params;
  try {
    const trip = await Trip.findById(tripId)
      .populate({
        path: 'steps',
        model: Step,
      })
      .populate({
        path: 'packingLists',
        model: PackingList,
      });

    if (!trip) {
      return res.status(404).json({ msg: 'Trip not found' });
    }

    if (
      !(
        req.user.id === trip.user.toString() ||
        trip.sharedReadUsers.includes(req.user.id)
      )
    ) {
      return res.status(401).json({ msg: 'User does not have permissions' });
    }

    res.json(trip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:tripId', jwtAuth, async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ msg: 'Trip not found' });
    }

    // Check user
    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await trip.remove();

    res.json({ msg: 'Trip removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Trip not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
