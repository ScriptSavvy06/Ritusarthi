import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  IndianRupee,
  LoaderCircle,
  ShieldCheck,
  X
} from 'lucide-react';
import {
  api,
  getApiErrorMessage,
  getResponseData,
  getResponseMessage
} from '../lib/api';
import {
  createEmptyBookingForm,
  downloadInvoiceFile,
  formatBookingAmount,
  formatBookingDateTime,
  getFriendlyBookingErrorMessage,
  getBookingStatusClasses,
  getBookingStatusLabel,
  loadRazorpayCheckoutScript,
  normalizeBookingForClient,
  openRazorpayCheckout,
  validateBookingFormData
} from '../utils/bookings';

const BookingModal = ({ isOpen, onClose, pkg }) => {
  const [form, setForm] = useState(createEmptyBookingForm());
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [booking, setBooking] = useState(null);
  const [processingStep, setProcessingStep] = useState('');

  const formattedPrice = useMemo(() => formatBookingAmount(pkg?.price), [pkg?.price]);
  const canBookPackage = /^[a-f0-9]{24}$/i.test(String(pkg?._id || ''));
  const isPaid = booking?.paymentStatus === 'paid';

  useEffect(() => {
    if (!isOpen) {
      setForm(createEmptyBookingForm());
      setFieldErrors({});
      setFormError('');
      setPaymentMessage('');
      setSubmitting(false);
      setDownloadingInvoice(false);
      setBooking(null);
      setProcessingStep('');
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !submitting) {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, submitting]);

  if (!isOpen || !pkg) {
    return null;
  }

  const handleFieldChange = (field, value) => {
    setForm((currentValue) => ({
      ...currentValue,
      [field]: value
    }));

    setFieldErrors((currentValue) => ({
      ...currentValue,
      [field]: ''
    }));
  };

  const reportPaymentFailure = async ({
    bookingId,
    orderId,
    paymentId = '',
    failureReason
  }) => {
    try {
      const response = await api.post('/api/payment/failure', {
        bookingId,
        orderId,
        paymentId,
        failureReason
      });

      const responseData = getResponseData(response, {});
      if (responseData?.booking) {
        setBooking(normalizeBookingForClient(responseData.booking));
      }
    } catch (_error) {
      setBooking((currentValue) =>
        currentValue
          ? normalizeBookingForClient({
              ...currentValue,
              paymentStatus: 'failed',
              orderId: orderId || currentValue.orderId || '',
              paymentId: paymentId || currentValue.paymentId || '',
              paymentFailureReason:
                failureReason || currentValue.paymentFailureReason || ''
            })
          : currentValue
      );
    }
  };

  const startPaymentForBooking = async (bookingRecord) => {
    setProcessingStep('Creating secure Razorpay order...');

    const orderResponse = await api.post('/api/payment/create-order', {
      bookingId: bookingRecord.id
    });
    const orderData = getResponseData(orderResponse, {});
    const activeBooking = normalizeBookingForClient(orderData.booking || bookingRecord);
    const activeOrderId = orderData.orderId || activeBooking?.orderId || '';

    setBooking(activeBooking);
    await loadRazorpayCheckoutScript();

    setProcessingStep('Opening secure payment window...');

    let paymentResponse;

    try {
      paymentResponse = await openRazorpayCheckout({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Rituu Saarthhii Tours & Travels',
        description: activeBooking.packageName,
        order_id: activeOrderId,
        prefill: {
          name: form.userName.trim(),
          email: form.email.trim(),
          contact: form.phone.trim()
        },
        notes: {
          bookingId: activeBooking.id,
          packageName: activeBooking.packageName
        },
        theme: {
          color: '#14532d'
        }
      });
    } catch (checkoutError) {
      await reportPaymentFailure({
        bookingId: activeBooking.id,
        orderId: checkoutError.orderId || activeOrderId,
        paymentId: checkoutError.paymentId || '',
        failureReason: checkoutError.message
      });
      throw checkoutError;
    }

    setProcessingStep('Verifying payment...');

    const verifyResponse = await api.post('/api/payment/verify', {
      bookingId: activeBooking.id,
      ...paymentResponse
    });
    const verifyData = getResponseData(verifyResponse, {});
    const verifiedBooking = normalizeBookingForClient(verifyData.booking);

    setBooking(verifiedBooking);
    setPaymentMessage(
      getResponseMessage(verifyResponse, 'Payment verified successfully.')
    );
    setProcessingStep('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setPaymentMessage('');

    if (!canBookPackage) {
      setFormError(
        'Live booking is available only for packages loaded from the current website data.'
      );
      return;
    }

    const { errors, isValid } = validateBookingFormData(form);

    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    let bookingRecord = booking;

    try {
      if (!bookingRecord || bookingRecord.paymentStatus === 'failed') {
        setProcessingStep('Creating booking...');

        const createResponse = await api.post('/api/bookings/create', {
          packageId: pkg._id,
          userName: form.userName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim()
        });
        const createData = getResponseData(createResponse, {});

        bookingRecord = normalizeBookingForClient(createData.booking);
        setBooking(bookingRecord);
      }

      await startPaymentForBooking(bookingRecord);
    } catch (error) {
      setProcessingStep('');

      const fallbackMessage =
        bookingRecord && bookingRecord.paymentStatus !== 'paid'
          ? 'Payment failed. Please try again.'
          : 'Something went wrong. Please retry.';
      const message = getFriendlyBookingErrorMessage(error, fallbackMessage);

      if (bookingRecord && bookingRecord.paymentStatus !== 'paid') {
        setPaymentMessage(message);
      } else {
        setFormError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!booking?.id) {
      return;
    }

    setDownloadingInvoice(true);
    setFormError('');

    try {
      const response = await api.get(`/api/bookings/${booking.id}/invoice`, {
        params: {
          email: booking.email
        }
      });

      downloadInvoiceFile(getResponseData(response));
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Something went wrong. Please retry.'));
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !submitting) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-[0_32px_90px_-40px_rgba(15,23,42,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6 md:px-8">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-green">
              Secure booking
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-[1.9rem]">
              {pkg.title}
            </h2>
            <div className="mt-3 flex items-center text-sm text-slate-500">
              <IndianRupee size={16} className="mr-1 text-brand-red" />
              From Rs {formattedPrice} per person
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-5 py-6 sm:px-6 md:px-8 md:py-8">
          {isPaid ? (
            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-green-100 bg-green-50 px-5 py-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 text-green-600" size={24} />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Booking confirmed</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Your payment has been verified successfully. Your booking is secure
                      and the invoice is ready to download.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SuccessCard label="Customer" value={booking.userName} />
                <SuccessCard label="Package" value={booking.packageName} />
                <SuccessCard
                  label="Amount Paid"
                  value={`Rs ${formatBookingAmount(booking.price)}`}
                />
                <SuccessCard
                  label="Booking Date"
                  value={formatBookingDateTime(booking.bookingDate)}
                />
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <div className="flex flex-wrap items-center gap-3">
                  <ShieldCheck size={18} className="text-brand-green" />
                  <span className="text-sm font-semibold text-slate-700">
                    Payment Status
                  </span>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBookingStatusClasses(
                      booking.paymentStatus
                    )}`}
                  >
                    {getBookingStatusLabel(booking.paymentStatus)}
                  </span>
                </div>

                {paymentMessage ? (
                  <p className="mt-3 text-sm leading-7 text-slate-600">{paymentMessage}</p>
                ) : null}
              </div>

              {formError ? (
                <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  disabled={downloadingInvoice}
                  className="brand-button disabled:opacity-60"
                >
                  {downloadingInvoice ? (
                    <LoaderCircle size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Download size={18} className="mr-2" />
                  )}
                  {downloadingInvoice ? 'Preparing Invoice...' : 'Download Invoice'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="brand-button-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-sm leading-7 text-slate-600">
                  Share your details to create a booking, then complete the secure Razorpay
                  payment to confirm this package.
                </p>
                {booking?.id ? (
                  <p className="mt-3 text-sm font-medium text-brand-green">
                    Booking created. You can safely continue payment for this booking.
                  </p>
                ) : null}
              </div>

              {formError ? (
                <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              {paymentMessage ? (
                <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {paymentMessage}
                </div>
              ) : null}

              {submitting && processingStep ? (
                <div
                  aria-live="polite"
                  className="rounded-[1.5rem] border border-brand-green/15 bg-brand-green/5 px-4 py-3 text-sm font-medium text-brand-green"
                >
                  <span className="inline-flex items-center">
                    <LoaderCircle size={16} className="mr-2 animate-spin" />
                    {processingStep}
                  </span>
                </div>
              ) : null}

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Full Name"
                  value={form.userName}
                  error={fieldErrors.userName}
                  onChange={(value) => handleFieldChange('userName', value)}
                  placeholder="Enter your full name"
                />
                <FormField
                  label="Email Address"
                  value={form.email}
                  error={fieldErrors.email}
                  onChange={(value) => handleFieldChange('email', value)}
                  placeholder="Enter your email"
                  type="email"
                />
              </div>

              <FormField
                label="Phone Number"
                value={form.phone}
                error={fieldErrors.phone}
                onChange={(value) => handleFieldChange('phone', value)}
                placeholder="Enter your phone number"
                type="tel"
              />

              <div className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Payable amount
                    </div>
                    <div className="mt-2 flex items-center text-3xl font-extrabold text-slate-900">
                      <IndianRupee size={24} />
                      <span>{formattedPrice}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !canBookPackage}
                    className="brand-button w-full sm:w-auto disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle size={18} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : booking?.id ? (
                      'Retry Payment'
                    ) : (
                      'Book Now & Pay'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const FormField = ({
  error,
  label,
  onChange,
  placeholder,
  type = 'text',
  value
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[1.25rem] border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
    />
    {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
  </div>
);

const SuccessCard = ({ label, value }) => (
  <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5">
    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
      {label}
    </div>
    <div className="mt-2 text-sm font-semibold leading-7 text-slate-800">
      {value || 'Content coming soon...'}
    </div>
  </div>
);

export default BookingModal;
