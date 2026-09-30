const Booking = require('../models/Booking');
const Bike = require('../models/Bike');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AdditionalRepair = require('../models/AdditionalRepair');
const Bill = require('../models/Bill');
const Review = require('../models/Review');
const { calculateSlotsForDate } = require('../utils/availabilityHelper');

// Helper to generate unique booking code
const generateBookingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'MF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper for day name from date string YYYY-MM-DD
const getDayName = (dateStr) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(dateStr + 'T00:00:00');
  return days[d.getDay()];
};

// @desc    Create a new service booking
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res) => {
  try {
    const { bikeId, serviceType, problemDescription, date, startTime, endTime } = req.body;

    if (!bikeId || !serviceType || !problemDescription || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'All booking fields are required' });
    }

    // 1. Verify Bike belongs to customer
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    if (bike.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Selected bike does not belong to you' });
    }

    // 2. Prevent past date / past slot booking
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      return res.status(400).json({ message: 'Cannot book a slot for a past date' });
    }

    // 3. Find default mechanic
    const mechanic = await User.findOne({ role: 'mechanic' });
    if (!mechanic) {
      return res.status(404).json({ message: 'No mechanic available in system' });
    }

    // 4. Server Availability & Conflict Check (SERVER-SIDE VALIDATION)
    const existingBookings = await Booking.find({
      date,
      status: { $nin: ['Cancelled', 'Rejected'] }
    });

    const daySlots = calculateSlotsForDate(date, existingBookings);
    const targetSlot = daySlots.find((s) => s.startTime === startTime);

    if (!targetSlot) {
      return res.status(400).json({ message: 'Invalid time slot selected' });
    }

    if (targetSlot.status !== 'Available') {
      return res.status(400).json({
        message: `Slot ${startTime} - ${endTime} on ${date} is already ${targetSlot.status.toLowerCase()}. Please select an available slot.`
      });
    }

    // 5. Check if customer already has a conflicting booking for the SAME bike on the SAME day
    const customerSameBikeBooking = await Booking.findOne({
      customerId: req.user._id,
      bikeId,
      date,
      status: { $nin: ['Cancelled', 'Rejected', 'Completed'] }
    });

    if (customerSameBikeBooking) {
      return res.status(400).json({
        message: `You already have an active booking for this bike (${bike.brand} ${bike.model}) on ${date}`
      });
    }

    // 6. Create Booking
    const bookingCode = generateBookingCode();
    const dayName = getDayName(date);

    const booking = await Booking.create({
      bookingCode,
      customerId: req.user._id,
      mechanicId: mechanic._id,
      bikeId,
      serviceType,
      problemDescription,
      date,
      day: dayName,
      startTime,
      endTime,
      status: 'Confirmed',
      estimatedCompletionTime: `${date} ${endTime}`,
      statusHistory: [
        {
          status: 'Confirmed',
          note: 'Booking successfully confirmed by system'
        }
      ]
    });

    // 7. Send In-App Notifications
    // Customer Notification
    await Notification.create({
      userId: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your appointment for ${bike.brand} ${bike.model} (${bike.registrationNumber}) on ${date} at ${startTime} has been confirmed. Code: ${bookingCode}`,
      type: 'booking',
      bookingId: booking._id
    });

    // Mechanic Notification
    await Notification.create({
      userId: mechanic._id,
      title: 'New Service Booking',
      message: `New ${serviceType} booking by ${req.user.name} for ${bike.brand} ${bike.model} on ${date} at ${startTime}.`,
      type: 'booking',
      bookingId: booking._id
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('bikeId')
      .populate('mechanicId', 'name phone specialty');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user or mechanic bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
      if (req.query.bikeId) {
        query.bikeId = req.query.bikeId;
      }
    } else if (req.user.role === 'mechanic') {
      if (req.query.date) {
        query.date = req.query.date;
      }
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone')
      .populate('bikeId')
      .populate('mechanicId', 'name phone specialty')
      .sort({ createdAt: -1 })
      .lean();

    if (bookings.length > 0) {
      const bookingIds = bookings.map(b => b._id);
      
      // Fetch reviews (for customers)
      if (req.user.role === 'customer') {
        const reviews = await Review.find({ bookingId: { $in: bookingIds } }).lean();
        const reviewMap = {};
        reviews.forEach(r => reviewMap[r.bookingId.toString()] = r);
        bookings.forEach(b => {
          if (reviewMap[b._id.toString()]) b.review = reviewMap[b._id.toString()];
        });
      }

      // Fetch bills (for both customers and mechanics)
      const bills = await Bill.find({ bookingId: { $in: bookingIds } }).lean();
      const billMap = {};
      bills.forEach(b => billMap[b.bookingId.toString()] = b);
      bookings.forEach(b => {
        if (billMap[b._id.toString()]) b.bill = billMap[b._id.toString()];
      });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking by ID with all details
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('bikeId')
      .populate('mechanicId', 'name phone specialty');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      req.user.role === 'customer' &&
      booking.customerId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    // Fetch related additional repairs & bill if exists
    const additionalRepairs = await AdditionalRepair.find({ bookingId: booking._id });
    const bill = await Bill.findOne({ bookingId: booking._id });

    res.json({
      booking,
      additionalRepairs,
      bill
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Customer)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('bikeId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (['Completed', 'Repairing', 'Quality Check', 'Ready for Delivery'].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot cancel booking because repair is already in state: ${booking.status}`
      });
    }

    booking.status = 'Cancelled';
    booking.statusHistory.push({
      status: 'Cancelled',
      note: req.body.reason || 'Cancelled by customer'
    });

    await booking.save();

    // Notify mechanic
    const mechanic = await User.findOne({ role: 'mechanic' });
    if (mechanic) {
      await Notification.create({
        userId: mechanic._id,
        title: 'Booking Cancelled',
        message: `Booking ${booking.bookingCode} for ${booking.bikeId ? booking.bikeId.registrationNumber : 'bike'} was cancelled by customer.`,
        type: 'booking',
        bookingId: booking._id
      });
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};
