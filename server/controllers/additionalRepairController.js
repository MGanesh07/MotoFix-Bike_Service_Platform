const AdditionalRepair = require('../models/AdditionalRepair');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc    Request additional repair
// @route   POST /api/additional-repairs
// @access  Private (Mechanic)
const requestAdditionalRepair = async (req, res) => {
  try {
    const { bookingId, description, estimatedCost, partsNeeded } = req.body;

    const booking = await Booking.findById(bookingId).populate('customerId').populate('bikeId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const repair = await AdditionalRepair.create({
      bookingId,
      description,
      estimatedCost,
      partsNeeded
    });

    // Pause service logic (optional workflow choice, we just notify)
    booking.statusHistory.push({
      status: booking.status,
      note: `Additional repair requested: ${description}`
    });
    await booking.save();

    // Notify customer
    await Notification.create({
      userId: booking.customerId._id,
      title: 'Additional Repair Approval Required',
      message: `Mechanic suggested an additional repair: ${description} for ₹${estimatedCost}. Please approve or reject.`,
      type: 'additional_repair',
      bookingId: booking._id
    });

    res.status(201).json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to additional repair
// @route   PUT /api/additional-repairs/:id/respond
// @access  Private (Customer)
const respondToRepair = async (req, res) => {
  try {
    const { status, note } = req.body; // 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const repair = await AdditionalRepair.findById(req.params.id).populate('bookingId');
    if (!repair) return res.status(404).json({ message: 'Repair request not found' });

    const booking = await Booking.findById(repair.bookingId._id);
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    repair.status = status;
    repair.customerResponseNote = note || '';
    await repair.save();

    booking.statusHistory.push({
      status: booking.status,
      note: `Additional repair "${repair.description}" was ${status.toUpperCase()} by customer.`
    });
    await booking.save();

    // Notify mechanic
    await Notification.create({
      userId: booking.mechanicId,
      title: `Additional Repair ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Customer ${status} the additional repair: ${repair.description}`,
      type: 'system',
      bookingId: booking._id
    });

    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requestAdditionalRepair,
  respondToRepair
};
