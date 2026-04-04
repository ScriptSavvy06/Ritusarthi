function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function buildInvoiceNumber(booking) {
  const createdAt = new Date(booking.createdAt || booking.bookingDate || Date.now());
  const datePrefix = Number.isNaN(createdAt.getTime())
    ? new Date().toISOString().slice(0, 10).replace(/-/g, '')
    : createdAt.toISOString().slice(0, 10).replace(/-/g, '');

  return `RS-${datePrefix}-${String(booking._id || '').slice(-6).toUpperCase()}`;
}

function buildInvoiceData(booking) {
  const amount = Number(booking.price) || 0;

  return {
    invoiceNumber: buildInvoiceNumber(booking),
    issuedAt: booking.paymentVerifiedAt || booking.createdAt || booking.bookingDate,
    issuedAtLabel: formatDateTime(
      booking.paymentVerifiedAt || booking.createdAt || booking.bookingDate
    ),
    bookingId: String(booking._id),
    bookingDate: booking.bookingDate,
    bookingDateLabel: formatDateTime(booking.bookingDate),
    business: {
      name: 'Rituu Saarthhii Tours & Travels'
    },
    customer: {
      name: booking.userName,
      email: booking.email,
      phone: booking.phone
    },
    package: {
      id: String(booking.packageId),
      name: booking.packageName
    },
    payment: {
      status: booking.paymentStatus,
      currency: 'INR',
      amountPaid: amount,
      amountPaidLabel: new Intl.NumberFormat('en-IN').format(amount),
      razorpayOrderId: booking.razorpayOrderId || '',
      razorpayPaymentId: booking.razorpayPaymentId || '',
      verifiedAt: booking.paymentVerifiedAt,
      verifiedAtLabel: formatDateTime(booking.paymentVerifiedAt)
    }
  };
}

module.exports = {
  buildInvoiceData,
  buildInvoiceNumber
};
