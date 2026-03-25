import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  HiCalendarDays, HiMapPin, HiUserGroup, HiOutlinePrinter,
  HiOutlineChatBubbleLeftRight, HiOutlineXCircle, HiOutlinePencilSquare,
  HiCheckCircle, HiClock, HiXCircle, HiOutlineExclamationCircle,
  HiCreditCard, HiLockClosed, HiShieldCheck, HiExclamationTriangle,
  HiOutlineTrash,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { bookingApi } from '../../../services/api/bookingApi';
import { paymentApi } from '../../../services/api/paymentApi';
import { reviewApi } from '../../../services/api/reviewApi';

import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import Skeleton from '../../../components/ui/Skeleton';
import StarRating from '../../../components/ui/StarRating';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import type { Booking } from '../../../types';
import { BOOKING_STATUSES } from '../../../config';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: 'inherit',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
};

const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'error' | 'info'; icon: React.ReactNode; label: string }> = {
  [BOOKING_STATUSES.INQUIRY]: { variant: 'warning', icon: <HiOutlineExclamationCircle className="h-5 w-5" />, label: 'Inquiry Sent' },
  [BOOKING_STATUSES.PENDING]: { variant: 'warning', icon: <HiClock className="h-5 w-5" />, label: 'Pending Confirmation' },
  [BOOKING_STATUSES.ACCEPTED]: { variant: 'success', icon: <HiCheckCircle className="h-5 w-5" />, label: 'Accepted' },
  [BOOKING_STATUSES.CONFIRMED]: { variant: 'success', icon: <HiCheckCircle className="h-5 w-5" />, label: 'Confirmed' },
  [BOOKING_STATUSES.REJECTED]: { variant: 'error', icon: <HiXCircle className="h-5 w-5" />, label: 'Rejected' },
  [BOOKING_STATUSES.CANCELLED]: { variant: 'error', icon: <HiXCircle className="h-5 w-5" />, label: 'Cancelled' },
  [BOOKING_STATUSES.COMPLETED]: { variant: 'info', icon: <HiCheckCircle className="h-5 w-5" />, label: 'Completed' },
};

const TIMELINE_STEPS = [
  { status: 'inquiry', label: 'Inquiry Sent' },
  { status: 'pending', label: 'Pending' },
  { status: 'accepted', label: 'Accepted' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'completed', label: 'Completed' },
];

// Inline payment form component
const InlinePaymentForm: React.FC<{
  booking: Booking;
  clientSecret: string;
  onSuccess: () => void;
}> = ({ booking, clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cardholderName, setCardholderName] = useState(
    `${booking.client.firstName} ${booking.client.lastName}`
  );
  const [email, setEmail] = useState(booking.client.email);
  const [phone, setPhone] = useState(booking.client.phone || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!cardholderName.trim()) {
      setError('Please enter the cardholder name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
          },
        },
        receipt_email: email.trim(),
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
      } else if (paymentIntent?.status === 'succeeded') {
        // Confirm payment on backend to update booking status immediately
        try {
          await paymentApi.confirm(booking._id);
        } catch {
          // Webhook will handle it as fallback
        }
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white';

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 mb-4">
        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Cardholder Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Full name on card"
            className={inputClass}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Receipt will be sent here"
            className={inputClass}
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Phone <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92 300 1234567"
            className={inputClass}
          />
        </div>

        {/* Card Details */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Card Details <span className="text-red-400">*</span>
          </label>
          <div className="p-4 border border-neutral-200 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all bg-white">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4">
          <HiExclamationTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-neutral-400 text-xs mb-4">
        <HiLockClosed className="h-3.5 w-3.5" />
        <span>Your payment info is encrypted and secure.</span>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        type="submit"
        loading={processing}
        disabled={!stripe || processing}
      >
        Pay PKR {booking.pricingSnapshot.totalAmount.toLocaleString()}
      </Button>
    </form>
  );
};

