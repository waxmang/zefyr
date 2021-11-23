const mongoose = require('mongoose');

const StepSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'trips',
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  travelMode: {
    type: String,
  },
  gpxFilename: {
    type: 'String',
  },
  gpxHash: {
    type: 'Buffer',
  },
});

module.exports = Step = mongoose.model('step', StepSchema);
