const {
  ADMIN_NOTIFICATION_EMAIL,
  SMTP_FROM_EMAIL,
  SMTP_FROM_NAME,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_SERVICE,
  SMTP_USER
} = require('../config/env');

let loggedConfigWarning = false;
let loggedMissingDependency = false;

function getNodemailer() {
  try {
    return require('nodemailer');
  } catch (error) {
    if (!loggedMissingDependency) {
      console.warn(
        '[email] Nodemailer is not installed. New enquiry emails will be skipped until the dependency is added.'
      );
      loggedMissingDependency = true;
    }

    return null;
  }
}

function getNotificationRecipients() {
  return ADMIN_NOTIFICATION_EMAIL.split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function hasTransportConfiguration() {
  const hasServiceConfig = Boolean(SMTP_SERVICE && SMTP_USER && SMTP_PASS);
  const hasHostConfig = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);

  return hasServiceConfig || hasHostConfig;
}

function isEmailNotificationConfigured() {
  return Boolean(
    hasTransportConfiguration() &&
      SMTP_FROM_EMAIL &&
      getNotificationRecipients().length
  );
}

function logConfigWarning() {
  if (loggedConfigWarning) {
    return;
  }

  console.warn(
    '[email] SMTP or admin notification settings are incomplete. New enquiry emails will be skipped.'
  );
  loggedConfigWarning = true;
}

