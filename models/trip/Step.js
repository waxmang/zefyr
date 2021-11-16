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
  start: {
    type: String,
  },
  end: {
    type: String,
  },
  travelMode: {
    type: String,
  },
  gpxFile: {
    type: 'Buffer',
  },
});

module.exports = Step = mongoose.model('step', StepSchema);
