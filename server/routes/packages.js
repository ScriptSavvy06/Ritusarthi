const express = require('express');
const Package = require('../models/Package');
const verifyAdminAuth = require('../middleware/verifyAdminAuth');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const {
  isValidObjectId,
  validatePackagePayload
} = require('../utils/packageValidation');
const logger = require('../utils/logger');

const router = express.Router();

function logPackageError(scope, error) {
  logger.error(`[packages][${scope}]`, error);
}

async function ensureUniqueSlug(slug, packageId = null) {
  const query = packageId
    ? { slug, _id: { $ne: packageId } }
    : { slug };

  return Package.findOne(query);
}

router.get('/admin/all', verifyAdminAuth, async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 }).lean();

    return sendSuccess(res, {
      message: 'Packages loaded successfully.',
      data: packages
    });
  } catch (error) {
    logPackageError('admin-all', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to load packages.'
    });
  }
});

router.get('/admin/:id', verifyAdminAuth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid package id.'
    });
  }

  try {
    const pkg = await Package.findById(req.params.id).lean();

    if (!pkg) {
      return sendError(res, {
        statusCode: 404,
        message: 'Package not found.'
      });
    }

    return sendSuccess(res, {
      message: 'Package loaded successfully.',
      data: pkg
    });
  } catch (error) {
    logPackageError('admin-single', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to load the package.'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true })
      .sort({
        isFeatured: -1,
        createdAt: -1
      })
      .lean();

    return sendSuccess(res, {
      message: 'Packages loaded successfully.',
      data: packages
    });
  } catch (error) {
    logPackageError('public-all', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to load packages.'
    });
  }
});

router.get('/:identifier', async (req, res) => {
  const { identifier } = req.params;

  try {
    const query = isValidObjectId(identifier)
      ? {
          isActive: true,
          $or: [{ _id: identifier }, { slug: identifier.toLowerCase() }]
        }
      : { isActive: true, slug: identifier.toLowerCase() };

    const pkg = await Package.findOne(query);

    if (!pkg) {
      return sendError(res, {
        statusCode: 404,
        message: 'Package not found.'
      });
    }

    return sendSuccess(res, {
      message: 'Package loaded successfully.',
      data: pkg
    });
  } catch (error) {
    logPackageError('public-single', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to load the package.'
    });
  }
});

router.post('/', verifyAdminAuth, async (req, res) => {
  const { data, errors, isValid } = validatePackagePayload(req.body);

  if (!isValid) {
    return sendError(res, {
      statusCode: 400,
      message: 'Please correct the package details and try again.',
      errors
    });
  }

  try {
    const slugOwner = await ensureUniqueSlug(data.slug);
    if (slugOwner) {
      return sendError(res, {
        statusCode: 409,
        message: 'A package with this slug already exists.'
      });
    }

    const createdPackage = await Package.create(data);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Package created successfully.',
      data: createdPackage
    });
  } catch (error) {
    logPackageError('create', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to create the package.'
    });
  }
});

router.put('/:id', verifyAdminAuth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid package id.'
    });
  }

  try {
    const existingPackage = await Package.findById(req.params.id);

    if (!existingPackage) {
      return sendError(res, {
        statusCode: 404,
        message: 'Package not found.'
      });
    }

    const { data, errors, isValid } = validatePackagePayload(req.body, {
      existingPackage
    });

    if (!isValid) {
      return sendError(res, {
        statusCode: 400,
        message: 'Please correct the package details and try again.',
        errors
      });
    }

    const slugOwner = await ensureUniqueSlug(data.slug, req.params.id);
    if (slugOwner) {
      return sendError(res, {
        statusCode: 409,
        message: 'A package with this slug already exists.'
      });
    }

    const updatedPackage = await Package.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });

    return sendSuccess(res, {
      message: 'Package updated successfully.',
      data: updatedPackage
    });
  } catch (error) {
    logPackageError('update', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to update the package.'
    });
  }
});

router.delete('/:id', verifyAdminAuth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid package id.'
    });
  }

  try {
    const deletedPackage = await Package.findByIdAndDelete(req.params.id);

    if (!deletedPackage) {
      return sendError(res, {
        statusCode: 404,
        message: 'Package not found.'
      });
    }

    return sendSuccess(res, {
      message: 'Package deleted successfully.',
      data: {
        id: req.params.id
      }
    });
  } catch (error) {
    logPackageError('delete', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to delete the package.'
    });
  }
});

module.exports = router;
