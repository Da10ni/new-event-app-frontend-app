import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiCalendarDays,
  HiUserGroup,
  HiCurrencyDollar,
  HiChatBubbleLeftRight,
  HiPhone,
  HiEnvelope,
  HiMapPin,
  HiClock,
  HiDocumentText,
  HiExclamationTriangle,
} from 'react-icons/hi2';
import { bookingApi } from '../../../services/api/bookingApi';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import TextArea from '../../../components/ui/TextArea';
import LoadingSpinner from '../../../components/feedback/LoadingSpinner';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import toast from 'react-hot-toast';
import type { Booking } from '../../../types';

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'confirmed': return 'success';
    case 'pending': return 'warning';
    case 'inquiry': return 'info';
    case 'completed': return 'success';
    case 'cancelled': return 'error';
    case 'rejected': return 'error';
    case 'accepted': return 'info';
    default: return 'default';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatShortDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

interface StatusTimelineItem {
  status: string;
  label: string;
  date?: string;
  isActive: boolean;
  isCompleted: boolean;
}

const getStatusTimeline = (booking: Booking): StatusTimelineItem[] => {
  const statusOrder = ['inquiry', 'accepted', 'confirmed', 'completed'];
  const currentIndex = statusOrder.indexOf(booking.status);

  if (booking.status === 'cancelled' || booking.status === 'rejected') {
    return [
      { status: 'inquiry', label: 'Inquiry Received', date: booking.createdAt, isActive: false, isCompleted: true },
      { status: booking.status, label: booking.status === 'cancelled' ? 'Cancelled' : 'Rejected', date: booking.createdAt, isActive: true, isCompleted: false },
    ];
  }

  return statusOrder.map((status, idx) => ({
    status,
    label: status === 'inquiry' ? 'Inquiry Received' : status === 'accepted' ? 'Accepted' : status === 'confirmed' ? 'Confirmed' : 'Completed',
    date: idx <= currentIndex ? booking.createdAt : undefined,
    isActive: idx === currentIndex,
    isCompleted: idx < currentIndex,
  }));
};

const ProviderBookingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [vendorResponse, setVendorResponse] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: string;
    destructive: boolean;
  }>({ open: false, title: '', message: '', action: '', destructive: false });

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await bookingApi.getById(id);
      setBooking(res.data?.data?.booking || null);
    } catch {
      toast.error('Failed to load booking details');
      navigate('/provider/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!booking) return;
    setActionLoading(true);
    try {
      if (action === 'completed') {
        await bookingApi.complete(booking._id);
      } else if (action === 'cancelled') {
        await bookingApi.cancel(booking._id, vendorResponse || 'Cancelled by vendor');
      } else {
        await bookingApi.updateStatus(booking._id, {
          status: action,
          vendorResponse: vendorResponse || undefined,
        });
      }
      toast.success(`Booking ${action} successfully`);
      setConfirmDialog({ open: false, title: '', message: '', action: '', destructive: false });
      setVendorResponse('');
      fetchBooking();
    } catch {
      toast.error(`Failed to ${action} booking`);
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirm = (action: string, title: string, message: string, destructive = false) => {
    setConfirmDialog({ open: true, title, message, action, destructive });
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Loading booking..." />;
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-400">Booking not found.</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/provider/bookings')}>
          Back to Bookings
        </Button>
      </div>
    );
  }

  const timeline = getStatusTimeline(booking);

  const renderActionButtons = () => {
    switch (booking.status) {
      case 'inquiry':
      case 'pending':
        return (
          <div className="space-y-3">
            <TextArea
              placeholder="Add a response message (optional)..."
              value={vendorResponse}
              onChange={(e) => setVendorResponse(e.target.value)}
              rows={3}
            />
            <div className="flex gap-3">
              <Button
                variant="primary"
                fullWidth
                leftIcon={<HiCheckCircle className="h-5 w-5" />}
                onClick={() => openConfirm('accepted', 'Accept Booking', 'Are you sure you want to accept this booking inquiry?')}
                loading={actionLoading}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                fullWidth
                leftIcon={<HiXCircle className="h-5 w-5" />}
                onClick={() => openConfirm('rejected', 'Reject Booking', 'Are you sure you want to reject this booking?', true)}
                disabled={actionLoading}
              >
                Reject
              </Button>
            </div>
          </div>
        );
      case 'accepted':
        return (
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              leftIcon={<HiCheckCircle className="h-5 w-5" />}
              onClick={() => openConfirm('confirmed', 'Confirm Booking', 'Confirm this booking? The client will be notified.')}
              loading={actionLoading}
            >
              Confirm Booking
            </Button>
            <Button
              variant="danger"
              fullWidth
              leftIcon={<HiXCircle className="h-5 w-5" />}
              onClick={() => openConfirm('rejected', 'Reject Booking', 'Are you sure you want to reject this accepted booking?', true)}
              disabled={actionLoading}
            >
              Reject
            </Button>
          </div>
        );
      case 'confirmed':
        return (
          <div className="space-y-3">
            <Button
              variant="secondary"
              fullWidth
              leftIcon={<HiCheckCircle className="h-5 w-5" />}
              onClick={() => openConfirm('completed', 'Mark Complete', 'Mark this booking as completed? This confirms the event has taken place.')}
              loading={actionLoading}
            >
              Mark as Complete
            </Button>
            <Button
              variant="danger"
              fullWidth
              leftIcon={<HiXCircle className="h-5 w-5" />}
              onClick={() => openConfirm('cancelled', 'Cancel Booking', 'Are you sure you want to cancel this confirmed booking? The client will be notified.', true)}
              disabled={actionLoading}
            >
              Cancel Booking
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/provider/bookings')}
          className="p-2 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
        >
          <HiArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-neutral-600">
              Booking #{booking.bookingNumber}
            </h1>
            <Badge variant={statusBadgeVariant(booking.status)} size="md" dot>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-neutral-400 mt-0.5">
            Created {formatShortDate(booking.createdAt)}
          </p>
        </div>
      </div>

      {/* Two-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <Card padding="md">
            <h3 className="text-base font-semibold text-neutral-600 mb-4 flex items-center gap-2">
              <HiUserGroup className="h-5 w-5 text-primary-500" />
              Client Information
            </h3>
            <div className="flex items-start gap-4">
              <Avatar
                src={booking.client?.avatar?.url}
                name={`${booking.client?.firstName} ${booking.client?.lastName}`}
                size="lg"
              />
              <div className="flex-1 space-y-2">
                <p className="text-lg font-semibold text-neutral-600">
                  {booking.client?.firstName} {booking.client?.lastName}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <a
                    href={`mailto:${booking.client?.email}`}
                    className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-primary-500 transition-colors"
                  >
                    <HiEnvelope className="h-4 w-4" />
                    {booking.client?.email}
                  </a>
                  {booking.client?.phone && (
                    <a
                      href={`tel:${booking.client?.phone}`}
                      className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-primary-500 transition-colors"
                    >
                      <HiPhone className="h-4 w-4" />
                      {booking.client?.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Booking Details */}
          <Card padding="md">
            <h3 className="text-base font-semibold text-neutral-600 mb-4 flex items-center gap-2">
              <HiCalendarDays className="h-5 w-5 text-primary-500" />
              Booking Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-neutral-300 uppercase font-medium">Listing</p>
                <Link
                  to={`/listings/${booking.listing?.slug}`}
                  className="text-sm text-primary-500 font-medium hover:underline"
                >
                  {booking.listing?.title || 'N/A'}
                </Link>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-300 uppercase font-medium">Event Date</p>
                <p className="text-sm text-neutral-600 font-medium">{formatDate(booking.eventDate)}</p>
              </div>
              {booking.eventEndDate && (
                <div className="space-y-1">
                  <p className="text-xs text-neutral-300 uppercase font-medium">End Date</p>
                  <p className="text-sm text-neutral-600 font-medium">{formatDate(booking.eventEndDate)}</p>
                </div>
              )}
              {booking.eventType && (
                <div className="space-y-1">
                  <p className="text-xs text-neutral-300 uppercase font-medium">Event Type</p>
                  <p className="text-sm text-neutral-600 font-medium capitalize">{booking.eventType}</p>
                </div>
              )}
              {booking.guestCount && (
                <div className="space-y-1">
                  <p className="text-xs text-neutral-300 uppercase font-medium">Guest Count</p>
                  <p className="text-sm text-neutral-600 font-medium">{booking.guestCount} guests</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-neutral-300 uppercase font-medium">Location</p>
                <p className="text-sm text-neutral-500 flex items-center gap-1">
                  <HiMapPin className="h-3.5 w-3.5" />
                  {booking.listing?.address?.city}, {booking.listing?.address?.country}
                </p>
              </div>
            </div>

            {booking.clientMessage && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-300 uppercase font-medium mb-1.5">Client Message</p>
                <div className="bg-neutral-50 rounded-xl p-3">
                  <p className="text-sm text-neutral-500 whitespace-pre-wrap">{booking.clientMessage}</p>
                </div>
              </div>
            )}

            {booking.vendorResponse && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-300 uppercase font-medium mb-1.5">Your Response</p>
                <div className="bg-primary-50 rounded-xl p-3">
                  <p className="text-sm text-neutral-500 whitespace-pre-wrap">{booking.vendorResponse}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Price Breakdown */}
          <Card padding="md">
            <h3 className="text-base font-semibold text-neutral-600 mb-4 flex items-center gap-2">
              <HiCurrencyDollar className="h-5 w-5 text-primary-500" />
              Price Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Base Price</span>
                <span className="text-sm font-medium text-neutral-600">
                  {formatCurrency(booking.pricingSnapshot?.basePrice || 0)}
                </span>
              </div>
              <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
                <span className="text-base font-semibold text-neutral-600">Total Amount</span>
                <span className="text-lg font-bold text-primary-500">
                  {formatCurrency(booking.pricingSnapshot?.totalAmount || 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Internal Notes */}
          <Card padding="md">
            <h3 className="text-base font-semibold text-neutral-600 mb-4 flex items-center gap-2">
              <HiDocumentText className="h-5 w-5 text-primary-500" />
              Internal Notes
            </h3>
            <TextArea
              placeholder="Add internal notes about this booking (only visible to you)..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-neutral-300 mt-2">
              These notes are for your reference only and are not visible to the client.
            </p>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card padding="md">
            <h3 className="text-base font-semibold text-neutral-600 mb-4 flex items-center gap-2">
              <HiClock className="h-5 w-5 text-primary-500" />
              Status Timeline
            </h3>
            <div className="space-y-0">
              {timeline.map((item, idx) => (
                <div key={item.status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        item.isCompleted
                          ? 'bg-green-500 text-white'
                          : item.isActive
                          ? item.status === 'cancelled' || item.status === 'rejected'
                            ? 'bg-error text-white'
                            : 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-300'
                      }`}
                    >
                      {item.isCompleted ? (
                        <HiCheckCircle className="h-4 w-4" />
                      ) : item.isActive && (item.status === 'cancelled' || item.status === 'rejected') ? (
                        <HiXCircle className="h-4 w-4" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-current" />
                      )}
                    </div>
                    {idx < timeline.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${
                          item.isCompleted ? 'bg-green-500' : 'bg-neutral-100'
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-6">
                    <p
                      className={`text-sm font-medium ${
                        item.isActive || item.isCompleted ? 'text-neutral-600' : 'text-neutral-300'
                      }`}
                    >
                      {item.label}
                    </p>
                    {item.date && (
                      <p className="text-xs text-neutral-300 mt-0.5">
                        {formatShortDate(item.date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <Card padding="md">
            <h3 className="text-base font-semibold text-neutral-600 mb-4">Actions</h3>
            {renderActionButtons() || (
              <p className="text-sm text-neutral-400 text-center py-2">
                No actions available for this booking status.
              </p>
            )}
          </Card>

          {/* Quick Info */}
          <Card padding="md">
            <h3 className="text-base font-semibold text-neutral-600 mb-3">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Booking #</span>
                <span className="font-medium text-neutral-600">{booking.bookingNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Created</span>
                <span className="font-medium text-neutral-500">{formatShortDate(booking.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Reviewed</span>
                <span className="font-medium text-neutral-500">{booking.isReviewed ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, title: '', message: '', action: '', destructive: false })}
        onConfirm={() => handleAction(confirmDialog.action)}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.action.charAt(0).toUpperCase() + confirmDialog.action.slice(1)}
        destructive={confirmDialog.destructive}
        loading={actionLoading}
      />
    </div>
  );
};

export default ProviderBookingDetailPage;
