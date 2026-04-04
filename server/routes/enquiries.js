const express = require('express');
const mongoose = require('mongoose');
const Enquiry = require('../models/Enquiry');
const verifyAdminAuth = require('../middleware/verifyAdminAuth');
const { sendNewEnquiryNotification } = require('../utils/email');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const {
  normalizeStatus,
  validateEnquiryPayload
} = require('../utils/enquiryValidation');
const logger = require('../utils/logger');

const router = express.Router();

function isValidEnquiryId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function logEnquiryError(context, error) {
  logger.error(`[enquiries] ${context}`, error);
}

router.post('/', async (req, res) => {
  const { data, errors, isValid } = validateEnquiryPayload(req.body);

  if (!isValid) {
    return sendError(res, {
      statusCode: 400,
      message: 'Please correct the highlighted enquiry fields.',
      errors
    });
  }

  try {
    const enquiry = await Enquiry.create(data);
    void sendNewEnquiryNotification(enquiry);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Enquiry submitted successfully.',
      data: enquiry
    });
  } catch (error) {
    logEnquiryError('Unable to create enquiry.', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to save your enquiry right now.'
    });
  }
});

router.get('/', verifyAdminAuth, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 }).lean();

    return sendSuccess(res, {
      message: 'Enquiries loaded successfully.',
      data: enquiries
    });
  } catch (error) {
    logEnquiryError('Unable to load enquiries.', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to load enquiries.'
    });
  }
});

router.get('/:id', verifyAdminAuth, async (req, res) => {
  if (!isValidEnquiryId(req.params.id)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid enquiry id.'
    });
  }

  try {
    const enquiry = await Enquiry.findById(req.params.id).lean();

    if (!enquiry) {
      return sendError(res, {
        statusCode: 404,
        message: 'Enquiry not found.'
      });
    }

    return sendSuccess(res, {
      message: 'Enquiry loaded successfully.',
      data: enquiry
    });
  } catch (error) {
    logEnquiryError('Unable to load enquiry details.', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to load the enquiry.'
    });
  }
});

async function updateEnquiryStatus(req, res) {
  if (!isValidEnquiryId(req.params.id)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid enquiry id.'
    });
  }

  const { data, errors, isValid } = validateEnquiryPayload(req.body, {
    partial: true,
    statusOnly: true
  });

  if (!isValid || !data.status) {
    return sendError(res, {
      statusCode: 400,
      message: 'A valid enquiry status is required.',
      errors: errors.status ? { status: errors.status } : undefined
    });
  }

  try {
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status: normalizeStatus(data.status) },
      { new: true, runValidators: true }
    );

    if (!updatedEnquiry) {
      return sendError(res, {
        statusCode: 404,
        message: 'Enquiry not found.'
      });
    }

    return sendSuccess(res, {
      message: 'Enquiry status updated successfully.',
      data: updatedEnquiry
    });
  } catch (error) {
    logEnquiryError('Unable to update enquiry status.', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to update enquiry status.'
    });
  }
}

router.put('/:id', verifyAdminAuth, updateEnquiryStatus);
router.patch('/:id/status', verifyAdminAuth, updateEnquiryStatus);

router.delete('/:id', verifyAdminAuth, async (req, res) => {
  if (!isValidEnquiryId(req.params.id)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid enquiry id.'
    });
  }

  try {
    const deletedEnquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!deletedEnquiry) {
      return sendError(res, {
        statusCode: 404,
        message: 'Enquiry not found.'
      });
    }

    return sendSuccess(res, {
      message: 'Enquiry deleted successfully.',
      data: {
        id: req.params.id
      }
    });
  } catch (error) {
    logEnquiryError('Unable to delete enquiry.', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to delete enquiry.'
    });
  }
});

module.exports = router;
