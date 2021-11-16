const mongoose = require('mongoose');

const TripSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  links: [{ type: String }],
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  steps: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'steps',
    },
  ],
  sharedReadUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  sharedEditUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  packingLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'packing' }],
});

module.exports = Trip = mongoose.model('trip', TripSchema);
