const express = require('express');
const { check, validationResult } = require('express-validator');

const config = require('config');
const Garage = require('../../models/Garage');
const Item = require('../../models/Item');
const jwtAuth = require('../../middleware/jwtAuth');
const Category = require('../../models/Category');

const router = express.Router();

// @route   POST api/items
// @desc    Add item to current user's garage
// @access  Private
router.post('/', jwtAuth, async (req, res) => {
  try {
    let garage = await Garage.findOne({ user: req.user.id });
    // TODO: Add validation for category to make sure there is a value present and
    // the category exists
    let category = await Category.findById(req.body.category);

    if (garage) {
      const itemFields = {
        garage: garage.id,
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        weight: req.body.weight,
        unit: req.body.unit,
      };

      // Remove null values from itemFields
      Object.keys(itemFields).forEach(
        (k) => !itemFields[k] && delete itemFields[k]
      );

      // Create a new item associated with the garage ID
      const newItem = new Item(itemFields);

      const item = await newItem.save();

      const newItems = [...category.items, item.id];
      await Category.findByIdAndUpdate(category.id, {
        $set: { items: newItems },
      });

      res.json(item);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/items
// @desc    Modify item in user's garage
// @access  Private
router.put('/:itemId', jwtAuth, async (req, res) => {
  const { itemId } = req.params;

  try {
    const itemFields = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      weight: req.body.weight,
      unit: req.body.unit,
    };

    // Remove null values from itemFields
    Object.keys(itemFields).forEach(
      (k) => !itemFields[k] && delete itemFields[k]
    );

    const item = await Item.findByIdAndUpdate(itemId, {
      $set: itemFields,
    });

    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/items
// @desc    Get all user's items in their garage
// @access  Private
router.get('/', jwtAuth, async (req, res) => {
  try {
    const garage = await Garage.findOne({ user: req.user.id });

    const items = await Item.find({ garage: garage.id });

    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:itemId', jwtAuth, async (req, res) => {
  const { itemId } = req.params;

  try {
    const item = await Item.findById(itemId);
    const garage = await Garage.findOne({ user: req.user.id });

    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    // Check user
    if (item.garage.toString() !== garage.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await item.remove();

    res.json({ msg: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
