const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    brand: {
      type: String,
      required: [true, 'Please provide bike brand (e.g. Yamaha, Honda, Royal Enfield)']
    },
    model: {
      type: String,
      required: [true, 'Please provide bike model (e.g. R15 V4, Activa 6G, Classic 350)']
    },
    registrationNumber: {
      type: String,
      required: [true, 'Please provide bike registration number'],
      uppercase: true,
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Please provide manufacturing year']
    },
    image: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'Black'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Bike', bikeSchema);
