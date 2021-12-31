const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PackingListSchema = new mongoose.Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	},
	name: {
		type: Schema.Types.String
	},
	closet: {
		type: Schema.Types.ObjectId,
		ref: 'closets'
	},
	items: [
		{
			type: Schema.Types.ObjectId,
			ref: 'items'
		}
	]
});

module.exports = PackingList = mongoose.model('packinglist', PackingListSchema);
