import React, { useState, useEffect, useMemo } from 'react';
import {
  HiBanknotes,
  HiClock,
  HiCheckCircle,
  HiArrowTrendingUp,
  HiCalendarDays,
} from 'react-icons/hi2';
import { vendorApi } from '../../../services/api/vendorApi';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import Table from '../../../components/ui/Table';
import type { TableColumn } from '../../../components/ui/Table';
import Pagination from '../../../components/ui/Pagination';
import toast from 'react-hot-toast';
import type { Booking } from '../../../types';

type PeriodKey = 'week' | 'month' | 'year' | 'all';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'confirmed': return 'info';
    case 'pending': return 'warning';
    default: return 'default';
  }
};

interface TransactionRow {
  _id: string;
  date: string;
  bookingNumber: string;
  clientName: string;
  listingTitle: string;
  amount: number;
  status: string;
  [key: string]: unknown;
}

interface ListingEarning {
  listingId: string;
  listingTitle: string;
  bookingsCount: number;
  totalEarned: number;
  [key: string]: unknown;
}

const EarningsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodKey>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getMyBookings({ limit: 500 });
      setBookings(res.data?.data?.bookings || []);
    } catch {
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const getDateThreshold = (p: PeriodKey): Date | null => {
    const now = new Date();
    switch (p) {
      case 'week': {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return d;
      }
      case 'month': {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 1);
        return d;
      }
      case 'year': {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - 1);
        return d;
      }
      case 'all':
        return null;
    }
  };

  const filteredBookings = useMemo(() => {
    const threshold = getDateThreshold(period);
    return bookings.filter((b) => {
      const isEarning = b.status === 'completed' || b.status === 'confirmed';
      if (!isEarning) return false;
      if (!threshold) return true;
      return new Date(b.eventDate) >= threshold;
    });
  }, [bookings, period]);

  const totalEarnings = useMemo(() => {
    return filteredBookings.reduce((sum, b) => sum + (b.pricingSnapshot?.totalAmount || 0), 0);
  }, [filteredBookings]);

  const pendingPayouts = useMemo(() => {
    return filteredBookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.pricingSnapshot?.totalAmount || 0), 0);
  }, [filteredBookings]);

  const completedBookings = useMemo(() => {
    return filteredBookings.filter((b) => b.status === 'completed').length;
  }, [filteredBookings]);

  // Earnings by listing
  const listingEarnings = useMemo((): ListingEarning[] => {
    const map = new Map<string, { title: string; count: number; total: number }>();
    filteredBookings.forEach((b) => {
      const lid = b.listing?._id || 'unknown';
      const existing = map.get(lid) || { title: b.listing?.title || 'Unknown', count: 0, total: 0 };
      existing.count += 1;
      existing.total += b.pricingSnapshot?.totalAmount || 0;
      map.set(lid, existing);
    });
    return Array.from(map.entries())
      .map(([id, data]) => ({
        listingId: id,
        listingTitle: data.title,
        bookingsCount: data.count,
        totalEarned: data.total,
      }))
      .sort((a, b) => b.totalEarned - a.totalEarned);
  }, [filteredBookings]);

  // Monthly earnings for chart
  const monthlyEarnings = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: Record<string, number> = {};
    months.forEach((m) => (data[m] = 0));

    filteredBookings.forEach((b) => {
      const date = new Date(b.eventDate);
      const monthName = months[date.getMonth()];
      data[monthName] += b.pricingSnapshot?.totalAmount || 0;
    });

    return months.map((m) => ({ month: m, amount: data[m] }));
  }, [filteredBookings]);

  const maxMonthly = Math.max(...monthlyEarnings.map((d) => d.amount), 1);

  // Transactions
  const transactions = useMemo((): TransactionRow[] => {
    return filteredBookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((b) => ({
        _id: b._id,
        date: b.eventDate,
        bookingNumber: b.bookingNumber,
        clientName: `${b.client?.firstName || ''} ${b.client?.lastName || ''}`.trim(),
        listingTitle: b.listing?.title || 'N/A',
        amount: b.pricingSnapshot?.totalAmount || 0,
        status: b.status,
      }));
  }, [filteredBookings]);

  const totalTransPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const transColumns: TableColumn<TransactionRow>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="text-neutral-500">{formatDate(row.date)}</span>,
    },
    {
      key: 'bookingNumber',
      header: 'Booking #',
      render: (row) => <span className="font-medium text-primary-500">{row.bookingNumber}</span>,
    },
    { key: 'clientName', header: 'Client' },
    {
      key: 'listingTitle',
      header: 'Listing',
      render: (row) => <span className="truncate max-w-[200px] block">{row.listingTitle}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => <span className="font-semibold text-neutral-600">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={statusBadgeVariant(row.status)} dot size="sm">
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
  ];

  const listingColumns: TableColumn<ListingEarning>[] = [
    {
      key: 'listingTitle',
      header: 'Listing',
      render: (row) => <span className="font-medium text-neutral-600">{row.listingTitle}</span>,
    },
    {
      key: 'bookingsCount',
      header: 'Bookings',
      align: 'center',
      render: (row) => <span>{row.bookingsCount}</span>,
    },
    {
      key: 'totalEarned',
      header: 'Total Earned',
      align: 'right',
      render: (row) => <span className="font-semibold text-neutral-600">{formatCurrency(row.totalEarned)}</span>,
    },
  ];

  const periods: { key: PeriodKey; label: string }[] = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
    { key: 'all', label: 'All Time' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="200px" height="32px" />
        <Skeleton variant="rect" height={120} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={100} />
          ))}
        </div>
        <Skeleton variant="rect" height={300} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-600">Earnings</h1>
          <p className="text-sm text-neutral-400 mt-1">Track your revenue and payouts</p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-white rounded-xl border border-neutral-200 p-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => {
                setPeriod(p.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                period === p.key
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total Earnings Hero */}
      <Card padding="lg" className="bg-gradient-to-br from-primary-500 to-primary-600 !border-0">
        <div className="text-center">
          <p className="text-white/70 text-sm mb-2">Total Earnings</p>
          <p className="text-4xl lg:text-5xl font-bold text-white">{formatCurrency(totalEarnings)}</p>
          <p className="text-white/70 text-sm mt-2">
            {period === 'all' ? 'All Time' : `Last ${period === 'week' ? '7 Days' : period === 'month' ? '30 Days' : '12 Months'}`}
          </p>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" hoverable>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">Total Earned</p>
              <p className="text-xl font-bold text-neutral-600">{formatCurrency(totalEarnings)}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 text-green-600">
              <HiBanknotes className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card padding="md" hoverable>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">Pending Payouts</p>
              <p className="text-xl font-bold text-neutral-600">{formatCurrency(pendingPayouts)}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <HiClock className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card padding="md" hoverable>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">Completed Bookings</p>
              <p className="text-xl font-bold text-neutral-600">{completedBookings}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <HiCheckCircle className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Earnings Chart */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-neutral-600 mb-4 flex items-center gap-2">
          <HiArrowTrendingUp className="h-5 w-5 text-primary-500" />
          Monthly Earnings Trend
        </h3>
        <div className="flex items-end gap-2 h-48">
          {monthlyEarnings.map((d) => {
            const height = maxMonthly > 0 ? (d.amount / maxMonthly) * 100 : 0;
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-neutral-400 font-medium">
                  {d.amount > 0 ? `$${(d.amount / 1000).toFixed(0)}k` : ''}
                </span>
                <div className="w-full flex justify-center">
                  <div
                    className="w-full max-w-[36px] bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-md transition-all duration-500 hover:from-primary-600 hover:to-primary-500 min-h-[2px]"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${d.month}: ${formatCurrency(d.amount)}`}
                  />
                </div>
                <span className="text-[10px] text-neutral-400">{d.month}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Earnings Breakdown by Listing */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-600">Earnings by Listing</h3>
        </div>
        <Table
          columns={listingColumns}
          data={listingEarnings}
          emptyMessage="No earnings data for this period"
        />
      </Card>

      {/* Transaction History */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-600 flex items-center gap-2">
            <HiCalendarDays className="h-5 w-5 text-primary-500" />
            Transaction History
          </h3>
        </div>
        <Table
          columns={transColumns}
          data={paginatedTransactions}
          emptyMessage="No transactions for this period"
        />
      </Card>

      {totalTransPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalTransPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default EarningsPage;
