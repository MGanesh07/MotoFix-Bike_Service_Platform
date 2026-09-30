const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    laborCharges: {
      type: Number,
      default: 0
    },
    parts: [
      {
        inventoryItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'InventoryItem'
        },
        name: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number
      }
    ],
    subtotal: {
      type: Number,
      required: true
    },
    taxRate: {
      type: Number,
      default: 18 // 18% GST
    },
    taxAmount: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI / QR', 'Card', 'NetBanking', 'Pending'],
      default: 'Pending'
    },
    paidAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Bill', billSchema);
