import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCalendarDays, HiMapPin, HiOutlineTicket } from 'react-icons/hi2';
import { bookingApi } from '../../../services/api/bookingApi';
import { useAppDispatch } from '../../../store/hooks';
import { setBookings as setBookingsStore } from '../../../store/slices/bookingSlice';
import Tabs from '../../../components/ui/Tabs';
import Badge from '../../../components/ui/Badge';
import Pagination from '../../../components/ui/Pagination';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/feedback/EmptyState';
import type { Booking, PaginationMeta } from '../../../types';
import { BOOKING_STATUSES } from '../../../config';

type TabKey = 'upcoming' | 'confirmed' | 'past' | 'cancelled' | 'all';

const statusBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case BOOKING_STATUSES.CONFIRMED:
    case BOOKING_STATUSES.ACCEPTED: return 'success';
    case BOOKING_STATUSES.PENDING:
    case BOOKING_STATUSES.INQUIRY: return 'warning';
    case BOOKING_STATUSES.CANCELLED:
    case BOOKING_STATUSES.REJECTED: return 'error';
    case BOOKING_STATUSES.COMPLETED: return 'info';
    default: return 'default';
  }
};

const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page, limit: 10 };
        if (activeTab === 'upcoming') params.status = 'pending,accepted,inquiry';
        if (activeTab === 'confirmed') params.status = 'confirmed';
        if (activeTab === 'past') params.status = 'completed';
        if (activeTab === 'cancelled') params.status = 'cancelled,rejected';

        const res = await bookingApi.getMyBookings(params);
        const data = res.data.data.bookings;
        setBookings(data);
        dispatch(setBookingsStore(data));
        if (res.data.meta) setMeta(res.data.meta);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [activeTab, page, dispatch]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
    setPage(1);
  };

  const renderBookingCard = (booking: Booking) => {
    const image = booking.listing.images?.[0]?.url;
    const eventDate = new Date(booking.eventDate).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return (
      <button
        key={booking._id}
        onClick={() => navigate(`/my-bookings/${booking._id}`)}
        className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-neutral-100 hover:shadow-md hover:border-neutral-200 transition-all w-full text-left cursor-pointer bg-white"
      >
        {/* Image */}
        <div className="w-full sm:w-40 h-32 sm:h-28 rounded-xl overflow-hidden shrink-0">
          <img
            src={image || 'https://placehold.co/160x112?text=No+Image'}
            alt={booking.listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-neutral-700 line-clamp-1">
                {booking.listing.title}
              </h3>
              <Badge variant={statusBadgeVariant(booking.status)} size="sm">
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-neutral-400 mt-1">
              {booking.vendor.businessName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <HiCalendarDays className="h-4 w-4" />
              {eventDate}
            </span>
            <span className="flex items-center gap-1">
              <HiMapPin className="h-4 w-4" />
              {booking.listing.address.city}
            </span>
            <span className="font-semibold text-neutral-700">
              PKR {booking.pricingSnapshot.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </button>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex gap-4 p-4">
              <Skeleton variant="rect" width={160} height={112} className="rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="80%" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (bookings.length === 0) {
      const emptyMessages: Record<TabKey, { title: string; description: string }> = {
        upcoming: { title: 'No upcoming bookings', description: 'When you book an event service, it will appear here.' },
        confirmed: { title: 'No confirmed bookings', description: 'Bookings confirmed by vendors will appear here.' },
        past: { title: 'No past bookings', description: 'Your completed bookings will show up here.' },
        cancelled: { title: 'No cancelled bookings', description: 'Cancelled bookings will appear here.' },
        all: { title: 'No bookings yet', description: 'Start exploring and book your first event service!' },
      };

      return (
        <EmptyState
          icon={<HiOutlineTicket className="h-16 w-16 mx-auto" />}
          title={emptyMessages[activeTab].title}
          description={emptyMessages[activeTab].description}
          actionLabel="Explore Services"
          onAction={() => navigate('/search')}
        />
      );
    }

    return (
      <div className="space-y-4">
        {bookings.map(renderBookingCard)}
        {meta && meta.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', content: renderTabContent() },
    { key: 'confirmed', label: 'Confirmed', content: renderTabContent() },
    { key: 'past', label: 'Past', content: renderTabContent() },
    { key: 'cancelled', label: 'Cancelled', content: renderTabContent() },
    { key: 'all', label: 'All', content: renderTabContent() },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700 mb-6">My Bookings</h1>
        <Tabs tabs={tabs} activeKey={activeTab} onChange={handleTabChange} />
      </div>
    </div>
  );
};

export default MyBookingsPage;