const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Review states
  const [reviewData, setReviewData] = useState<{ _id: string; rating: number; comment: string; title?: string; detailedRatings?: { quality?: number; communication?: number; valueForMoney?: number; punctuality?: number }; vendorReply?: { comment: string; repliedAt: string }; createdAt: string } | null>(null);
  const [showDeleteReviewDialog, setShowDeleteReviewDialog] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);

  // Payment states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchBooking = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await bookingApi.getById(id);
      setBooking(res.data.data.booking);
    } catch {
      toast.error('Failed to load booking details');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id, navigate]);

  // Fetch review when booking is reviewed
  useEffect(() => {
    if (booking?.isReviewed && id) {
      reviewApi.getByBooking(id)
        .then((res) => setReviewData(res.data?.data?.review || null))
        .catch(() => setReviewData(null));
    } else {
      setReviewData(null);
    }
  }, [booking?.isReviewed, id]);

  const handleDeleteReview = async () => {
    if (!reviewData) return;
    setDeletingReview(true);
    try {
      await reviewApi.delete(reviewData._id);
      toast.success('Review deleted successfully');
      setShowDeleteReviewDialog(false);
      setReviewData(null);
      fetchBooking();
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setDeletingReview(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      await bookingApi.cancel(booking._id, 'Cancelled by client');
      const wasPaid = booking.paymentStatus === 'succeeded';
      toast.success(wasPaid ? 'Booking cancelled. Your payment will be refunded.' : 'Booking cancelled successfully');
      setShowCancelDialog(false);
      // Refetch to get updated payment/refund status
      fetchBooking();
    } catch {
      toast.error('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = async () => {
    if (!booking) return;
    setPaymentLoading(true);
    try {
      const res = await paymentApi.createIntent(booking._id);
      setClientSecret(res.data.data.clientSecret);
      setShowPaymentForm(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setClientSecret(null);
    // Refetch booking to get updated payment status
    fetchBooking();
  };

  const handlePrintReceipt = () => {
    if (!booking) return;
    const fmtDate = (d?: string) => {
      if (!d) return '—';
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    const fmtDateTime = (d?: string) => {
      if (!d) return '—';
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '—';
      return `${dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    };
    const isPaidReceipt = booking.paymentStatus === 'succeeded' || booking.paymentStatus === 'refunded';

    const receiptHTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Receipt - ${booking.bookingNumber}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f6f9fc;padding:40px 20px}
.receipt{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08);overflow:hidden}
.header{background:linear-gradient(135deg,#635BFF 0%,#7A73FF 100%);color:#fff;padding:32px 40px}
.header h1{font-size:22px;font-weight:600;margin-bottom:4px}
.header p{opacity:.85;font-size:13px}
.stripe-logo{display:flex;align-items:center;gap:8px;margin-bottom:16px;font-size:13px;opacity:.9}
.stripe-logo svg{height:18px}
.body{padding:32px 40px}
.amount-box{text-align:center;padding:24px;background:#f8f9fa;border-radius:10px;margin-bottom:28px}
.amount-box .label{font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.amount-box .amount{font-size:32px;font-weight:700;color:#1a1a1a}
.amount-box .status{display:inline-block;margin-top:8px;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600}
.status-paid{background:#d1fae5;color:#065f46}
.status-refunded{background:#dbeafe;color:#1e40af}
.status-pending{background:#fef3c7;color:#92400e}
.section{margin-bottom:24px}
.section-title{font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:#9ca3af;font-weight:600;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #f3f4f6}
.row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px}
.row .label{color:#6b7280}
.row .value{color:#1a1a1a;font-weight:500;text-align:right;max-width:60%;word-break:break-all}
.row.total{padding-top:12px;margin-top:8px;border-top:2px solid #e5e7eb;font-size:15px;font-weight:600}
.row.total .value{color:#1a1a1a}
.divider{height:1px;background:#f3f4f6;margin:24px 0}
.footer{padding:24px 40px;background:#f8f9fa;text-align:center;font-size:11px;color:#9ca3af}
.footer a{color:#635BFF;text-decoration:none}
.mono{font-family:'SF Mono',SFMono-Regular,Consolas,monospace;font-size:12px}
@media print{body{background:#fff;padding:0}.receipt{box-shadow:none;border-radius:0}.header{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="stripe-logo">
      <svg viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.27 4.06-.78v2.96c-1.12.57-2.7.89-4.54.89-4.14 0-6.74-2.58-6.74-6.87 0-3.81 2.27-6.96 6.24-6.96 3.94 0 5.89 2.93 5.89 6.59 0 .49-.05 1.15-.05 1.62zm-4.03-5.17c0-.82-.31-2.66-2.2-2.66-1.65 0-2.35 1.56-2.49 2.66h4.69zM40.95 20.9c-1.55 0-2.81-.38-3.76-1.05l-.04 4.68-4.04.86V6.35h3.49l.18 1.05c.98-.82 2.28-1.33 3.77-1.33 3.38 0 5.48 3.06 5.48 7.22 0 4.72-2.38 7.61-5.08 7.61zm-.87-12.04c-.95 0-1.62.29-2.14.85l.05 7.23c.48.5 1.12.78 2.09.78 1.65 0 2.72-1.82 2.72-4.48 0-2.56-1.05-4.38-2.72-4.38zM28.24 5.57c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm-2.03.78h4.04V20.6h-4.04V6.35zM22.47 7.95l-.25-1.6h-3.46v14.25h4.04V11.4c.96-1.24 2.58-1.01 3.09-.84V6.35c-.53-.19-2.46-.54-3.42 1.6zM13.23 2.07l-3.96.84-.01 13.04c0 2.41 1.8 4.18 4.22 4.18 1.34 0 2.31-.24 2.85-.54v-3.11c-.51.21-3.07.95-3.07-1.43V9.6h3.07V6.35h-3.07l-.03-4.28zM3.87 10.24c0-.57.47-.79 1.25-.79.95 0 2.24.34 3.37.95V6.86c-1.12-.45-2.23-.62-3.37-.62C2.14 6.24 0 7.95 0 10.53c0 3.97 5.47 3.34 5.47 5.05 0 .67-.58.89-1.39.89-1.2 0-2.74-.5-3.96-1.17v3.6c1.35.58 2.71.83 3.96.83 3.06 0 5.16-1.51 5.16-4.14-.01-4.28-5.49-3.52-5.37-5.35z" fill="white"/>
      </svg>
      <span>Payment Receipt</span>
    </div>
    <h1>Receipt from EventsApp</h1>
    <p>Booking #${booking.bookingNumber}</p>
  </div>
  <div class="body">
    <div class="amount-box">
      <div class="label">Amount ${booking.paymentStatus === 'refunded' ? 'Refunded' : 'Paid'}</div>
      <div class="amount">${booking.pricingSnapshot.currency} ${booking.pricingSnapshot.totalAmount.toLocaleString()}</div>
      <div class="status ${isPaidReceipt ? (booking.paymentStatus === 'refunded' ? 'status-refunded' : 'status-paid') : 'status-pending'}">
        ${isPaidReceipt ? (booking.paymentStatus === 'refunded' ? 'Refunded' : 'Paid') : 'Pending'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Payment Details</div>
      ${booking.transactionId ? `<div class="row"><span class="label">Transaction ID</span><span class="value mono">${booking.transactionId}</span></div>` : ''}
      ${booking.paymentIntentId ? `<div class="row"><span class="label">Payment Intent</span><span class="value mono">${booking.paymentIntentId}</span></div>` : ''}
      <div class="row"><span class="label">Payment Method</span><span class="value">Card via Stripe</span></div>
      ${booking.paidAt ? `<div class="row"><span class="label">Date Paid</span><span class="value">${fmtDateTime(booking.paidAt)}</span></div>` : ''}
      ${booking.paymentStatus === 'refunded' && booking.refundId ? `<div class="row"><span class="label">Refund ID</span><span class="value mono">${booking.refundId}</span></div>` : ''}
      ${booking.paymentStatus === 'refunded' && booking.refundedAt ? `<div class="row"><span class="label">Date Refunded</span><span class="value">${fmtDateTime(booking.refundedAt)}</span></div>` : ''}
    </div>

    <div class="section">
      <div class="section-title">Booking Summary</div>
      <div class="row"><span class="label">Service</span><span class="value">${booking.listing.title}</span></div>
      <div class="row"><span class="label">Vendor</span><span class="value">${booking.vendor.businessName}</span></div>
      <div class="row"><span class="label">Event Date</span><span class="value">${fmtDate(booking.eventDate)}</span></div>
      ${booking.guestCount ? `<div class="row"><span class="label">Guests</span><span class="value">${booking.guestCount}</span></div>` : ''}
      ${booking.eventType ? `<div class="row"><span class="label">Event Type</span><span class="value">${booking.eventType}</span></div>` : ''}
    </div>

    <div class="section">
      <div class="section-title">Price Breakdown</div>
      <div class="row"><span class="label">Base Price</span><span class="value">${booking.pricingSnapshot.currency} ${booking.pricingSnapshot.basePrice.toLocaleString()}</span></div>
      <div class="row total"><span class="label">Total</span><span class="value">${booking.pricingSnapshot.currency} ${booking.pricingSnapshot.totalAmount.toLocaleString()}</span></div>
    </div>

    <div class="section">
      <div class="section-title">Customer</div>
      <div class="row"><span class="label">Name</span><span class="value">${booking.client.firstName} ${booking.client.lastName}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${booking.client.email}</span></div>
      ${booking.client.phone ? `<div class="row"><span class="label">Phone</span><span class="value">${booking.client.phone}</span></div>` : ''}
    </div>
  </div>
  <div class="footer">
    <p>This receipt was generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p style="margin-top:6px">Processed securely by <a href="#">Stripe</a> &mdash; EventsApp</p>
  </div>
</div>
</body></html>`;

    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(receiptHTML);
      receiptWindow.document.close();
      setTimeout(() => receiptWindow.print(), 500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton variant="text" width="30%" height={20} className="mb-4" />
        <Skeleton variant="text" width="50%" height={32} className="mb-8" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <Skeleton variant="card" height={200} />
            <Skeleton variant="card" height={200} />
          </div>
          <div className="lg:w-80">
            <Skeleton variant="card" height={300} />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const config = statusConfig[booking.status] || statusConfig[BOOKING_STATUSES.PENDING];
  const image = booking.listing.images?.[0]?.url;
  const eventDate = new Date(booking.eventDate);
  const canCancel = ([BOOKING_STATUSES.INQUIRY, BOOKING_STATUSES.PENDING, BOOKING_STATUSES.CONFIRMED] as string[]).includes(booking.status);
  const canReview = booking.status === BOOKING_STATUSES.COMPLETED && !booking.isReviewed;
  const isCancelledOrRejected = ([BOOKING_STATUSES.CANCELLED, BOOKING_STATUSES.REJECTED] as string[]).includes(booking.status);
  const isPaid = booking.paymentStatus === 'succeeded';
  const canPay = !isPaid && !isCancelledOrRejected && booking.paymentStatus !== 'refunded';

  // Determine which timeline steps are completed
  const statusOrder = ['inquiry', 'pending', 'accepted', 'confirmed', 'completed'];
  const currentStepIdx = isCancelledOrRejected ? -1 : statusOrder.indexOf(booking.status);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'My Bookings', href: '/my-bookings' },
            { label: `Booking #${booking.bookingNumber}` },
          ]}
          className="mb-4"
        />

        {/* Header with status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700">
              Booking #{booking.bookingNumber}
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Placed on {new Date(booking.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <Badge variant={config.variant} size="md" dot>
            {config.label}
          </Badge>
        </div>

        {/* Payment Status Banners */}
        {isPaid && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl mb-6">
            <HiCheckCircle className="h-6 w-6 text-green-500 shrink-0" />
            <div>
              <p className="font-semibold text-green-700 text-sm">Payment Successful</p>
              <p className="text-xs text-green-600">
                Your payment of {booking.pricingSnapshot.currency} {booking.pricingSnapshot.totalAmount.toLocaleString()} has been processed successfully.
                {booking.paidAt && ` Paid on ${new Date(booking.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}.`}
              </p>
            </div>
          </div>
        )}

        {booking.paymentStatus === 'refunded' && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl mb-6">
            <HiCreditCard className="h-6 w-6 text-blue-500 shrink-0" />
            <div>
              <p className="font-semibold text-blue-700 text-sm">Payment Refunded</p>
              <p className="text-xs text-blue-600">
                Your payment of {booking.pricingSnapshot.currency} {booking.pricingSnapshot.totalAmount.toLocaleString()} has been refunded.
                {booking.refundedAt && ` Refunded on ${new Date(booking.refundedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}.`}
              </p>
            </div>
          </div>
        )}

        {booking.paymentStatus === 'failed' && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-6">
            <HiExclamationTriangle className="h-6 w-6 text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Payment Failed</p>
              <p className="text-xs text-red-600">Your last payment attempt failed. Please try again using the Pay Now button.</p>
            </div>
          </div>
        )}

        {booking.paymentStatus === 'processing' && !showPaymentForm && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
            <HiClock className="h-6 w-6 text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold text-amber-700 text-sm">Payment Pending</p>
              <p className="text-xs text-amber-600">A payment was initiated but not completed. Click Pay Now to complete your payment.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            {/* Listing Info Card */}
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-4 p-6">
                <img
                  src={image || 'https://placehold.co/200x140?text=No+Image'}
                  alt={booking.listing.title}
                  className="w-full sm:w-48 h-32 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/listing/${booking.listing.slug}`}
                    className="text-lg font-semibold text-neutral-700 hover:text-primary-500 transition-colors line-clamp-2"
                  >
                    {booking.listing.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500">
                    <HiMapPin className="h-4 w-4" />
                    <span>{booking.listing.address?.city}, {booking.listing.address?.country}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-neutral-700">
                      PKR {booking.listing.pricing?.basePrice?.toLocaleString()}
                    </span>
                    <span className="text-sm text-neutral-400 ml-1">/ {booking.listing.pricing?.priceUnit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">Booking Details</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <HiCalendarDays className="h-5 w-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Event Date</p>
                    <p className="text-sm text-neutral-500">
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {booking.guestCount && (
                  <div className="flex items-start gap-3">
                    <HiUserGroup className="h-5 w-5 text-neutral-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-700">Guests</p>
                      <p className="text-sm text-neutral-500">{booking.guestCount} guests</p>
                    </div>
                  </div>
                )}
                {booking.eventType && (
                  <div className="flex items-start gap-3">
                    <HiCalendarDays className="h-5 w-5 text-neutral-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-700">Event Type</p>
                      <p className="text-sm text-neutral-500">{booking.eventType}</p>
                    </div>
                  </div>
                )}
                {booking.clientMessage && (
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-1">Special Requests</p>
                    <p className="text-sm text-neutral-500 bg-neutral-50 rounded-xl p-4">
                      {booking.clientMessage}
                    </p>
                  </div>
                )}
                {booking.vendorResponse && (
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-1">Vendor Response</p>
                    <p className="text-sm text-neutral-500 bg-green-50 rounded-xl p-4">
                      {booking.vendorResponse}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">Price Breakdown</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Base price</span>
                  <span className="text-neutral-600">
                    PKR {booking.pricingSnapshot.basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-3 border-t border-neutral-100 font-semibold">
                  <span className="text-neutral-700">Total ({booking.pricingSnapshot.currency})</span>
                  <span className="text-neutral-700 text-lg">
                    PKR {booking.pricingSnapshot.totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Payment Status */}
                {booking.paymentStatus && (
                  <div className={`flex items-center justify-between text-sm pt-3 border-t border-neutral-100 ${
                    isPaid ? 'text-green-600'
                      : booking.paymentStatus === 'refunded' ? 'text-blue-600'
                      : booking.paymentStatus === 'failed' ? 'text-red-500'
                      : 'text-amber-500'
                  }`}>
                    <span className="flex items-center gap-1.5 font-medium">
                      <HiCreditCard className="h-4 w-4" />
                      Payment
                    </span>
                    <span className="font-semibold capitalize">{booking.paymentStatus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Details */}
            {(isPaid || booking.paymentStatus === 'refunded') && (
              <div className="bg-white rounded-2xl border border-neutral-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="h-5 w-auto" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.27 4.06-.78v2.96c-1.12.57-2.7.89-4.54.89-4.14 0-6.74-2.58-6.74-6.87 0-3.81 2.27-6.96 6.24-6.96 3.94 0 5.89 2.93 5.89 6.59 0 .49-.05 1.15-.05 1.62zm-4.03-5.17c0-.82-.31-2.66-2.2-2.66-1.65 0-2.35 1.56-2.49 2.66h4.69zM40.95 20.9c-1.55 0-2.81-.38-3.76-1.05l-.04 4.68-4.04.86V6.35h3.49l.18 1.05c.98-.82 2.28-1.33 3.77-1.33 3.38 0 5.48 3.06 5.48 7.22 0 4.72-2.38 7.61-5.08 7.61zm-.87-12.04c-.95 0-1.62.29-2.14.85l.05 7.23c.48.5 1.12.78 2.09.78 1.65 0 2.72-1.82 2.72-4.48 0-2.56-1.05-4.38-2.72-4.38zM28.24 5.57c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm-2.03.78h4.04V20.6h-4.04V6.35zM22.47 7.95l-.25-1.6h-3.46v14.25h4.04V11.4c.96-1.24 2.58-1.01 3.09-.84V6.35c-.53-.19-2.46-.54-3.42 1.6zM13.23 2.07l-3.96.84-.01 13.04c0 2.41 1.8 4.18 4.22 4.18 1.34 0 2.31-.24 2.85-.54v-3.11c-.51.21-3.07.95-3.07-1.43V9.6h3.07V6.35h-3.07l-.03-4.28zM3.87 10.24c0-.57.47-.79 1.25-.79.95 0 2.24.34 3.37.95V6.86c-1.12-.45-2.23-.62-3.37-.62C2.14 6.24 0 7.95 0 10.53c0 3.97 5.47 3.34 5.47 5.05 0 .67-.58.89-1.39.89-1.2 0-2.74-.5-3.96-1.17v3.6c1.35.58 2.71.83 3.96.83 3.06 0 5.16-1.51 5.16-4.14-.01-4.28-5.49-3.52-5.37-5.35z" fill="#635BFF"/>
                  </svg>
                  <h3 className="font-semibold text-neutral-700">Transaction Details</h3>
                </div>

                <div className="space-y-3">
                  {booking.transactionId && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs text-neutral-400 shrink-0">Transaction ID</span>
                      <span className="text-xs font-mono text-neutral-600 text-right break-all">
                        {booking.transactionId}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Amount</span>
                    <span className="text-sm font-semibold text-neutral-700">
                      {booking.pricingSnapshot.currency} {booking.pricingSnapshot.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Status</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isPaid
                        ? 'bg-green-50 text-green-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {isPaid ? 'Paid' : 'Refunded'}
                    </span>
                  </div>

                  {booking.paidAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400">Paid On</span>
                      <span className="text-xs text-neutral-600">
                        {new Date(booking.paidAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}{' '}
                        {new Date(booking.paidAt).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  {booking.paymentStatus === 'refunded' && (
                    <>
                      {booking.refundId && (
                        <div className="flex items-start justify-between gap-2 pt-2 border-t border-neutral-100">
                          <span className="text-xs text-neutral-400 shrink-0">Refund ID</span>
                          <span className="text-xs font-mono text-neutral-600 text-right break-all">
                            {booking.refundId}
                          </span>
                        </div>
                      )}
                      {booking.refundedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-400">Refunded On</span>
                          <span className="text-xs text-neutral-600">
                            {new Date(booking.refundedAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}{' '}
                            {new Date(booking.refundedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-neutral-100 text-[10px] text-neutral-400">
                  <HiLockClosed className="h-3 w-3" />
                  <span>Processed securely via Stripe</span>
                </div>
              </div>
            )}

            {/* Inline Payment Form */}
            {showPaymentForm && clientSecret && (
              <div className="bg-white rounded-2xl border-2 border-primary-200 p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                  <HiShieldCheck className="h-5 w-5 text-green-500 shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-700 text-sm">Secure Checkout</p>
                    <p className="text-xs text-neutral-500">Powered by Stripe — 256-bit SSL encrypted</p>
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-neutral-700">Payment Method</h2>

                {/* Card brand logos */}
                <div className="flex items-center gap-2">
                  <div className="w-11 h-7 rounded border border-neutral-200 bg-white flex items-center justify-center">
                    <span className="text-[10px] font-extrabold tracking-tight text-blue-700 italic">VISA</span>
                  </div>
                  <div className="w-11 h-7 rounded border border-neutral-200 bg-white flex items-center justify-center">
                    <div className="flex -space-x-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-red-500 opacity-90" />
                      <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 opacity-90" />
                    </div>
                  </div>
                  <div className="w-11 h-7 rounded border border-neutral-200 bg-white flex items-center justify-center">
                    <span className="text-[8px] font-bold text-blue-500">AMEX</span>
                  </div>
                  <div className="w-11 h-7 rounded border border-neutral-200 bg-white flex items-center justify-center">
                    <span className="text-[7px] font-bold text-red-600">UnionPay</span>
                  </div>
                  <span className="text-xs text-neutral-400 ml-1">& more</span>
                </div>

                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <InlinePaymentForm
                    booking={booking}
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>

                <button
                  onClick={() => { setShowPaymentForm(false); setClientSecret(null); }}
                  className="w-full text-center text-sm text-neutral-400 hover:text-neutral-600 transition-colors py-1"
                >
                  Cancel Payment
                </button>
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="lg:w-80 space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="font-semibold text-neutral-700 mb-4">Status Timeline</h3>
              <div className="space-y-0">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = !isCancelledOrRejected && idx <= currentStepIdx;
                  const isCurrent = !isCancelledOrRejected && idx === currentStepIdx;

                  return (
                    <div key={step.status} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                            isCompleted
                              ? 'bg-primary-500 border-primary-500'
                              : 'bg-white border-neutral-300'
                          }`}
                        >
                          {isCompleted && (
                            <HiCheckCircle className="h-3 w-3 text-white mt-px ml-px" />
                          )}
                        </div>
                        {idx < TIMELINE_STEPS.length - 1 && (
                          <div
                            className={`w-0.5 h-8 ${
                              isCompleted && !isCurrent ? 'bg-primary-500' : 'bg-neutral-200'
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-6">
                        <p
                          className={`text-sm font-medium ${
                            isCurrent ? 'text-primary-500' : isCompleted ? 'text-neutral-700' : 'text-neutral-400'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {isCancelledOrRejected && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-error border-2 border-error shrink-0" />
                    </div>
                    <p className="text-sm font-medium text-error">
                      {booking.status === BOOKING_STATUSES.CANCELLED ? 'Cancelled' : 'Rejected'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Vendor Info */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="font-semibold text-neutral-700 mb-4">Vendor</h3>
              <div className="flex items-center gap-3">
                <Avatar name={booking.vendor.businessName} size="md" />
                <div>
                  <Link
                    to={`/vendor/${booking.vendor.businessSlug}`}
                    className="text-sm font-semibold text-neutral-700 hover:text-primary-500 transition-colors"
                  >
                    {booking.vendor.businessName}
                  </Link>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-3">
              <h3 className="font-semibold text-neutral-700 mb-2">Actions</h3>

              {canPay && !showPaymentForm && (
                <div className="space-y-3">
                  <button
                    onClick={handlePayNow}
                    disabled={paymentLoading}
                    className="group w-full flex items-center justify-center gap-3 px-7 py-4 bg-[#635BFF] hover:bg-[#5851DF] active:bg-[#4B45C7] text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#635BFF]/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(99,91,255,0.4)] hover:shadow-[0_6px_20px_rgba(99,91,255,0.5)]"
                  >
                    {paymentLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-auto" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.27 4.06-.78v2.96c-1.12.57-2.7.89-4.54.89-4.14 0-6.74-2.58-6.74-6.87 0-3.81 2.27-6.96 6.24-6.96 3.94 0 5.89 2.93 5.89 6.59 0 .49-.05 1.15-.05 1.62zm-4.03-5.17c0-.82-.31-2.66-2.2-2.66-1.65 0-2.35 1.56-2.49 2.66h4.69zM40.95 20.9c-1.55 0-2.81-.38-3.76-1.05l-.04 4.68-4.04.86V6.35h3.49l.18 1.05c.98-.82 2.28-1.33 3.77-1.33 3.38 0 5.48 3.06 5.48 7.22 0 4.72-2.38 7.61-5.08 7.61zm-.87-12.04c-.95 0-1.62.29-2.14.85l.05 7.23c.48.5 1.12.78 2.09.78 1.65 0 2.72-1.82 2.72-4.48 0-2.56-1.05-4.38-2.72-4.38zM28.24 5.57c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm-2.03.78h4.04V20.6h-4.04V6.35zM22.47 7.95l-.25-1.6h-3.46v14.25h4.04V11.4c.96-1.24 2.58-1.01 3.09-.84V6.35c-.53-.19-2.46-.54-3.42 1.6zM13.23 2.07l-3.96.84-.01 13.04c0 2.41 1.8 4.18 4.22 4.18 1.34 0 2.31-.24 2.85-.54v-3.11c-.51.21-3.07.95-3.07-1.43V9.6h3.07V6.35h-3.07l-.03-4.28zM3.87 10.24c0-.57.47-.79 1.25-.79.95 0 2.24.34 3.37.95V6.86c-1.12-.45-2.23-.62-3.37-.62C2.14 6.24 0 7.95 0 10.53c0 3.97 5.47 3.34 5.47 5.05 0 .67-.58.89-1.39.89-1.2 0-2.74-.5-3.96-1.17v3.6c1.35.58 2.71.83 3.96.83 3.06 0 5.16-1.51 5.16-4.14-.01-4.28-5.49-3.52-5.37-5.35z" fill="white"/>
                      </svg>
                    )}
                    <span className="text-lg">{booking.paymentStatus === 'failed' ? 'Retry Payment' : 'Pay Now'}</span>
                  </button>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
                    <HiLockClosed className="h-3 w-3" />
                    <span>Powered by</span>
                    <svg className="h-3.5 w-auto" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.27 4.06-.78v2.96c-1.12.57-2.7.89-4.54.89-4.14 0-6.74-2.58-6.74-6.87 0-3.81 2.27-6.96 6.24-6.96 3.94 0 5.89 2.93 5.89 6.59 0 .49-.05 1.15-.05 1.62zm-4.03-5.17c0-.82-.31-2.66-2.2-2.66-1.65 0-2.35 1.56-2.49 2.66h4.69zM40.95 20.9c-1.55 0-2.81-.38-3.76-1.05l-.04 4.68-4.04.86V6.35h3.49l.18 1.05c.98-.82 2.28-1.33 3.77-1.33 3.38 0 5.48 3.06 5.48 7.22 0 4.72-2.38 7.61-5.08 7.61zm-.87-12.04c-.95 0-1.62.29-2.14.85l.05 7.23c.48.5 1.12.78 2.09.78 1.65 0 2.72-1.82 2.72-4.48 0-2.56-1.05-4.38-2.72-4.38zM28.24 5.57c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm-2.03.78h4.04V20.6h-4.04V6.35zM22.47 7.95l-.25-1.6h-3.46v14.25h4.04V11.4c.96-1.24 2.58-1.01 3.09-.84V6.35c-.53-.19-2.46-.54-3.42 1.6zM13.23 2.07l-3.96.84-.01 13.04c0 2.41 1.8 4.18 4.22 4.18 1.34 0 2.31-.24 2.85-.54v-3.11c-.51.21-3.07.95-3.07-1.43V9.6h3.07V6.35h-3.07l-.03-4.28zM3.87 10.24c0-.57.47-.79 1.25-.79.95 0 2.24.34 3.37.95V6.86c-1.12-.45-2.23-.62-3.37-.62C2.14 6.24 0 7.95 0 10.53c0 3.97 5.47 3.34 5.47 5.05 0 .67-.58.89-1.39.89-1.2 0-2.74-.5-3.96-1.17v3.6c1.35.58 2.71.83 3.96.83 3.06 0 5.16-1.51 5.16-4.14-.01-4.28-5.49-3.52-5.37-5.35z" fill="#635BFF"/>
                    </svg>
                  </div>
                </div>
              )}

              {canCancel && (
                <Button
                  variant="danger"
                  fullWidth
                  leftIcon={<HiOutlineXCircle className="h-5 w-5" />}
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel Booking
                </Button>
              )}

              {canReview && (
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<HiOutlinePencilSquare className="h-5 w-5" />}
                  onClick={() => navigate(`/review/${booking._id}`)}
                >
                  Write a Review
                </Button>
              )}

              <Button
                variant="outline"
                fullWidth
                leftIcon={<HiOutlineChatBubbleLeftRight className="h-5 w-5" />}
                onClick={() => navigate('/inbox')}
              >
                Contact Vendor
              </Button>

              <button
                onClick={handlePrintReceipt}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
              >
                <HiOutlinePrinter className="h-4 w-4" />
                Print / Download Receipt
              </button>
            </div>

            {/* Your Review */}
            {booking.isReviewed && reviewData && (
              <div className="bg-white rounded-2xl border border-neutral-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral-700">Your Review</h3>
                  <button
                    onClick={() => setShowDeleteReviewDialog(true)}
                    className="p-1.5 text-neutral-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                    title="Delete Review"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <StarRating rating={reviewData.rating} size="sm" />
                    <span className="text-xs text-neutral-400">
                      {new Date(reviewData.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>

                  {reviewData.title && (
                    <p className="text-sm font-semibold text-neutral-700">{reviewData.title}</p>
                  )}

                  <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-wrap">
                    {reviewData.comment}
                  </p>

                  {reviewData.detailedRatings && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {reviewData.detailedRatings.quality != null && (
                        <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full">
                          Quality: {reviewData.detailedRatings.quality}/5
                        </span>
                      )}
                      {reviewData.detailedRatings.communication != null && (
                        <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full">
                          Communication: {reviewData.detailedRatings.communication}/5
                        </span>
                      )}
                      {reviewData.detailedRatings.valueForMoney != null && (
                        <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full">
                          Value: {reviewData.detailedRatings.valueForMoney}/5
                        </span>
                      )}
                      {reviewData.detailedRatings.punctuality != null && (
                        <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full">
                          Punctuality: {reviewData.detailedRatings.punctuality}/5
                        </span>
                      )}
                    </div>
                  )}

                  {reviewData.vendorReply && (
                    <div className="mt-2 pl-3 border-l-2 border-primary-200 bg-primary-50/50 rounded-r-lg p-3">
                      <p className="text-xs font-medium text-neutral-600 mb-1">Vendor Reply</p>
                      <p className="text-sm text-neutral-500">{reviewData.vendorReply.comment}</p>
                      <p className="text-xs text-neutral-300 mt-1">
                        {new Date(reviewData.vendorReply.repliedAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message={
          isPaid
            ? 'Are you sure you want to cancel this booking? Your payment of PKR ' +
              booking.pricingSnapshot.totalAmount.toLocaleString() +
              ' will be refunded to your original payment method. This action cannot be undone.'
            : 'Are you sure you want to cancel this booking? This action cannot be undone.'
        }
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Booking"
        destructive
        loading={cancelling}
      />

      {/* Delete Review Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteReviewDialog}
        onClose={() => setShowDeleteReviewDialog(false)}
        onConfirm={handleDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete your review? This action cannot be undone."
        confirmLabel="Yes, Delete"
        cancelLabel="Keep Review"
        destructive
        loading={deletingReview}
      />
    </div>
  );
};

export default BookingDetailPage;