const express = require('express');
const mongoose = require('mongoose');
const Enquiry = require('../models/Enquiry');
const verifyAdminAuth = require('../middleware/verifyAdminAuth');
const { sendNewEnquiryNotification } = require('../utils/email');
const {
  normalizeStatus,
  validateEnquiryPayload
} = require('../utils/enquiryValidation');

const router = express.Router();

function isValidEnquiryId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function logEnquiryError(context, error) {
  console.error(`[enquiries] ${context}`, error);
}

router.post('/', async (req, res) => {
  const { data, errors, isValid } = validateEnquiryPayload(req.body);

  if (!isValid) {
    return res.status(400).json({
      message: 'Please correct the highlighted enquiry fields.',
      errors
    });
  }

  try {
    const enquiry = await Enquiry.create(data);
    void sendNewEnquiryNotification(enquiry);
    return res.status(201).json(enquiry);
  } catch (error) {
    logEnquiryError('Unable to create enquiry.', error);
    return res.status(500).json({ message: 'Unable to save your enquiry right now.' });
  }
});

router.get('/', verifyAdminAuth, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    return res.json(enquiries);
  } catch (error) {
    logEnquiryError('Unable to load enquiries.', error);
    return res.status(500).json({ message: 'Unable to load enquiries.' });
  }
});

router.get('/:id', verifyAdminAuth, async (req, res) => {
  if (!isValidEnquiryId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid enquiry id.' });
  }

  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    return res.json(enquiry);
  } catch (error) {
    logEnquiryError('Unable to load enquiry details.', error);
    return res.status(500).json({ message: 'Unable to load the enquiry.' });
  }
});

async function updateEnquiryStatus(req, res) {
  if (!isValidEnquiryId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid enquiry id.' });
  }

  const { data, errors, isValid } = validateEnquiryPayload(req.body, {
    partial: true,
    statusOnly: true
  });

  if (!isValid || !data.status) {
    return res.status(400).json({
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
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    return res.json(updatedEnquiry);
  } catch (error) {
    logEnquiryError('Unable to update enquiry status.', error);
    return res.status(500).json({ message: 'Unable to update enquiry status.' });
  }
}

router.put('/:id', verifyAdminAuth, updateEnquiryStatus);
router.patch('/:id/status', verifyAdminAuth, updateEnquiryStatus);

router.delete('/:id', verifyAdminAuth, async (req, res) => {
  if (!isValidEnquiryId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid enquiry id.' });
  }

  try {
    const deletedEnquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!deletedEnquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    return res.json({ message: 'Enquiry deleted successfully.' });
  } catch (error) {
    logEnquiryError('Unable to delete enquiry.', error);
    return res.status(500).json({ message: 'Unable to delete enquiry.' });
  }
});

module.exports = router;
