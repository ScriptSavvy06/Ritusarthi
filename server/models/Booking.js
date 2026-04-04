const mongoose = require('mongoose');
const { PAYMENT_STATUSES } = require('../utils/bookingValidation');

const bookingSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true
    },
    packageName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: PAYMENT_STATUSES[0]
    },
    orderId: { type: String, trim: true, default: '' },
    paymentId: { type: String, trim: true, default: '' },
    paymentFailureReason: { type: String, trim: true, default: '' },
    bookingDate: { type: Date, default: Date.now },
    razorpayOrderId: { type: String, trim: true, default: '' },
    razorpayPaymentId: { type: String, trim: true, default: '' },
    razorpaySignature: { type: String, trim: true, default: '' },
    paymentVerifiedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ paymentStatus: 1, createdAt: -1 });
bookingSchema.index({ orderId: 1 });
bookingSchema.index({ paymentId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
