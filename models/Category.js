const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new mongoose.Schema({
  closet: {
    type: Schema.Types.ObjectId,
    ref: 'closets',
  },
  items: [{ type: Schema.Types.ObjectId, ref: 'items' }],
  name: {
    type: String,
    default: '',
  },
});

module.exports = Category = mongoose.model('category', CategorySchema);
