const Bike = require('../models/Bike');
const Booking = require('../models/Booking');

// @desc    Get user bikes
// @route   GET /api/bikes
// @access  Private
const getBikes = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    }

    const bikes = await Bike.find(query).sort({ createdAt: -1 });

    // Populate service count & last service for each bike
    const bikesWithStats = await Promise.all(
      bikes.map(async (bike) => {
        const bookings = await Booking.find({ bikeId: bike._id }).sort({ createdAt: -1 });
        const completedBookings = bookings.filter((b) => b.status === 'Completed');
        const lastBooking = bookings.length > 0 ? bookings[0] : null;

        return {
          ...bike.toObject(),
          totalServices: completedBookings.length,
          lastServiceDate: lastBooking ? lastBooking.date : 'No service yet',
          activeBookingStatus: lastBooking && lastBooking.status !== 'Completed' && lastBooking.status !== 'Cancelled' ? lastBooking.status : null
        };
      })
    );

    res.json(bikesWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a bike
// @route   POST /api/bikes
// @access  Private (Customer)
const addBike = async (req, res) => {
  try {
    const { brand, model, registrationNumber, year, color, image } = req.body;

    if (!brand || !model || !registrationNumber || !year) {
      return res.status(400).json({ message: 'Brand, model, registration number, and year are required' });
    }

    const regUpper = registrationNumber.toUpperCase().trim();
    const existing = await Bike.findOne({ registrationNumber: regUpper });

    if (existing) {
      return res.status(400).json({ message: `Bike with registration number ${regUpper} is already registered` });
    }

    const bike = await Bike.create({
      customerId: req.user._id,
      brand,
      model,
      registrationNumber: regUpper,
      year: Number(year),
      color: color || 'Black',
      image: image || ''
    });

    res.status(201).json(bike);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single bike by ID
// @route   GET /api/bikes/:id
// @access  Private
const getBikeById = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }

    if (req.user.role === 'customer' && bike.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this bike' });
    }

    res.json(bike);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update bike
// @route   PUT /api/bikes/:id
// @access  Private (Customer)
const updateBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);

    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }

    if (bike.customerId.toString() !== req.user._id.toString() && req.user.role !== 'mechanic') {
      return res.status(403).json({ message: 'Not authorized to update this bike' });
    }

    bike.brand = req.body.brand || bike.brand;
    bike.model = req.body.model || bike.model;
    bike.registrationNumber = req.body.registrationNumber ? req.body.registrationNumber.toUpperCase().trim() : bike.registrationNumber;
    bike.year = req.body.year ? Number(req.body.year) : bike.year;
    bike.color = req.body.color || bike.color;
    if (req.body.image !== undefined) bike.image = req.body.image;

    const updatedBike = await bike.save();
    res.json(updatedBike);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete bike
// @route   DELETE /api/bikes/:id
// @access  Private (Customer)
const deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);

    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }

    if (bike.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this bike' });
    }

    // Check if bike has active service
    const activeBooking = await Booking.findOne({
      bikeId: bike._id,
      status: { $nin: ['Completed', 'Cancelled', 'Rejected'] }
    });

    if (activeBooking) {
      return res.status(400).json({
        message: 'Cannot delete bike while it has an active or scheduled service booking'
      });
    }

    await bike.deleteOne();
    res.json({ message: 'Bike removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBikes,
  addBike,
  getBikeById,
  updateBike,
  deleteBike
};
