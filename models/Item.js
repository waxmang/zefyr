const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new mongoose.Schema({
  garage: {
    type: Schema.Types.ObjectId,
    ref: 'garages',
  },
  name: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
  },
  weight: {
    type: Number,
    default: undefined,
  },
  unit: {
    type: String,
    required: true,
    default: 'oz',
  },
});

module.exports = Item = mongoose.model('item', ItemSchema);
