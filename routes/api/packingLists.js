const express = require('express');
const { check, validationResult } = require('express-validator');

const Item = require('../../models/closet/Item');
const PackingList = require('../../models/closet/PackingList');
const jwtAuth = require('../../middleware/jwtAuth');

const router = express.Router();

// @route   POST api/packing-lists
// @desc    Create new packing list
// @access  Private
router.post('/', jwtAuth, async (req, res) => {
	try {
		const packingListFields = {
			user: req.user.id,
			name: req.body.name,
			items: []
		};

		// Create a new item associated with the closet ID
		const newPackingList = new PackingList(packingListFields);

		const packingList = await newPackingList.save();

		res.json(packingList);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   PUT api/packing-lists
// @desc    Modify packing list
// @access  Private
router.put('/:packingListId', jwtAuth, async (req, res) => {
	const { packingListId } = req.params;

	try {
		const oldPackingList = await PackingList.findById(packingListId);

		// Check if user has edit permissions
		if (!(req.user.id === oldPackingList.user.toString())) {
			return res.status(401).json({ msg: 'User does not have edit permissions' });
		}

		const packingListFields = {
			name: req.body.name,
			items: req.body.items
		};

		// Remove null values from tripFields
		Object.keys(packingListFields).forEach((k) => !packingListFields[k] && delete packingListFields[k]);

		const packingList = await PackingList.findByIdAndUpdate(packingListId, {
			$set: packingListFields
		});

		res.json(packingList);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   GET api/packing-lists
// @desc    Get all user's packing lists
// @access  Private
router.get('/', jwtAuth, async (req, res) => {
	try {
		const packingLists = await PackingList.find({ user: req.user.id });

		res.json(packingLists);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   GET api/packing-lists/:packingListId
// @desc    Get single packing list
// @access  Private
router.get('/:packingListId', jwtAuth, async (req, res) => {
	const { packingListId } = req.params;
	try {
		const packingList = await PackingList.findById(packingListId).populate({
			path: 'items',
			model: Item
		});

		if (!packingList) {
			return res.status(404).json({ msg: 'Packing List not found' });
		}

		res.json(packingList);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

router.delete('/:packingListId', jwtAuth, async (req, res) => {
	const { packingListId } = req.params;

	try {
		const packingList = await PackingList.findById(packingListId);

		if (!packingList) {
			return res.status(404).json({ msg: 'Packing List not found' });
		}

		// Check user
		if (packingList.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		await packingList.remove();

		res.json({ msg: 'Packing List removed' });
	} catch (err) {
		console.error(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Packing List not found' });
		}
		res.status(500).send('Server error');
	}
});

module.exports = router;
