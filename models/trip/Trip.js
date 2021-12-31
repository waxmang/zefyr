const mongoose = require('mongoose');

const TripSchema = mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users'
	},
	name: {
		type: String,
		default: ''
	},
	description: {
		type: String,
		default: ''
	},
	links: [ { name: String, url: String } ],
	startDate: {
		type: String,
		default: ''
	},
	endDate: {
		type: String,
		default: ''
	},
	steps: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'steps'
		}
	],
	sharedReadUsers: [ { type: mongoose.Schema.Types.ObjectId, ref: 'users' } ],
	sharedEditUsers: [ { type: mongoose.Schema.Types.ObjectId, ref: 'users' } ],
	packingLists: [ { type: mongoose.Schema.Types.ObjectId, ref: 'packing' } ]
});

module.exports = Trip = mongoose.model('trip', TripSchema);
