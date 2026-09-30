const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'A valid rating between 1 and 5 is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'Completed') {
      return res.status(400).json({ message: 'Can only review completed services' });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'You already reviewed this service' });
    }

    const review = await Review.create({
      bookingId,
      customerId: req.user._id,
      rating: Number(rating),
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews (for mechanic)
// @route   GET /api/reviews
// @access  Private (Mechanic)
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('customerId', 'name')
      .populate({
        path: 'bookingId',
        populate: { path: 'bikeId', select: 'brand model' }
      })
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getReviews
};
