const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]*$/;

let razorpayScriptPromise;

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createEmptyBookingForm() {
  return {
    userName: '',
    email: '',
    phone: ''
  };
}

export function validateBookingFormData(form) {
  const errors = {};
  const userName = String(form.userName || '').trim();
  const email = String(form.email || '').trim().toLowerCase();
  const phone = String(form.phone || '').trim();
  const phoneDigits = phone.replace(/\D/g, '');

  if (!userName) {
    errors.userName = 'Name is required.';
  } else if (userName.length < 2 || userName.length > 80 || !NAME_REGEX.test(userName)) {
    errors.userName =
      'Please enter a valid full name using letters, spaces, and common punctuation.';
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!phone) {
    errors.phone = 'Phone number is required.';
  } else if (
    !PHONE_REGEX.test(phone) ||
    phoneDigits.length < 7 ||
    phoneDigits.length > 15
  ) {
    errors.phone = 'Please provide a valid phone number.';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}

export function normalizeBookingPaymentStatus(value) {
  const normalizedValue = String(value || '').trim().toLowerCase();

  if (normalizedValue === 'paid') {
    return 'paid';
  }

  if (normalizedValue === 'failed') {
    return 'failed';
  }

  return 'pending';
}

export function getBookingStatusLabel(status) {
  const normalizedStatus = normalizeBookingPaymentStatus(status);

  if (normalizedStatus === 'paid') {
    return 'Paid';
  }

  if (normalizedStatus === 'failed') {
    return 'Failed';
  }

  return 'Pending';
}

export function getBookingStatusClasses(status) {
  const normalizedStatus = normalizeBookingPaymentStatus(status);

  if (normalizedStatus === 'paid') {
    return 'bg-green-100 text-green-700';
  }

  if (normalizedStatus === 'failed') {
    return 'bg-red-100 text-red-700';
  }

  return 'bg-amber-100 text-amber-700';
}

export function formatBookingDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export function formatBookingAmount(value) {
  return new Intl.NumberFormat('en-IN').format(Number(value) || 0);
}

export function normalizeBookingForClient(booking) {
  if (!booking) {
    return null;
  }

  const id = booking.id || booking._id || '';
  const orderId = booking.orderId || booking.razorpayOrderId || '';
  const paymentId = booking.paymentId || booking.razorpayPaymentId || '';

  return {
    ...booking,
    id,
    _id: booking._id || id,
    packageId:
      typeof booking.packageId === 'object' && booking.packageId !== null
        ? booking.packageId._id || booking.packageId.id || ''
        : booking.packageId || '',
    orderId,
    paymentId,
    paymentFailureReason: booking.paymentFailureReason || '',
    paymentStatus: normalizeBookingPaymentStatus(booking.paymentStatus)
  };
}

export function loadRazorpayCheckoutScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Payment checkout is only available in the browser.'));
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById('razorpay-checkout-script');

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.Razorpay));
        existingScript.addEventListener('error', () => {
          razorpayScriptPromise = null;
          reject(new Error('Unable to load the payment checkout right now.'));
        });
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => {
        razorpayScriptPromise = null;
        reject(new Error('Unable to load the payment checkout right now.'));
      };
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

export function openRazorpayCheckout(options) {
  if (typeof window === 'undefined' || !window.Razorpay) {
    return Promise.reject(new Error('Payment checkout is unavailable right now.'));
  }

  return new Promise((resolve, reject) => {
    let isSettled = false;

    const settleSuccess = (value) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      resolve(value);
    };

    const settleError = (error) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      reject(error instanceof Error ? error : new Error(String(error || 'Payment failed.')));
    };

    const createCheckoutError = (message, details = {}) => {
      const error = new Error(message);
      Object.assign(error, details);
      return error;
    };

    const checkout = new window.Razorpay({
      ...options,
      handler: (response) => settleSuccess(response),
      modal: {
        ...options.modal,
        ondismiss: () =>
          settleError(
            createCheckoutError('Payment was not completed. Please try again.', {
              code: 'PAYMENT_CANCELLED',
              orderId: options.order_id,
              paymentId: ''
            })
          )
      }
    });

    checkout.on('payment.failed', (response) => {
      settleError(
        createCheckoutError(
          response?.error?.description || 'Payment failed. Please try again.',
          {
            code: 'PAYMENT_FAILED',
            orderId: response?.error?.metadata?.order_id || options.order_id,
            paymentId: response?.error?.metadata?.payment_id || ''
          }
        )
      );
    });

    checkout.open();
  });
}

