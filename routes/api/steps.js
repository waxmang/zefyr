const express = require('express');
const { check, validationResult } = require('express-validator');
const multer = require('multer');

const config = require('config');
const Step = require('../../models/trip/Step');
const Trip = require('../../models/trip/Trip');
const jwtAuth = require('../../middleware/jwtAuth');
const azureStorage = require('../../utils/azure-storage');

const router = express.Router({ mergeParams: true });

// @route   POST api/trips/:tripId/steps
// @desc    Create new step
// @access  Private
router.post('/', jwtAuth, async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    console.log(trip);

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
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      travelMode: req.body.travelMode,
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
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      travelMode: req.body.travelMode,
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

// @route   PUT api/trips/:tripId/steps/:stepId
// @desc    Modify step
// @access  Private
router.put(
  '/:stepId/gpx',
  [jwtAuth, multer().single('gpxFile')],
  async (req, res) => {
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

      const containerClient = azureStorage.blobServiceClient.getContainerClient(
        process.env.CONTAINER_NAME
      );

      const gpxFile = req.file;
      const blobName = `${gpxFile.originalname}${new Date().toISOString()}`;
      // console.log('blobName', blobName);

      try {
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadBlobResponse = await blockBlobClient.upload(
          gpxFile.buffer,
          gpxFile.size
        );
        const step = await Step.findByIdAndUpdate(stepId, {
          gpxFilename: blobName,
          gpxHash: uploadBlobResponse.contentMD5,
        });
        res.json(step);
      } catch (err) {
        console.error('err:::', err);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.get('/:stepId/gpx', jwtAuth, async (req, res) => {
  const { tripId, stepId } = req.params;

  try {
    const trip = await Trip.findById(tripId);

    // Check if user has read permissions
    if (
      !(
        req.user.id === trip.user.toString() ||
        trip.sharedReadUsers.includes(req.user.id)
      )
    ) {
      return res
        .status(401)
        .json({ msg: 'User does not have read permissions' });
    }

    const step = await Step.findById(stepId);
    // if (step.hasOwnProperty('gpxFilename'));

    if (!step) {
      return res.status(404).json({ msg: 'Step not found' });
    }

    const { gpxFilename, gpxHash } = step;
    // console.log(step);

    try {
      const { contentMD5, fileContents } = await azureStorage.downloadFile(
        gpxFilename
      );

      // Only return file to user if the hash for the current step matches the hash of the file being requested
      if (!contentMD5.compare(gpxHash) === 0) {
        return res
          .status(401)
          .json({ msg: 'User does not have read permissions' });
      }

      res.json({ gpxFile: fileContents });
    } catch (error) {
      res.status(404).send('GPX file not found');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:stepId', jwtAuth, async (req, res) => {
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
