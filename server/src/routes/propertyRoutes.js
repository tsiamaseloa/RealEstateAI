const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// CREATE a new property
router.post('/', async (req, res) => {
  try {
    const property = new Property(req.body);
    const saved = await property.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all properties
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ a single property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a property by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // return updated doc + validate schema
    );
    if (!updatedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(updatedProperty);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a property by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

