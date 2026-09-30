const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      unique: true,
      required: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mechanicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bikeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bike',
      required: true
    },
    serviceRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest'
    },
    serviceType: {
      type: String,
      required: true
    },
    problemDescription: {
      type: String,
      required: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    day: {
      type: String, // e.g. Tuesday
      required: true
    },
    startTime: {
      type: String, // e.g. 11:00 AM or 11:00
      required: true
    },
    endTime: {
      type: String, // e.g. 12:00 PM or 12:00
      required: true
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Bike Received',
        'Inspection',
        'Waiting for Approval',
        'Repairing',
        'Quality Check',
        'Ready for Delivery',
        'Completed',
        'Cancelled',
        'Rejected'
      ],
      default: 'Confirmed'
    },
    estimatedCompletionTime: {
      type: String, // ISO String or HH:mm formatted time
      default: ''
    },
    actualStartTime: {
      type: Date
    },
    actualEndTime: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    notes: {
      type: String,
      default: ''
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
