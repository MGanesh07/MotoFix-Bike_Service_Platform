const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    type: {
      type: String,
      enum: ['used', 'restock', 'adjustment'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    note: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
