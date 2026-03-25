import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { HiChevronLeft, HiShieldCheck, HiLockClosed, HiCheckCircle, HiExclamationTriangle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { bookingApi } from '../../../services/api/bookingApi';
import { paymentApi } from '../../../services/api/paymentApi';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';
import type { Booking } from '../../../types';

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

// Inner payment form component (must be inside <Elements>)
const PaymentForm: React.FC<{
  booking: Booking;
  clientSecret: string;
  onSuccess: () => void;
}> = ({ booking, clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${booking.client.firstName} ${booking.client.lastName}`,
            email: booking.client.email,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
      } else if (paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Card Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Card Details
        </label>
        <div className="p-4 border border-neutral-200 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
          <HiExclamationTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Security Note */}
      <div className="flex items-center gap-2 text-neutral-400 text-xs mb-6">
        <HiLockClosed className="h-4 w-4" />
        <span>Your payment info is encrypted and secure. We never store your card details.</span>
      </div>

      {/* Pay Button */}
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

// Main CheckoutPage component
const CheckoutPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    const initCheckout = async () => {
      setLoading(true);
      try {
        // Fetch booking details
        const bookingRes = await bookingApi.getById(bookingId);
        const bookingData = bookingRes.data.data.booking;
        setBooking(bookingData);

        // If already paid, show success state
        if (bookingData.paymentStatus === 'succeeded') {
          setPaymentSuccess(true);
          setLoading(false);
          return;
        }

        // Create payment intent
        const paymentRes = await paymentApi.createIntent(bookingId);
        setClientSecret(paymentRes.data.data.clientSecret);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        const msg = error.response?.data?.message || 'Failed to initialize checkout';
        toast.error(msg);
        console.error('Checkout init error:', err);
        navigate('/my-bookings');
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, [bookingId, navigate]);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton variant="text" width="40%" height={32} className="mb-8" />
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-6">
            <Skeleton variant="rect" height={200} />
            <Skeleton variant="rect" height={80} />
          </div>
          <div className="lg:w-[380px]">
            <Skeleton variant="card" height={300} />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const image = booking.listing.images?.[0]?.url;

  // Payment Success State
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-700 mb-2">Payment Successful!</h1>
          <p className="text-neutral-500 mb-2">
            Your payment of <span className="font-semibold text-neutral-700">PKR {booking.pricingSnapshot.totalAmount.toLocaleString()}</span> has been processed.
          </p>
          <p className="text-sm text-neutral-400 mb-8">
            Booking #{booking.bookingNumber} — You'll receive a confirmation email shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate(`/my-bookings/${booking._id}`)}>
              View Booking Details
            </Button>
            <Button variant="outline" onClick={() => navigate('/my-bookings')}>
              My Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <HiChevronLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700">Complete Payment</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left side - Payment Form */}
          <div className="flex-1 space-y-8">
            {/* Secure Payment Badge */}
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl">
              <HiShieldCheck className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium text-neutral-700 text-sm">Secure Checkout</p>
                <p className="text-xs text-neutral-500">Powered by Stripe — 256-bit SSL encrypted</p>
              </div>
            </div>

            {/* Stripe Payment Form */}
            {clientSecret && (
              <div>
                <h2 className="text-lg font-semibold text-neutral-700 mb-4">Payment Method</h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm
                    booking={booking}
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              </div>
            )}

            {/* Terms */}
            <p className="text-xs text-neutral-400">
              By completing this payment, you agree to the{' '}
              <Link to="/terms" className="underline hover:text-neutral-600">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline hover:text-neutral-600">Privacy Policy</Link>.
            </p>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                {/* Listing card */}
                <div className="flex gap-4 p-4 border-b border-neutral-100">
                  <img
                    src={image || 'https://placehold.co/120x90?text=No+Image'}
                    alt={booking.listing.title}
                    className="w-28 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-400 uppercase tracking-wide">
                      Booking #{booking.bookingNumber}
                    </p>
                    <h3 className="text-sm font-semibold text-neutral-700 line-clamp-2 mt-0.5">
                      {booking.listing.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(booking.eventDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-neutral-700">Order Summary</h3>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Base price</span>
                    <span className="text-neutral-600">
                      PKR {booking.pricingSnapshot.basePrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-3 border-t border-neutral-100 font-semibold">
                    <span className="text-neutral-700">Total</span>
                    <span className="text-neutral-700 text-lg">
                      PKR {booking.pricingSnapshot.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;