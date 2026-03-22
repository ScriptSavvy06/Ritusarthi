const mongoose = require('mongoose');
const { ENQUIRY_STATUSES, normalizeStatus } = require('../utils/enquiryValidation');

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    package: { type: String, trim: true },
    destination: { type: String, trim: true },
    travelDate: { type: Date },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ENQUIRY_STATUSES,
      default: 'new',
      set: (value) => normalizeStatus(value) || 'new'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
