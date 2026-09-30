const Booking = require('../models/Booking');
const User = require('../models/User');
const { calculateSlotsForDate } = require('../utils/availabilityHelper');

// @desc    Get mechanic availability and slot schedule for a specific date
// @route   GET /api/availability?date=YYYY-MM-DD
// @access  Public or Private
const getAvailability = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const dateStr = req.query.date || todayStr;

    // Find assigned mechanic (e.g. Master Mechanic)
    const mechanic = await User.findOne({ role: 'mechanic' });

    if (!mechanic) {
      return res.status(404).json({ message: 'No mechanic available in system' });
    }

    // Fetch existing non-cancelled bookings for this date
    const existingBookings = await Booking.find({
      date: dateStr,
      status: { $nin: ['Cancelled', 'Rejected'] }
    })
      .populate('customerId', 'name phone')
      .populate('bikeId', 'brand model registrationNumber');

    // Calculate slots dynamically
    const slots = calculateSlotsForDate(dateStr, existingBookings);

    res.json({
      date: dateStr,
      mechanic: {
        _id: mechanic._id,
        name: mechanic.name,
        specialty: mechanic.specialty,
        phone: mechanic.phone
      },
      slots
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailability
};
