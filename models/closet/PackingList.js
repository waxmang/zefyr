const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClosetSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  closet: {
    type: Schema.Types.ObjectId,
    ref: 'closets',
  },
  items: [
    {
      type: Schema.Types.ObjectId,
      ref: 'items',
    },
  ],
});

module.exports = Closet = mongoose.model('packinglist', ClosetSchema);
