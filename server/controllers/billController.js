const Bill = require('../models/Bill');
const Booking = require('../models/Booking');
const InventoryItem = require('../models/InventoryItem');
const InventoryTransaction = require('../models/InventoryTransaction');
const Notification = require('../models/Notification');
const AdditionalRepair = require('../models/AdditionalRepair');

// Helper to generate invoice number
const generateInvoiceNo = () => {
  return 'INV-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
};

// @desc    Generate Bill for a service
// @route   POST /api/bills
// @access  Private (Mechanic)
const generateBill = async (req, res) => {
  try {
    const { bookingId, laborCharges, partsUsed } = req.body;
    // partsUsed = [{ inventoryItemId, quantity }]

    const booking = await Booking.findById(bookingId).populate('customerId').populate('bikeId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify service status is Completed
    if (booking.status !== 'Completed') {
      return res.status(400).json({ message: 'Final bill can only be generated after the service is completed.' });
    }

    // Check if bill already exists
    const existingBill = await Bill.findOne({ bookingId });
    if (existingBill) {
      return res.status(400).json({ message: 'Bill already generated for this service', bill: existingBill });
    }

    let partsTotal = 0;
    const billParts = [];
    const itemsToUpdate = [];

    // Process parts used - validation and calculation phase
    if (partsUsed && partsUsed.length > 0) {
      for (const part of partsUsed) {
        const item = await InventoryItem.findById(part.inventoryItemId);
        if (!item) continue;
        
        if (item.quantity < part.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
        }

        const partTotal = item.unitPrice * part.quantity;
        partsTotal += partTotal;

        billParts.push({
          inventoryItemId: item._id,
          name: item.name,
          quantity: part.quantity,
          unitPrice: item.unitPrice,
          totalPrice: partTotal
        });

        itemsToUpdate.push({
          item,
          quantityUsed: part.quantity
        });
      }
    }

    // Add approved additional repairs to bill
    const additionalRepairs = await AdditionalRepair.find({ bookingId, status: 'approved' });
    let additionalLabor = 0;
    
    for (const addRep of additionalRepairs) {
      additionalLabor += addRep.estimatedCost;
    }

    const finalLabor = Number(laborCharges) + additionalLabor;
    const subtotal = finalLabor + partsTotal;
    const taxRate = 18; // 18% GST
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    // Create the bill first
    const bill = await Bill.create({
      invoiceNumber: generateInvoiceNo(),
      bookingId: booking._id,
      customerId: booking.customerId._id,
      laborCharges: finalLabor,
      parts: billParts,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      status: 'pending'
    });

    // Now deduct stock and create transactions since bill creation succeeded
    for (const update of itemsToUpdate) {
      update.item.quantity -= update.quantityUsed;
      await update.item.save();

      await InventoryTransaction.create({
        inventoryItemId: update.item._id,
        bookingId: booking._id,
        type: 'used',
        quantity: update.quantityUsed,
        note: `Used in service ${booking.bookingCode}`
      });
    }

    // Notify customer
    await Notification.create({
      userId: booking.customerId._id,
      title: 'Bill Generated',
      message: `The bill for your service on ${booking.bikeId.brand} is ready. Total: ₹${totalAmount.toFixed(2)}`,
      type: 'bill',
      bookingId: booking._id
    });

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bill by booking ID
// @route   GET /api/bills/booking/:bookingId
// @access  Private
const getBillByBooking = async (req, res) => {
  try {
    const bill = await Bill.findOne({ bookingId: req.params.bookingId });
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark bill as paid
// @route   PUT /api/bills/:id/pay
// @access  Private (Mechanic)
const markBillPaid = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const bill = await Bill.findById(req.params.id);
    
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    
    bill.status = 'paid';
    bill.paymentMethod = paymentMethod || 'Cash';
    bill.paidAt = Date.now();
    await bill.save();

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateBill,
  getBillByBooking,
  markBillPaid
};
