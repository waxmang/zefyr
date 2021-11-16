const express = require('express');
const { check, validationResult } = require('express-validator');

const config = require('config');
const Closet = require('../../models/closet/Closet');
const Item = require('../../models/closet/Item');
const Category = require('../../models/closet/Category');
const jwtAuth = require('../../middleware/jwtAuth');

const router = express.Router();

// @route   POST api/categories
// @desc    Add category to current user's closet
// @access  Private
router.post('/', jwtAuth, async (req, res) => {
  try {
    let closet = await Closet.findOne({ user: req.user.id });

    if (closet) {
      const categoryFields = {
        closet: closet.id,
        items: [],
        name: req.body.name,
      };

      const newCategory = new Category(categoryFields);

      const category = await newCategory.save();
      const newCategories = [...closet.categories, category.id];

      await Closet.findByIdAndUpdate(closet.id, {
        $set: { categories: newCategories },
      });

      res.json(category);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/:categoryId', jwtAuth, async (req, res) => {
  const { categoryId } = req.params;

  try {
    const categoryFields = {
      items: req.body.items,
      name: req.body.name,
    };

    // Remove null values from itemFields
    Object.keys(categoryFields).forEach(
      (k) => !categoryFields[k] && delete categoryFields[k]
    );

    const category = await Category.findByIdAndUpdate(categoryId, {
      $set: categoryFields,
    });

    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/', jwtAuth, async (req, res) => {
  try {
    const closet = await Closet.findOne({ user: req.user.id });
    const categoryIds = closet.categories;

    const categories = await Category.find({ _id: categoryIds }).populate({
      path: 'items',
      model: Item,
    });

    const sortedCategories = categoryIds.map((id) =>
      categories.find((category) => {
        return id.toString() === category._id.toString();
      })
    );

    res.json(sortedCategories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:categoryId', jwtAuth, async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await Category.findById(categoryId);
    const closet = await Closet.findOne({ user: req.user.id });

    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    // Check user
    if (category.closet.toString() !== closet.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await category.remove();

    // Remove category from closet
    const newCategories = [...closet.categories];
    newCategories.splice(newCategories.indexOf(categoryId), 1);
    await Closet.findByIdAndUpdate(closet.id, { categories: newCategories });

    res.json({ msg: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
