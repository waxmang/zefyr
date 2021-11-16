const express = require('express');
const { check, validationResult } = require('express-validator');

const config = require('config');
const Step = require('../../models/trip/Step');
const Trip = require('../../models/trip/Trip');
const jwtAuth = require('../../middleware/jwtAuth');

const router = express.Router({ mergeParams: true });

// @route   POST api/trips/:tripId/steps
// @desc    Create new step
// @access  Private
router.post('/', jwtAuth, async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);

    if (
      !(
        req.user.id === trip.user.toString() ||
        trip.sharedEditUsers.includes(req.user.id)
      )
    ) {
      return res
        .status(401)
        .json({ errors: 'User does not have edit permissions' });
    }

    const stepFields = {
      user: req.user.id,
      trip: tripId,
      name: req.body.name,
      description: req.body.description,
      start: req.body.start,
      end: req.body.end,
      travelMode: req.body.travelMode,
      gpxFile: req.body.gpxFile,
    };

    // Remove null values from itemFields
    Object.keys(stepFields).forEach(
      (k) => !stepFields[k] && delete stepFields[k]
    );

    // Create a new item associated with the closet ID
    const newStep = new Step(stepFields);

    const step = await newStep.save();

    const newTripSteps = [...trip.steps, newStep._id];

    await Trip.findByIdAndUpdate(tripId, {
      steps: newTripSteps,
    });

    res.json(step);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/trips/:tripId/steps/:stepId
// @desc    Modify step
// @access  Private
router.put('/:stepId', jwtAuth, async (req, res) => {
  const { tripId, stepId } = req.params;

  try {
    const trip = await Trip.findById(tripId);

    // Check if user has edit permissions
    if (
      !(
        req.user.id === trip.user.toString() ||
        trip.sharedEditUsers.includes(req.user.id)
      )
    ) {
      return res
        .status(401)
        .json({ errors: 'User does not have edit permissions' });
    }

    const stepFields = {
      name: req.body.name,
      description: req.body.description,
      start: req.body.start,
      end: req.body.end,
      travelMode: req.body.travelMode,
      gpxFile: req.body.gpxFile,
    };

    // Remove null values from tripFields
    Object.keys(stepFields).forEach(
      (k) => !stepFields[k] && delete stepFields[k]
    );

    const step = await Step.findByIdAndUpdate(stepId, {
      $set: stepFields,
    });

    res.json(step);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:tripId/steps/:stepId', jwtAuth, async (req, res) => {
  const { tripId, stepId } = req.params;

  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ msg: 'Trip not found' });
    }

    // Check user
    if (trip.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const step = await Step.findById(stepId);

    if (!step) {
      return res.status(404).json({ msg: 'Step not found' });
    }

    await step.remove();

    res.json({ msg: 'Step removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Step not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
