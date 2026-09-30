const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide part name']
    },
    partNumber: {
      type: String,
      required: true,
      unique: true
    },
    category: {
      type: String,
      enum: ['Engine', 'Brakes', 'Oil & Fluids', 'Electrical', 'Tyres', 'Transmission/Chain', 'Body/General'],
      default: 'General'
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    minQuantity: {
      type: Number,
      default: 5
    },
    unitPrice: {
      type: Number,
      required: true
    },
    location: {
      type: String,
      default: 'Shelf A-1'
    },
    compatibleModels: [String]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
