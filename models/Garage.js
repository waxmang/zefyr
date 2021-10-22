const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GarageSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'categories',
    },
  ],
  sharedUsers: [{ type: Schema.Types.ObjectId, ref: 'users' }],
});

module.exports = Garage = mongoose.model('garage', GarageSchema);
