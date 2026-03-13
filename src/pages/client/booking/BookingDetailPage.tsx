import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiCalendarDays, HiMapPin, HiUserGroup, HiChevronLeft, HiOutlinePrinter,
  HiOutlineChatBubbleLeftRight, HiOutlineXCircle, HiOutlinePencilSquare,
  HiCheckCircle, HiClock, HiXCircle, HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { bookingApi } from '../../../services/api/bookingApi';


import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import Skeleton from '../../../components/ui/Skeleton';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import RatingDisplay from '../../../components/listing/RatingDisplay';
import type { Booking } from '../../../types';
import { BOOKING_STATUSES } from '../../../config';

const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'error' | 'info'; icon: React.ReactNode; label: string }> = {
  [BOOKING_STATUSES.INQUIRY]: { variant: 'warning', icon: <HiOutlineExclamationCircle className="h-5 w-5" />, label: 'Inquiry Sent' },
  [BOOKING_STATUSES.PENDING]: { variant: 'warning', icon: <HiClock className="h-5 w-5" />, label: 'Pending Confirmation' },
  [BOOKING_STATUSES.CONFIRMED]: { variant: 'success', icon: <HiCheckCircle className="h-5 w-5" />, label: 'Confirmed' },
  [BOOKING_STATUSES.REJECTED]: { variant: 'error', icon: <HiXCircle className="h-5 w-5" />, label: 'Rejected' },
  [BOOKING_STATUSES.CANCELLED]: { variant: 'error', icon: <HiXCircle className="h-5 w-5" />, label: 'Cancelled' },
  [BOOKING_STATUSES.COMPLETED]: { variant: 'info', icon: <HiCheckCircle className="h-5 w-5" />, label: 'Completed' },
};

const TIMELINE_STEPS = [
  { status: 'inquiry', label: 'Inquiry Sent' },
  { status: 'pending', label: 'Pending' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'completed', label: 'Completed' },
];

const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
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
    fetchBooking();
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      await bookingApi.cancel(booking._id, 'Cancelled by client');
      toast.success('Booking cancelled successfully');
      setBooking({ ...booking, status: 'cancelled' });
      setShowCancelDialog(false);
    } catch {
      toast.error('Failed to cancel booking');
    } finally {
      setCancelling(false);
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

  // Determine which timeline steps are completed
  const statusOrder = ['inquiry', 'pending', 'confirmed', 'completed'];
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
                    <span>{booking.listing.address.city}, {booking.listing.address.country}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-neutral-700">
                      PKR {booking.listing.pricing.basePrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-neutral-400 ml-1">/ {booking.listing.pricing.priceUnit}</span>
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
              </div>
            </div>
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
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
              >
                <HiOutlinePrinter className="h-4 w-4" />
                Print / Download Receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Booking"
        destructive
        loading={cancelling}
      />
    </div>
  );
};

export default BookingDetailPage;
