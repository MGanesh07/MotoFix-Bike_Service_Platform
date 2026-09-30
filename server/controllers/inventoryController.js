const InventoryItem = require('../models/InventoryItem');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private (Mechanic)
const getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find({}).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new inventory item
// @route   POST /api/inventory
// @access  Private (Mechanic)
const addInventoryItem = async (req, res) => {
  try {
    const { name, partNumber, category, quantity, minQuantity, unitPrice, location, image } = req.body;

    const existingItem = await InventoryItem.findOne({ partNumber });
    if (existingItem) {
      return res.status(400).json({ message: 'Part number already exists' });
    }

    const item = await InventoryItem.create({
      name, partNumber, category, quantity, minQuantity, unitPrice, location, image
    });

    if (quantity > 0) {
      await InventoryTransaction.create({
        inventoryItemId: item._id,
        type: 'restock',
        quantity,
        note: 'Initial stock'
      });
    }

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update stock (Restock)
// @route   PUT /api/inventory/:id/restock
// @access  Private (Mechanic)
const restockItem = async (req, res) => {
  try {
    const { addedQuantity, note } = req.body;
    
    if (!addedQuantity || addedQuantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.quantity += Number(addedQuantity);
    await item.save();

    await InventoryTransaction.create({
      inventoryItemId: item._id,
      type: 'restock',
      quantity: addedQuantity,
      note: note || 'Restock'
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInventory,
  addInventoryItem,
  restockItem
};
