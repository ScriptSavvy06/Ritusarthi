const mongoose = require('mongoose');

const PACKAGE_CATEGORIES = ['Spiritual', 'Holiday', 'Customized', 'Group'];

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function slugify(value) {
  return cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function normalizeStringArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => cleanString(value))
    .filter(Boolean);
}

function normalizeImageArray(values) {
  return normalizeStringArray(values);
}

function normalizeItinerary(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((item, index) => {
      const dayValue = Number(item?.day);

      return {
        day: Number.isFinite(dayValue) && dayValue > 0 ? dayValue : index + 1,
        title: cleanString(item?.title),
        details: cleanString(item?.details)
      };
    })
    .filter((item) => item.title || item.details);
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function validatePackagePayload(payload, options = {}) {
  const { partial = false, existingPackage = null } = options;
  const errors = {};
  const data = {};

  const title =
    payload.title !== undefined
      ? cleanString(payload.title)
      : existingPackage?.title || '';

  if (!partial || payload.title !== undefined) {
    if (!title) {
      errors.title = 'Title is required.';
    } else if (title.length < 3) {
      errors.title = 'Title must be at least 3 characters long.';
    } else {
      data.title = title;
    }
  }

  const slugSource =
    payload.slug !== undefined ? payload.slug : payload.title !== undefined ? payload.title : existingPackage?.slug;
  const slug = slugify(slugSource || title);

  if (!partial || payload.slug !== undefined || payload.title !== undefined) {
    if (!slug) {
      errors.slug = 'Slug could not be generated. Please provide a valid title.';
    } else {
      data.slug = slug;
    }
  }

  const description =
    payload.description !== undefined
      ? cleanString(payload.description)
      : existingPackage?.description || '';

  if (!partial || payload.description !== undefined) {
    if (!description) {
      errors.description = 'Short description is required.';
    } else {
      data.description = description;
    }
  }

  const overview =
    payload.overview !== undefined
      ? cleanString(payload.overview)
      : existingPackage?.overview || description;

  if (!partial || payload.overview !== undefined || payload.description !== undefined) {
    data.overview = overview || description;
  }

  const category =
    payload.category !== undefined
      ? cleanString(payload.category)
      : existingPackage?.category || PACKAGE_CATEGORIES[0];

  if (!partial || payload.category !== undefined) {
    if (!PACKAGE_CATEGORIES.includes(category)) {
      errors.category = `Category must be one of: ${PACKAGE_CATEGORIES.join(', ')}.`;
    } else {
      data.category = category;
    }
  }

  const location =
    payload.location !== undefined
      ? cleanString(payload.location)
      : existingPackage?.location || '';

  if (!partial || payload.location !== undefined) {
    if (!location) {
      errors.location = 'Location is required.';
    } else {
      data.location = location;
    }
  }

  const duration =
    payload.duration !== undefined
      ? cleanString(payload.duration)
      : existingPackage?.duration || '';

  if (!partial || payload.duration !== undefined) {
    if (!duration) {
      errors.duration = 'Duration is required.';
    } else {
      data.duration = duration;
    }
  }

  const priceSource =
    payload.price !== undefined ? payload.price : existingPackage?.price;
  const price = Number(priceSource);

  if (!partial || payload.price !== undefined) {
    if (!Number.isFinite(price) || price < 0) {
      errors.price = 'Price must be a valid number.';
    } else {
      data.price = price;
    }
  }

  const heroImage =
    payload.heroImage !== undefined
      ? cleanString(payload.heroImage)
      : existingPackage?.heroImage || '';
  const images =
    payload.images !== undefined
      ? normalizeImageArray(payload.images)
      : existingPackage?.images || [];

  if (!partial || payload.heroImage !== undefined || payload.images !== undefined) {
    data.heroImage = heroImage || images[0] || '';
    data.images = heroImage
      ? Array.from(new Set([heroImage, ...images]))
      : Array.from(new Set(images));
  }

  if (!partial || payload.itinerary !== undefined) {
    data.itinerary = normalizeItinerary(
      payload.itinerary !== undefined ? payload.itinerary : existingPackage?.itinerary
    );
  }

  if (!partial || payload.inclusions !== undefined) {
    data.inclusions = normalizeStringArray(
      payload.inclusions !== undefined ? payload.inclusions : existingPackage?.inclusions
    );
  }

  if (!partial || payload.exclusions !== undefined) {
    data.exclusions = normalizeStringArray(
      payload.exclusions !== undefined ? payload.exclusions : existingPackage?.exclusions
    );
  }

  if (!partial || payload.pricingNotes !== undefined) {
    data.pricingNotes = normalizeStringArray(
      payload.pricingNotes !== undefined
        ? payload.pricingNotes
        : existingPackage?.pricingNotes
    );
  }

  if (!partial || payload.ctaPhone !== undefined) {
    data.ctaPhone = cleanString(
      payload.ctaPhone !== undefined ? payload.ctaPhone : existingPackage?.ctaPhone
    );
  }

  if (!partial || payload.ctaText !== undefined) {
    data.ctaText = cleanString(
      payload.ctaText !== undefined ? payload.ctaText : existingPackage?.ctaText
    );
  }

  if (!partial || payload.isFeatured !== undefined) {
    data.isFeatured =
      payload.isFeatured !== undefined
        ? Boolean(payload.isFeatured)
        : Boolean(existingPackage?.isFeatured);
  }

  if (!partial || payload.isActive !== undefined) {
    data.isActive =
      payload.isActive !== undefined
        ? Boolean(payload.isActive)
        : existingPackage?.isActive !== undefined
          ? Boolean(existingPackage.isActive)
          : true;
  }

  return {
    data,
    errors,
    isValid: Object.keys(errors).length === 0
  };
}

module.exports = {
  PACKAGE_CATEGORIES,
  isValidObjectId,
  slugify,
  validatePackagePayload
};