export function getFriendlyBookingErrorMessage(
  error,
  fallbackMessage = 'Something went wrong. Please retry.'
) {
  const rawMessage = String(error?.response?.data?.message || error?.message || '').trim();

  if (error?.response?.status === 429) {
    return rawMessage || 'Too many requests. Please wait a few minutes and try again.';
  }

  if (!error?.response || error?.code === 'ECONNABORTED') {
    return 'Something went wrong. Please retry.';
  }

  if (
    /payment failed|payment verification failed|payment was not completed|payment/i.test(
      rawMessage
    )
  ) {
    return 'Payment failed. Please try again.';
  }

  if (/network|timeout|fetch/i.test(rawMessage)) {
    return 'Something went wrong. Please retry.';
  }

  return rawMessage || fallbackMessage;
}

export function downloadInvoiceFile(invoice) {
  const invoiceNumber = invoice?.invoiceNumber || `invoice-${Date.now()}`;
  const bookingId = String(invoice?.bookingId || '').slice(-6).toUpperCase() || 'BOOKING';

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(invoiceNumber)}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 32px;
        color: #0f172a;
        background: #f8fafc;
      }
      .invoice {
        max-width: 760px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 24px 60px -28px rgba(15, 23, 42, 0.25);
      }
      .eyebrow {
        color: #14532d;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.24em;
        text-transform: uppercase;
      }
      h1 {
        margin: 12px 0 8px;
        font-size: 32px;
      }
      p {
        margin: 0 0 8px;
      }
      .grid {
        display: grid;
        gap: 20px;
        margin-top: 28px;
      }
      .card {
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 20px;
      }
      .label {
        color: #64748b;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      .value {
        margin-top: 8px;
        font-size: 16px;
        font-weight: 600;
      }
      .amount {
        color: #14532d;
        font-size: 28px;
        font-weight: 800;
      }
      .footer {
        margin-top: 28px;
        color: #475569;
        font-size: 13px;
        line-height: 1.7;
      }
    </style>
  </head>
  <body>
    <div class="invoice">
      <div class="eyebrow">Rituu Saarthhii Tours & Travels</div>
      <h1>Payment Invoice</h1>
      <p>Invoice Number: ${escapeHtml(invoiceNumber)}</p>
      <p>Issued At: ${escapeHtml(invoice?.issuedAtLabel || 'Not available')}</p>

      <div class="grid">
        <div class="card">
          <div class="label">Customer</div>
          <div class="value">${escapeHtml(invoice?.customer?.name || '')}</div>
          <p>${escapeHtml(invoice?.customer?.email || '')}</p>
          <p>${escapeHtml(invoice?.customer?.phone || '')}</p>
        </div>

        <div class="card">
          <div class="label">Package</div>
          <div class="value">${escapeHtml(invoice?.package?.name || '')}</div>
          <p>Booking ID: ${escapeHtml(invoice?.bookingId || '')}</p>
          <p>Travel Booking Date: ${escapeHtml(invoice?.bookingDateLabel || '')}</p>
        </div>

        <div class="card">
          <div class="label">Payment</div>
          <div class="amount">Rs ${escapeHtml(invoice?.payment?.amountPaidLabel || '0')}</div>
          <p>Status: ${escapeHtml(getBookingStatusLabel(invoice?.payment?.status))}</p>
          <p>Payment ID: ${escapeHtml(invoice?.payment?.razorpayPaymentId || 'Not available')}</p>
          <p>Order ID: ${escapeHtml(invoice?.payment?.razorpayOrderId || 'Not available')}</p>
        </div>
      </div>

      <div class="footer">
        <p>This invoice confirms a successful booking payment for the package listed above.</p>
        <p>Reference: ${escapeHtml(bookingId)}</p>
      </div>
    </div>
  </body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = downloadUrl;
  link.download = `${invoiceNumber.toLowerCase()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
