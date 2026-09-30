const STANDARD_SLOTS = [
  { startTime: '09:00 AM', endTime: '10:00 AM', startHour: 9, endHour: 10 },
  { startTime: '10:00 AM', endTime: '11:00 AM', startHour: 10, endHour: 11 },
  { startTime: '11:00 AM', endTime: '12:00 PM', startHour: 11, endHour: 12 },
  { startTime: '12:00 PM', endTime: '01:00 PM', startHour: 12, endHour: 13 },
  { startTime: '01:00 PM', endTime: '02:00 PM', startHour: 13, endHour: 14 },
  { startTime: '02:00 PM', endTime: '03:00 PM', startHour: 14, endHour: 15 },
  { startTime: '03:00 PM', endTime: '04:00 PM', startHour: 15, endHour: 16 },
  { startTime: '04:00 PM', endTime: '05:00 PM', startHour: 16, endHour: 17 }
];

/**
 * Calculates slot availability for a given date
 * @param {String} dateStr - 'YYYY-MM-DD'
 * @param {Array} existingBookings - Mongoose booking documents for this date
 * @returns {Array} List of slots with state: 'Available' | 'Booked' | 'Working' | 'Completed'
 */
const calculateSlotsForDate = (dateStr, existingBookings) => {
  const now = new Date();
  // Format today's YYYY-MM-DD in local time
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentHourDecimal = now.getHours() + now.getMinutes() / 60;

  const isToday = dateStr === todayStr;
  const isPastDate = dateStr < todayStr;

  return STANDARD_SLOTS.map((slot) => {
    // Find matching booking for this slot
    const booking = existingBookings.find(
      (b) => b.startTime === slot.startTime && b.status !== 'Cancelled' && b.status !== 'Rejected'
    );

    let status = 'Available'; // Default GREEN
    let bookingDetails = null;

    if (booking) {
      bookingDetails = {
        _id: booking._id,
        bookingCode: booking.bookingCode,
        customerName: booking.customerId ? booking.customerId.name : 'Customer',
        customerPhone: booking.customerId ? booking.customerId.phone : '',
        bikeModel: booking.bikeId ? `${booking.bikeId.brand} ${booking.bikeId.model}` : 'Bike',
        registrationNumber: booking.bikeId ? booking.bikeId.registrationNumber : '',
        serviceType: booking.serviceType,
        problemDescription: booking.problemDescription,
        bookingStatus: booking.status,
        estimatedCompletionTime: booking.estimatedCompletionTime
      };

      if (booking.status === 'Completed') {
        status = 'Completed'; // GRAY
      } else if (
        isToday &&
        ['Bike Received', 'Inspection', 'Waiting for Approval', 'Repairing', 'Quality Check'].includes(booking.status) &&
        currentHourDecimal >= slot.startHour && currentHourDecimal < slot.endHour
      ) {
        // Working status ONLY IF date is today AND current time falls inside the slot hour AND repair is actively in progress
        status = 'Working'; // YELLOW
      } else {
        status = 'Booked'; // RED
      }
    } else if (isPastDate || (isToday && currentHourDecimal >= slot.endHour)) {
      // Slot in past with no booking is shown as Past / Completed
      status = 'Completed';
    }

    return {
      slotId: `${dateStr}_${slot.startHour}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      startHour: slot.startHour,
      endHour: slot.endHour,
      status, // Available | Booked | Working | Completed
      booking: bookingDetails
    };
  });
};

module.exports = {
  STANDARD_SLOTS,
  calculateSlotsForDate
};
