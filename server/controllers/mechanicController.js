const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const InventoryItem = require('../models/InventoryItem');
const Bill = require('../models/Bill');
const { calculateSlotsForDate } = require('../utils/availabilityHelper');

// @desc    Get dashboard statistics for mechanic
// @route   GET /api/mechanic/dashboard
// @access  Private (Mechanic)
const getDashboardStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const todaysBookings = await Booking.find({
      date: todayStr,
      status: { $nin: ['Cancelled', 'Rejected'] }
    })
      .populate('customerId', 'name phone')
      .populate('bikeId', 'brand model registrationNumber');

    // Filter by statuses
    const pendingRequests = todaysBookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
    const completed = todaysBookings.filter(b => b.status === 'Completed').length;
    
    const activeJobs = todaysBookings.filter(b => 
      ['Bike Received', 'Inspection', 'Waiting for Approval', 'Repairing', 'Quality Check', 'Ready for Delivery'].includes(b.status)
    );
    
    const currentActiveJob = activeJobs.length > 0 ? activeJobs[0] : null;

    const daySlots = calculateSlotsForDate(todayStr, todaysBookings);
    const availableSlots = daySlots.filter(s => s.status === 'Available').length;
    const workingSlots = daySlots.filter(s => s.status === 'Working').length;

    // Inventory Alerts
    const lowStockItems = await InventoryItem.find({
      $expr: { $lte: ['$quantity', '$minQuantity'] }
    }).select('name partNumber quantity minQuantity');

    // Recent completions (last 5)
    const recentCompleted = await Booking.find({ status: 'Completed' })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('bikeId', 'brand model registrationNumber')
      .populate('customerId', 'name');

    res.json({
      todayStr,
      todaysBookings,
      stats: {
        totalToday: todaysBookings.length,
        pending: pendingRequests,
        completed,
        availableSlots,
        workingSlots,
        activeJobsCount: activeJobs.length
      },
      currentActiveJob,
      lowStockItems,
      recentCompleted
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update repair status
// @route   PUT /api/mechanic/bookings/:id/status
// @access  Private (Mechanic)
const updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('customerId')
      .populate('bikeId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const oldStatus = booking.status;
    booking.status = status;
    booking.statusHistory.push({
      status,
      note: note || `Status updated from ${oldStatus} to ${status}`
    });

    if (status === 'Repairing' && !booking.actualStartTime) {
      booking.actualStartTime = Date.now();
    } else if (status === 'Completed') {
      if (!booking.actualEndTime) booking.actualEndTime = Date.now();
      if (!booking.completedAt) booking.completedAt = Date.now();
      if (!booking.actualStartTime) booking.actualStartTime = Date.now();
    }

    await booking.save();

    // Notify customer
    await Notification.create({
      userId: booking.customerId._id,
      title: `Service Update: ${status}`,
      message: `Your bike ${booking.bikeId.brand} ${booking.bikeId.model} is now in status: ${status}. ${note || ''}`,
      type: 'repair_update',
      bookingId: booking._id
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Extend estimated completion time
// @route   PUT /api/mechanic/bookings/:id/extend
// @access  Private (Mechanic)
const extendEstimatedTime = async (req, res) => {
  try {
    const { newEstimatedTime, reason, force } = req.body; // e.g., 'YYYY-MM-DD HH:mm'

    if (!newEstimatedTime) {
      return res.status(400).json({ message: 'New estimated time is required' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('customerId')
      .populate('bikeId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Parse newEstimatedTime (assumes "YYYY-MM-DD HH:mm A" or similar)
    // To keep it simple, we'll extract the date part to find same-day bookings
    // format might be "2026-09-29 14:00" or similar.
    const datePart = newEstimatedTime.split(' ')[0];

    // Check for conflicts if not forced
    if (!force) {
      // Find bookings on the same date, for the same mechanic, that are not completed/cancelled
      const sameDayBookings = await Booking.find({
        date: datePart,
        mechanicId: booking.mechanicId,
        _id: { $ne: booking._id },
        status: { $nin: ['Completed', 'Cancelled', 'Rejected'] }
      });

      // Simple time comparison (lexicographical works if 24h format, but 12h AM/PM needs parsing)
      // Let's assume newEstimatedTime has format "YYYY-MM-DD HH:mm" (24h) or we convert.
      // Actually, since start/end times are like "10:00 AM", it's safer to compare using Date objects.
      const newEndTimeDate = new Date(newEstimatedTime);
      
      if (!isNaN(newEndTimeDate.getTime())) {
        for (const otherBooking of sameDayBookings) {
          // Construct start time date for the other booking
          const otherStartDate = new Date(`${otherBooking.date} ${otherBooking.startTime}`);
          if (!isNaN(otherStartDate.getTime())) {
             if (newEndTimeDate > otherStartDate && booking.status !== 'Completed') {
               // Conflict found! The extended time runs into the next booking.
               return res.status(409).json({
                 message: 'Schedule Conflict',
                 conflict: {
                   bookingCode: otherBooking.bookingCode,
                   time: `${otherBooking.startTime} - ${otherBooking.endTime}`
                 }
               });
             }
          }
        }
      }
    }

    const oldTime = booking.estimatedCompletionTime;
    booking.estimatedCompletionTime = newEstimatedTime;
    
    booking.statusHistory.push({
      status: booking.status,
      note: `Completion extended to ${newEstimatedTime}. Reason: ${reason || 'Technical delay'}`
    });

    await booking.save();

    // Notify customer
    await Notification.create({
      userId: booking.customerId._id,
      title: 'Service Extension',
      message: `The estimated completion time for your ${booking.bikeId.brand} has been updated to ${newEstimatedTime}.`,
      type: 'repair_update',
      bookingId: booking._id
    });

    // TODO in real system: Check for conflicts with subsequent bookings and notify mechanic if a cascade delay happens.
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  updateStatus,
  extendEstimatedTime
};
