const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/items (protected) — Create a new item
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;

    const item = new Item({
      itemName,
      description,
      type,
      location,
      date,
      contactInfo,
      postedBy: req.user.id,
    });

    const savedItem = await item.save();
    return res.status(201).json(savedItem);
  } catch (err) {
    console.error('Create item error:', err.message);
    return res.status(500).json({ message: 'Server error while creating item' });
  }
});

// GET /api/items/search?name=xyz (public) — Search items
// IMPORTANT: This route MUST be defined BEFORE GET /api/items/:id
router.get('/search', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const regex = new RegExp(name, 'i'); // case-insensitive
    const items = await Item.find({
      $or: [{ itemName: regex }, { description: regex }],
    })
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email');

    return res.status(200).json(items);
  } catch (err) {
    console.error('Search error:', err.message);
    return res.status(500).json({ message: 'Server error during search' });
  }
});

// GET /api/items (public) — Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find()
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email');

    return res.status(200).json(items);
  } catch (err) {
    console.error('Get all items error:', err.message);
    return res.status(500).json({ message: 'Server error while fetching items' });
  }
});

// GET /api/items/:id (public) — Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('postedBy', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    return res.status(200).json(item);
  } catch (err) {
    console.error('Get item by ID error:', err.message);
    return res.status(500).json({ message: 'Server error while fetching item' });
  }
});

// PUT /api/items/:id (protected) — Update an item
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Authorization check
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const { itemName, description, type, location, date, contactInfo } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { itemName, description, type, location, date, contactInfo },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    return res.status(200).json(updatedItem);
  } catch (err) {
    console.error('Update item error:', err.message);
    return res.status(500).json({ message: 'Server error while updating item' });
  }
});

// DELETE /api/items/:id (protected) — Delete an item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Authorization check
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete item error:', err.message);
    return res.status(500).json({ message: 'Server error while deleting item' });
  }
});

module.exports = router;
