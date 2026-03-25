import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiCalendarDays,
  HiChatBubbleLeftRight,
  HiQueueList,
  HiBanknotes,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiPlus,
  HiEye,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiArrowRight,
  HiExclamationTriangle,
} from 'react-icons/hi2';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setVendor } from '../../../store/slices/authSlice';
import { vendorApi } from '../../../services/api/vendorApi';
import { bookingApi } from '../../../services/api/bookingApi';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';
import Table from '../../../components/ui/Table';
import type { TableColumn } from '../../../components/ui/Table';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalBookings: number;
  pendingInquiries: number;
  activeListings: number;
  totalEarnings: number;
  bookingsChange: number;
  inquiriesChange: number;
  listingsChange: number;
  earningsChange: number;
}

interface RevenueDataPoint {
  month: string;
  amount: number;
}

interface BookingStatusBreakdown {
  status: string;
  count: number;
  color: string;
}

interface RecentBooking {
  _id: string;
  bookingNumber: string;
  clientName: string;
  listingTitle: string;
  eventDate: string;
  status: string;
  amount: number;
  [key: string]: unknown;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'inquiry':
      return 'info';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, vendor } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingInquiries: 0,
    activeListings: 0,
    totalEarnings: 0,
    bookingsChange: 0,
    inquiriesChange: 0,
    listingsChange: 0,
    earningsChange: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<BookingStatusBreakdown[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [pendingActions, setPendingActions] = useState<RecentBooking[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, listingsRes, vendorRes] = await Promise.all([
        vendorApi.getMyBookings({ limit: 50 }),
        vendorApi.getMyListings({ limit: 100 }),
        vendorApi.getMyProfile(),
      ]);

      // Refresh vendor status from backend
      const vendorData = vendorRes.data?.data?.vendor;
      if (vendorData) {
        dispatch(setVendor(vendorData));
        localStorage.setItem('auth_vendor', JSON.stringify(vendorData));
      }

      const bookings = bookingsRes.data?.data?.bookings || [];
      const listings = listingsRes.data?.data?.listings || [];

      const activeListings = listings.filter((l: Record<string, unknown>) => l.status === 'active').length;
      const totalEarnings = bookings
        .filter((b: Record<string, unknown>) => b.status === 'completed' || b.status === 'confirmed')
        .reduce((sum: number, b: Record<string, unknown>) => {
          const snapshot = b.pricingSnapshot as { totalAmount?: number } | undefined;
          return sum + (snapshot?.totalAmount || 0);
        }, 0);
      const pendingInquiries = bookings.filter(
        (b: Record<string, unknown>) => b.status === 'inquiry' || b.status === 'pending'
      ).length;

      setStats({
        totalBookings: bookings.length,
        pendingInquiries,
        activeListings,
        totalEarnings,
        bookingsChange: 12.5,
        inquiriesChange: -3.2,
        listingsChange: 8.0,
        earningsChange: 15.3,
      });

      // Revenue data from bookings
      const monthlyRevenue: Record<string, number> = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach((m) => (monthlyRevenue[m] = 0));

      bookings
        .filter((b: Record<string, unknown>) => b.status === 'completed' || b.status === 'confirmed')
        .forEach((b: Record<string, unknown>) => {
          const date = new Date(b.eventDate as string);
          const monthName = months[date.getMonth()];
          const snapshot = b.pricingSnapshot as { totalAmount?: number } | undefined;
          monthlyRevenue[monthName] += snapshot?.totalAmount || 0;
        });

      setRevenueData(months.map((m) => ({ month: m, amount: monthlyRevenue[m] })));

      // Status breakdown
      const statusCounts: Record<string, number> = {};
      bookings.forEach((b: Record<string, unknown>) => {
        const s = b.status as string;
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });

      const colorMap: Record<string, string> = {
        inquiry: '#3B82F6',
        pending: '#F59E0B',
        confirmed: '#10B981',
        completed: '#0D7C5F',
        cancelled: '#EF4444',
        rejected: '#DC2626',
      };

      setStatusBreakdown(
        Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count,
          color: colorMap[status] || '#9CA3AF',
        }))
      );

      // Recent bookings
      const sorted = [...bookings]
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
          new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
        )
        .slice(0, 5);

      setRecentBookings(
        sorted.map((b: Record<string, unknown>) => {
          const client = b.client as { firstName?: string; lastName?: string };
          const listing = b.listing as { title?: string };
          const snapshot = b.pricingSnapshot as { totalAmount?: number };
          return {
            _id: b._id as string,
            bookingNumber: b.bookingNumber as string,
            clientName: `${client?.firstName || ''} ${client?.lastName || ''}`.trim(),
            listingTitle: listing?.title || 'N/A',
            eventDate: b.eventDate as string,
            status: b.status as string,
            amount: snapshot?.totalAmount || 0,
          };
        })
      );

      // Pending actions (inquiries and pending)
      const pending = bookings
        .filter((b: Record<string, unknown>) => b.status === 'inquiry' || b.status === 'pending')
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
          new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
        )
        .slice(0, 5);

      setPendingActions(
        pending.map((b: Record<string, unknown>) => {
          const client = b.client as { firstName?: string; lastName?: string };
          const listing = b.listing as { title?: string };
          const snapshot = b.pricingSnapshot as { totalAmount?: number };
          return {
            _id: b._id as string,
            bookingNumber: b.bookingNumber as string,
            clientName: `${client?.firstName || ''} ${client?.lastName || ''}`.trim(),
            listingTitle: listing?.title || 'N/A',
            eventDate: b.eventDate as string,
            status: b.status as string,
            amount: snapshot?.totalAmount || 0,
          };
        })
      );
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (bookingId: string, action: 'accepted' | 'rejected') => {
    try {
      await bookingApi.updateStatus(bookingId, { status: action });
      toast.success(`Booking ${action} successfully`);
      fetchDashboardData();
    } catch {
      toast.error(`Failed to ${action === 'accepted' ? 'accept' : 'reject'} booking`);
    }
  };

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      change: stats.bookingsChange,
      icon: <HiCalendarDays className="h-6 w-6" />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Pending Inquiries',
      value: stats.pendingInquiries,
      change: stats.inquiriesChange,
      icon: <HiChatBubbleLeftRight className="h-6 w-6" />,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Active Listings',
      value: stats.activeListings,
      change: stats.listingsChange,
      icon: <HiQueueList className="h-6 w-6" />,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Earnings',
      value: formatCurrency(stats.totalEarnings),
      change: stats.earningsChange,
      icon: <HiBanknotes className="h-6 w-6" />,
      color: 'bg-primary-50 text-primary-600',
    },
  ];

  const bookingsColumns: TableColumn<RecentBooking>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking #',
      render: (row) => (
        <Link
          to={`/provider/bookings/${row._id}`}
          className="text-primary-500 font-medium hover:underline"
        >
          {row.bookingNumber}
        </Link>
      ),
    },
    { key: 'clientName', header: 'Client' },
    { key: 'listingTitle', header: 'Listing' },
    {
      key: 'eventDate',
      header: 'Event Date',
      render: (row) => <span>{formatDate(row.eventDate)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={statusBadgeVariant(row.status)} dot>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span>,
    },
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.amount), 1);
  const totalStatusCount = statusBreakdown.reduce((sum, s) => sum + s.count, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" height={80} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={120} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="rect" height={300} />
          <Skeleton variant="rect" height={300} />
        </div>
        <Skeleton variant="rect" height={250} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Approval Banner */}
      {vendor?.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <HiExclamationTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-amber-800">Account Pending Approval</h3>
            <p className="text-sm text-amber-600 mt-1">
              Your vendor account is under review. Once approved by an admin, you will be able to create listings and receive bookings. This usually takes 1-2 business days.
            </p>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Welcome back, {vendor?.businessName || user?.firstName || 'Provider'}!
            </h1>
            <p className="mt-1 text-white/80 text-sm lg:text-base">
              Here is what is happening with your business today.
            </p>
          </div>
          <div className="flex gap-3">
            {vendor?.status === 'approved' && (
              <Button
                variant="outline"
                size="sm"
                className="!border-white/30 !text-white hover:!bg-white/10"
                leftIcon={<HiPlus className="h-4 w-4" />}
                onClick={() => navigate('/provider/listings/add')}
              >
                Add Listing
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="!border-white/30 !text-white hover:!bg-white/10"
              leftIcon={<HiEye className="h-4 w-4" />}
              onClick={() => navigate('/provider/bookings')}
            >
              View Bookings
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} padding="md" hoverable>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-neutral-600">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>{card.icon}</div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              {card.change >= 0 ? (
                <HiArrowTrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <HiArrowTrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${card.change >= 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {Math.abs(card.change)}%
              </span>
              <span className="text-sm text-neutral-300 ml-1">vs last month</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card padding="md">
          <h3 className="text-lg font-semibold text-neutral-600 mb-4">Revenue Overview</h3>
          <div className="flex items-end gap-2 h-48">
            {revenueData.map((d) => {
              const heightPx = maxRevenue > 0 ? (d.amount / maxRevenue) * 160 : 0;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-[10px] text-neutral-400 font-medium mb-1">
                    {d.amount > 0 ? `$${(d.amount / 1000).toFixed(0)}k` : ''}
                  </span>
                  <div
                    className="w-full max-w-[32px] bg-primary-500 rounded-t-md transition-all duration-500 hover:bg-primary-600"
                    style={{ height: `${Math.max(heightPx, 2)}px` }}
                    title={`${d.month}: ${formatCurrency(d.amount)}`}
                  />
                  <span className="text-[10px] text-neutral-400 mt-1">{d.month}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Bookings Status Breakdown */}
        <Card padding="md">
          <h3 className="text-lg font-semibold text-neutral-600 mb-4">Bookings by Status</h3>
          {statusBreakdown.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-neutral-300 text-sm">
              No booking data available
            </div>
          ) : (
            <div className="space-y-4">
              {statusBreakdown.map((item) => {
                const percentage = totalStatusCount > 0 ? (item.count / totalStatusCount) * 100 : 0;
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-neutral-500 capitalize">
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-600">{item.count}</span>
                        <span className="text-xs text-neutral-300">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-600">Recent Bookings</h3>
          <Link
            to="/provider/bookings"
            className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
          >
            View All <HiArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Table
          columns={bookingsColumns}
          data={recentBookings}
          loading={false}
          emptyMessage="No bookings yet"
        />
      </Card>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-600">Pending Actions</h3>
            <Badge variant="warning" size="md">
              {pendingActions.length} Needs Response
            </Badge>
          </div>
          <div className="space-y-3">
            {pendingActions.map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <HiClock className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-sm font-semibold text-neutral-600 truncate">
                      {booking.clientName}
                    </span>
                    <Badge variant={statusBadgeVariant(booking.status)} size="sm">
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-400 truncate">
                    {booking.listingTitle} &middot; {formatDate(booking.eventDate)} &middot;{' '}
                    {formatCurrency(booking.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<HiCheckCircle className="h-4 w-4" />}
                    onClick={() => handleQuickAction(booking._id, 'accepted')}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<HiXCircle className="h-4 w-4" />}
                    onClick={() => handleQuickAction(booking._id, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/provider/bookings/${booking._id}`)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          as="link"
          to="/provider/listings/add"
          variant="primary"
          leftIcon={<HiPlus className="h-5 w-5" />}
        >
          Add New Listing
        </Button>
        <Button
          as="link"
          to="/provider/bookings"
          variant="outline"
          leftIcon={<HiCalendarDays className="h-5 w-5" />}
        >
          View All Bookings
        </Button>
        <Button
          as="link"
          to="/provider/earnings"
          variant="outline"
          leftIcon={<HiBanknotes className="h-5 w-5" />}
        >
          View Earnings
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
