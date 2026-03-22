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

async function sendNewEnquiryNotification(enquiry) {
  const nodemailer = getNodemailer();

  if (!nodemailer) {
    return { skipped: true, reason: 'missing_dependency' };
  }

  const transporter = createTransporter(nodemailer);

  if (!transporter) {
    return { skipped: true, reason: 'missing_configuration' };
  }

  const recipients = getNotificationRecipients();
  const summary = buildEnquirySummary(enquiry);
  const fromName = SMTP_FROM_NAME || 'Rituu Saarthhii Tours & Travels';

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${SMTP_FROM_EMAIL}>`,
      to: recipients.join(', '),
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

    return { sent: true };
  } catch (error) {
    console.error('[email] Failed to send new enquiry notification.', error);
    return { skipped: true, reason: 'send_failed' };
  }
}

module.exports = {
  isEmailNotificationConfigured,
  sendNewEnquiryNotification
};
