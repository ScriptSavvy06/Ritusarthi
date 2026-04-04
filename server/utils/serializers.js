const { getAdminRole } = require('./auth');

function getBookingOrderId(booking) {
  return booking?.orderId || booking?.razorpayOrderId || '';
}

function getBookingPaymentId(booking) {
  return booking?.paymentId || booking?.razorpayPaymentId || '';
}

function serializeAdmin(admin) {
  if (!admin) {
    return null;
  }

  return {
    id: String(admin._id),
    username: admin.username,
    email: admin.email,
    role: getAdminRole(admin),
    createdAt: admin.createdAt
  };
}

function serializeBooking(booking) {
  if (!booking) {
    return null;
  }

  return {
    id: String(booking._id),
    userName: booking.userName,
    email: booking.email,
    phone: booking.phone,
    packageId:
      typeof booking.packageId === 'object' && booking.packageId !== null
        ? String(booking.packageId._id || booking.packageId.id || '')
        : String(booking.packageId || ''),
    packageName: booking.packageName,
    price: booking.price,
    paymentStatus: booking.paymentStatus,
    paymentId: getBookingPaymentId(booking),
    orderId: getBookingOrderId(booking),
    paymentFailureReason: booking.paymentFailureReason || '',
    paymentVerifiedAt: booking.paymentVerifiedAt || null,
    bookingDate: booking.bookingDate,
    createdAt: booking.createdAt
  };
}

module.exports = {
  getBookingOrderId,
  getBookingPaymentId,
  serializeAdmin,
  serializeBooking
};
