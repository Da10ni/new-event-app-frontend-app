import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiCalendarDays,
  HiMagnifyingGlass,
  HiCheckCircle,
  HiXCircle,
  HiEye,
  HiFunnel,
  HiXMark,
} from 'react-icons/hi2';
import { vendorApi } from '../../../services/api/vendorApi';
import { bookingApi } from '../../../services/api/bookingApi';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Card from '../../../components/ui/Card';
import Avatar from '../../../components/ui/Avatar';
import Pagination from '../../../components/ui/Pagination';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/feedback/EmptyState';
import toast from 'react-hot-toast';
import type { Booking } from '../../../types';

type TabKey = 'all' | 'inquiry' | 'upcoming' | 'completed';

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

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const ProviderBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getMyBookings({ limit: 200 });
      setBookings(res.data?.data?.bookings || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    // Tab filter
    switch (activeTab) {
      case 'inquiry':
        result = result.filter((b) => b.status === 'inquiry' || b.status === 'pending');
        break;
      case 'upcoming':
        result = result.filter(
          (b) =>
            (b.status === 'confirmed' || b.status === 'accepted') &&
            new Date(b.eventDate) >= new Date()
        );
        break;
      case 'completed':
        result = result.filter((b) => b.status === 'completed');
        break;
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.bookingNumber?.toLowerCase().includes(q) ||
          `${b.client?.firstName} ${b.client?.lastName}`.toLowerCase().includes(q) ||
          b.listing?.title?.toLowerCase().includes(q)
      );
    }

    // Sort by newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [bookings, activeTab, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const tabCounts = useMemo(() => ({
    all: bookings.length,
    inquiry: bookings.filter((b) => b.status === 'inquiry' || b.status === 'pending').length,
    upcoming: bookings.filter(
      (b) => (b.status === 'confirmed' || b.status === 'accepted') && new Date(b.eventDate) >= new Date()
    ).length,
    completed: bookings.filter((b) => b.status === 'completed').length,
  }), [bookings]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: tabCounts.all },
    { key: 'inquiry', label: 'New Inquiries', count: tabCounts.inquiry },
    { key: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming },
    { key: 'completed', label: 'Completed', count: tabCounts.completed },
  ];

  const handleAction = async (bookingId: string, action: string) => {
    setActionLoading(bookingId);
    try {
      await bookingApi.updateStatus(bookingId, { status: action });
      toast.success(`Booking ${action} successfully`);
      fetchBookings();
    } catch {
      toast.error(`Failed to update booking`);
    } finally {
      setActionLoading(null);
    }
  };

  const renderActionButtons = (booking: Booking) => {
    const isActioning = actionLoading === booking._id;

    switch (booking.status) {
      case 'inquiry':
      case 'pending':
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              leftIcon={<HiCheckCircle className="h-4 w-4" />}
              onClick={() => handleAction(booking._id, 'accepted')}
              loading={isActioning}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<HiXCircle className="h-4 w-4" />}
              onClick={() => handleAction(booking._id, 'rejected')}
              disabled={isActioning}
            >
              Reject
            </Button>
          </div>
        );
      case 'accepted':
        return (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<HiCheckCircle className="h-4 w-4" />}
            onClick={() => handleAction(booking._id, 'confirmed')}
            loading={isActioning}
          >
            Confirm
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="200px" height="32px" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={100} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-600">Bookings</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage your booking requests and reservations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
            }}
            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'text-primary-500'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-primary-50 text-primary-500'
                  : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              {tab.count}
            </span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1 w-full sm:max-w-xs">
          <Input
            placeholder="Search bookings..."
            leftIcon={<HiMagnifyingGlass className="h-5 w-5" />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<HiFunnel className="h-4 w-4" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
      </div>

      {showFilters && (
        <Card padding="md" className="flex flex-wrap items-end gap-4">
          <div className="w-48">
            <Select
              label="Status"
              placeholder="All statuses"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'inquiry', label: 'Inquiry' },
                { value: 'pending', label: 'Pending' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'rejected', label: 'Rejected' },
              ]}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {(statusFilter || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<HiXMark className="h-4 w-4" />}
              onClick={() => {
                setStatusFilter('');
                setSearchQuery('');
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      )}

      {/* Bookings List */}
      {paginatedBookings.length === 0 ? (
        <EmptyState
          title={
            searchQuery || statusFilter
              ? 'No bookings found'
              : activeTab === 'all'
              ? 'No bookings yet'
              : `No ${activeTab} bookings`
          }
          description={
            searchQuery || statusFilter
              ? 'Try adjusting your search or filters.'
              : 'Bookings from your listings will appear here.'
          }
        />
      ) : (
        <div className="space-y-4">
          {paginatedBookings.map((booking) => (
            <Card key={booking._id} padding="none" hoverable>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 sm:p-5">
                {/* Client Info */}
                <div className="flex items-center gap-3 min-w-0 lg:w-56 shrink-0">
                  <Avatar
                    src={booking.client?.avatar?.url}
                    name={`${booking.client?.firstName} ${booking.client?.lastName}`}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-600 truncate">
                      {booking.client?.firstName} {booking.client?.lastName}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">{booking.client?.email}</p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-neutral-300 mb-0.5">Listing</p>
                    <p className="text-sm text-neutral-500 font-medium truncate">
                      {booking.listing?.title || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-300 mb-0.5">Event Date</p>
                    <p className="text-sm text-neutral-500 font-medium">
                      {formatDate(booking.eventDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-300 mb-0.5">Amount</p>
                    <p className="text-sm text-neutral-600 font-semibold">
                      {formatCurrency(booking.pricingSnapshot?.totalAmount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-300 mb-0.5">Status</p>
                    <Badge variant={statusBadgeVariant(booking.status)} dot size="sm">
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {renderActionButtons(booking)}
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<HiEye className="h-4 w-4" />}
                    onClick={() => navigate(`/provider/bookings/${booking._id}`)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ProviderBookingsPage;
