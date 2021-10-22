const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new mongoose.Schema({
  garage: {
    type: Schema.Types.ObjectId,
    ref: 'garages',
  },
  items: [{ type: Schema.Types.ObjectId, ref: 'items' }],
  name: {
    type: String,
    default: '',
  },
});

module.exports = Category = mongoose.model('category', CategorySchema);
