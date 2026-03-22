const mongoose = require('mongoose');
const { PACKAGE_CATEGORIES } = require('../utils/packageValidation');

const itinerarySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, min: 1 },
    title: { type: String, trim: true, default: '' },
    details: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    duration: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    heroImage: { type: String, trim: true, default: '' },
    images: [{ type: String, trim: true }],
    category: {
      type: String,
      enum: PACKAGE_CATEGORIES,
      default: PACKAGE_CATEGORIES[0]
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    itinerary: [itinerarySchema],
    inclusions: [{ type: String, trim: true }],
    exclusions: [{ type: String, trim: true }],
    pricingNotes: [{ type: String, trim: true }],
    ctaPhone: { type: String, trim: true, default: '' },
    ctaText: { type: String, trim: true, default: 'Book Now / Enquire' }
  },
  { timestamps: true }
);

packageSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('Package', packageSchema);