function createTransporter(nodemailer) {
  if (!isEmailNotificationConfigured()) {
    logConfigWarning();
    return null;
  }

  if (SMTP_SERVICE) {
    return nodemailer.createTransport({
      service: SMTP_SERVICE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateTime(value) {
  if (!value) {
    return 'Not provided';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not provided';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN').format(Number(value) || 0);
}

function buildEnquirySummary(enquiry) {
  const packageName = enquiry.package || enquiry.destination || 'Custom enquiry';

  return {
    createdAt: formatDateTime(enquiry.createdAt),
    email: enquiry.email || 'Not provided',
    message: enquiry.message || 'No additional message provided.',
    name: enquiry.name || 'Not provided',
    packageName,
    phone: enquiry.phone || 'Not provided',
    travelDate: formatDateTime(enquiry.travelDate)
  };
}

function buildBookingSummary(booking) {
  return {
    amount: `Rs ${formatCurrency(booking.price)}`,
    bookingId: String(booking._id || ''),
    bookingDate: formatDateTime(booking.bookingDate),
    createdAt: formatDateTime(booking.createdAt),
    email: booking.email || 'Not provided',
    name: booking.userName || 'Not provided',
    packageName: booking.packageName || 'Travel package',
    paymentId: booking.razorpayPaymentId || 'Not available yet',
    paymentStatus: booking.paymentStatus || 'pending',
    phone: booking.phone || 'Not provided',
    verifiedAt: formatDateTime(booking.paymentVerifiedAt)
  };
}

async function sendConfiguredMail({ subject, text, html }) {
  const nodemailer = getNodemailer();

  if (!nodemailer) {
    return { skipped: true, reason: 'missing_dependency' };
  }

  const transporter = createTransporter(nodemailer);

  if (!transporter) {
    return { skipped: true, reason: 'missing_configuration' };
  }

  const recipients = getNotificationRecipients();
  const fromName = SMTP_FROM_NAME || 'Rituu Saarthhii Tours & Travels';

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${SMTP_FROM_EMAIL}>`,
      to: recipients.join(', '),
      subject,
      text,
      html
    });

    return { sent: true };
  } catch (error) {
    console.error('[email] Failed to send notification email.', error);
    return { skipped: true, reason: 'send_failed' };
  }
}

async function sendNewEnquiryNotification(enquiry) {
  const summary = buildEnquirySummary(enquiry);

  return sendConfiguredMail({
    subject: `New enquiry received: ${summary.packageName}`,
    text: [
      'A new enquiry has been submitted on the website.',
      '',
      `Name: ${summary.name}`,
      `Phone: ${summary.phone}`,
      `Email: ${summary.email}`,
      `Travel Date: ${summary.travelDate}`,
      `Package/Destination: ${summary.packageName}`,
      `Submitted At: ${summary.createdAt}`,
      '',
      'Message:',
      summary.message
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin-bottom: 16px; color: #14532d;">New website enquiry received</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
          <tbody>
            <tr><td style="padding: 8px 0; font-weight: 700;">Name</td><td style="padding: 8px 0;">${escapeHtml(summary.name)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Phone</td><td style="padding: 8px 0;">${escapeHtml(summary.phone)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Email</td><td style="padding: 8px 0;">${escapeHtml(summary.email)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Travel Date</td><td style="padding: 8px 0;">${escapeHtml(summary.travelDate)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Package / Destination</td><td style="padding: 8px 0;">${escapeHtml(summary.packageName)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Submitted At</td><td style="padding: 8px 0;">${escapeHtml(summary.createdAt)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700; vertical-align: top;">Message</td><td style="padding: 8px 0;">${escapeHtml(summary.message)}</td></tr>
          </tbody>
        </table>
      </div>
    `
  });
}

async function sendNewBookingNotification(booking) {
  const summary = buildBookingSummary(booking);

  return sendConfiguredMail({
    subject: `New booking created: ${summary.packageName}`,
    text: [
      'A new booking has been created on the website.',
      '',
      `Booking ID: ${summary.bookingId}`,
      `Name: ${summary.name}`,
      `Phone: ${summary.phone}`,
      `Email: ${summary.email}`,
      `Package: ${summary.packageName}`,
      `Amount: ${summary.amount}`,
      `Booking Date: ${summary.bookingDate}`,
      `Submitted At: ${summary.createdAt}`,
      `Payment Status: ${summary.paymentStatus}`
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin-bottom: 16px; color: #14532d;">New website booking created</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
          <tbody>
            <tr><td style="padding: 8px 0; font-weight: 700;">Booking ID</td><td style="padding: 8px 0;">${escapeHtml(summary.bookingId)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Name</td><td style="padding: 8px 0;">${escapeHtml(summary.name)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Phone</td><td style="padding: 8px 0;">${escapeHtml(summary.phone)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Email</td><td style="padding: 8px 0;">${escapeHtml(summary.email)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Package</td><td style="padding: 8px 0;">${escapeHtml(summary.packageName)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Amount</td><td style="padding: 8px 0;">${escapeHtml(summary.amount)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Booking Date</td><td style="padding: 8px 0;">${escapeHtml(summary.bookingDate)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Submitted At</td><td style="padding: 8px 0;">${escapeHtml(summary.createdAt)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Payment Status</td><td style="padding: 8px 0;">${escapeHtml(summary.paymentStatus)}</td></tr>
          </tbody>
        </table>
      </div>
    `
  });
}

async function sendBookingPaymentSuccessNotification(booking) {
  const summary = buildBookingSummary(booking);

  return sendConfiguredMail({
    subject: `Payment received: ${summary.packageName}`,
    text: [
      'A booking payment has been verified successfully.',
      '',
      `Booking ID: ${summary.bookingId}`,
      `Name: ${summary.name}`,
      `Phone: ${summary.phone}`,
      `Email: ${summary.email}`,
      `Package: ${summary.packageName}`,
      `Amount Paid: ${summary.amount}`,
      `Payment Status: ${summary.paymentStatus}`,
      `Payment ID: ${summary.paymentId}`,
      `Verified At: ${summary.verifiedAt}`
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin-bottom: 16px; color: #14532d;">Booking payment verified</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
          <tbody>
            <tr><td style="padding: 8px 0; font-weight: 700;">Booking ID</td><td style="padding: 8px 0;">${escapeHtml(summary.bookingId)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Name</td><td style="padding: 8px 0;">${escapeHtml(summary.name)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Phone</td><td style="padding: 8px 0;">${escapeHtml(summary.phone)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Email</td><td style="padding: 8px 0;">${escapeHtml(summary.email)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Package</td><td style="padding: 8px 0;">${escapeHtml(summary.packageName)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Amount Paid</td><td style="padding: 8px 0;">${escapeHtml(summary.amount)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Payment Status</td><td style="padding: 8px 0;">${escapeHtml(summary.paymentStatus)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Payment ID</td><td style="padding: 8px 0;">${escapeHtml(summary.paymentId)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 700;">Verified At</td><td style="padding: 8px 0;">${escapeHtml(summary.verifiedAt)}</td></tr>
          </tbody>
        </table>
      </div>
    `
  });
}

module.exports = {
  isEmailNotificationConfigured,
  sendBookingPaymentSuccessNotification,
  sendNewBookingNotification,
  sendNewEnquiryNotification
};
