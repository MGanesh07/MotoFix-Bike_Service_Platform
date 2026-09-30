const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getMe, updateProfile } = require('../controllers/authController');
const { getBikes, addBike, getBikeById, updateBike, deleteBike } = require('../controllers/bikeController');
const { getAvailability } = require('../controllers/availabilityController');
const { createBooking, getBookings, getBookingById, cancelBooking } = require('../controllers/bookingController');
const { getDashboardStats, updateStatus, extendEstimatedTime } = require('../controllers/mechanicController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Auth Routes
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/me', protect, getMe);
router.put('/auth/profile', protect, updateProfile);

// Bike Routes
router.route('/bikes')
  .get(protect, getBikes)
  .post(protect, authorizeRoles('customer'), addBike);
router.route('/bikes/:id')
  .get(protect, getBikeById)
  .put(protect, authorizeRoles('customer'), updateBike)
  .delete(protect, authorizeRoles('customer'), deleteBike);

// Availability
router.get('/availability', getAvailability);

// Bookings Routes
router.route('/bookings')
  .get(protect, getBookings)
  .post(protect, authorizeRoles('customer'), createBooking);
router.route('/bookings/:id')
  .get(protect, getBookingById);
router.put('/bookings/:id/cancel', protect, authorizeRoles('customer'), cancelBooking);

// Mechanic Routes
router.get('/mechanic/dashboard', protect, authorizeRoles('mechanic'), getDashboardStats);
router.put('/mechanic/bookings/:id/status', protect, authorizeRoles('mechanic'), updateStatus);
router.put('/mechanic/bookings/:id/extend', protect, authorizeRoles('mechanic'), extendEstimatedTime);

// Inventory
const { getInventory, addInventoryItem, restockItem } = require('../controllers/inventoryController');
router.route('/inventory')
  .get(protect, authorizeRoles('mechanic'), getInventory)
  .post(protect, authorizeRoles('mechanic'), addInventoryItem);
router.put('/inventory/:id/restock', protect, authorizeRoles('mechanic'), restockItem);

// Bills
const { generateBill, getBillByBooking, markBillPaid } = require('../controllers/billController');
router.post('/bills', protect, authorizeRoles('mechanic'), generateBill);
router.get('/bills/booking/:bookingId', protect, getBillByBooking);
router.put('/bills/:id/pay', protect, authorizeRoles('mechanic'), markBillPaid);

// Additional Repairs
const { requestAdditionalRepair, respondToRepair } = require('../controllers/additionalRepairController');
router.post('/additional-repairs', protect, authorizeRoles('mechanic'), requestAdditionalRepair);
router.put('/additional-repairs/:id/respond', protect, authorizeRoles('customer'), respondToRepair);

// Notifications
const { getNotifications, markAsRead } = require('../controllers/notificationController');
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markAsRead);

// Reviews
const { createReview, getReviews } = require('../controllers/reviewController');
router.post('/reviews', protect, authorizeRoles('customer'), createReview);
router.get('/reviews', protect, authorizeRoles('mechanic'), getReviews);

module.exports = router;
