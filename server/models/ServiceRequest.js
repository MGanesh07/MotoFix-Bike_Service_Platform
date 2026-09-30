const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bikeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bike',
      required: true
    },
    serviceType: {
      type: String,
      required: true,
      enum: [
        'General Service',
        'Oil Change',
        'Brake Repair',
        'Tyre Replacement',
        'Battery Problem',
        'Chain/Sprocket',
        'Engine Problem',
        'Electrical Problem',
        'Other'
      ]
    },
    description: {
      type: String,
      required: [true, 'Please provide problem description']
    },
    image: {
      type: String,
      default: ''
    },
    requestedDate: {
      type: String, // YYYY-MM-DD
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
