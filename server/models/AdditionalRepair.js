const mongoose = require('mongoose');

const additionalRepairSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    description: {
      type: String,
      required: true
    },
    estimatedCost: {
      type: Number,
      required: true
    },
    partsNeeded: [
      {
        name: String,
        cost: Number
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    mechanicNote: {
      type: String,
      default: ''
    },
    customerResponseNote: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AdditionalRepair', additionalRepairSchema);
