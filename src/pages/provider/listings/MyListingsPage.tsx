import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiPlus,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiEye,
  HiArchiveBox,
  HiTrash,
  HiEllipsisVertical,
  HiStar,
  HiChartBar,
} from 'react-icons/hi2';
import { vendorApi } from '../../../services/api/vendorApi';
import { listingApi } from '../../../services/api/listingApi';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import Pagination from '../../../components/ui/Pagination';
import Dropdown from '../../../components/ui/Dropdown';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/feedback/EmptyState';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import toast from 'react-hot-toast';
import type { Listing } from '../../../types';

type TabKey = 'all' | 'active' | 'pending' | 'draft';

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'draft':
      return 'default';
    case 'archived':
      return 'error';
    default:
      return 'default';
  }
};

const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getMyListings({ limit: 200 });
      setListings(res.data?.data?.listings || []);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = useMemo(() => {
    let result = listings;

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter((l) => l.status === activeTab);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.category?.name?.toLowerCase().includes(q) ||
          l.address?.city?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [listings, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const tabCounts = useMemo(() => ({
    all: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    pending: listings.filter((l) => l.status === 'pending').length,
    draft: listings.filter((l) => l.status === 'draft').length,
  }), [listings]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: tabCounts.all },
    { key: 'active', label: 'Active', count: tabCounts.active },
    { key: 'pending', label: 'Pending', count: tabCounts.pending },
    { key: 'draft', label: 'Draft', count: tabCounts.draft },
  ];

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const handleArchive = async (id: string) => {
    try {
      await listingApi.update(id, { status: 'archived' });
      toast.success('Listing archived');
      fetchListings();
    } catch {
      toast.error('Failed to archive listing');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await listingApi.delete(deleteId);
      toast.success('Listing deleted');
      setDeleteId(null);
      fetchListings();
    } catch {
      toast.error('Failed to delete listing');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="200px" height="32px" />
          <Skeleton variant="rect" width="150px" height="40px" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
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
          <h1 className="text-2xl font-bold text-neutral-600">My Listings</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage your event services and offerings
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<HiPlus className="h-5 w-5" />}
          onClick={() => navigate('/provider/listings/add')}
        >
          Add New Listing
        </Button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex border-b border-neutral-100 overflow-x-auto w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
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
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search listings..."
            leftIcon={<HiMagnifyingGlass className="h-5 w-5" />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Listings Grid */}
      {paginatedListings.length === 0 ? (
        <EmptyState
          title={
            searchQuery
              ? 'No listings found'
              : activeTab === 'all'
              ? 'No listings yet'
              : `No ${activeTab} listings`
          }
          description={
            searchQuery
              ? 'Try a different search term'
              : 'Create your first listing to start attracting clients.'
          }
          actionLabel={!searchQuery ? 'Add New Listing' : undefined}
          onAction={!searchQuery ? () => navigate('/provider/listings/add') : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedListings.map((listing) => (
              <Card key={listing._id} padding="none" hoverable className="group">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={
                      listing.images?.find((img) => img.isPrimary)?.url ||
                      listing.images?.[0]?.url ||
                      'https://via.placeholder.com/400x250?text=No+Image'
                    }
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={statusBadgeVariant(listing.status)} size="sm">
                      {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Dropdown
                      trigger={
                        <div className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm">
                          <HiEllipsisVertical className="h-5 w-5 text-neutral-600" />
                        </div>
                      }
                      items={[
                        {
                          key: 'edit',
                          label: 'Edit',
                          icon: <HiPencilSquare />,
                          onClick: () => navigate(`/provider/listings/edit/${listing._id}`),
                        },
                        {
                          key: 'preview',
                          label: 'Preview',
                          icon: <HiEye />,
                          onClick: () => navigate(`/listings/${listing.slug}`),
                        },
                        { key: 'div1', type: 'divider' as const },
                        {
                          key: 'archive',
                          label: 'Archive',
                          icon: <HiArchiveBox />,
                          onClick: () => handleArchive(listing._id),
                        },
                        {
                          key: 'delete',
                          label: 'Delete',
                          icon: <HiTrash />,
                          danger: true,
                          onClick: () => setDeleteId(listing._id),
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3
                    className="text-base font-semibold text-neutral-600 truncate cursor-pointer hover:text-primary-500 transition-colors"
                    onClick={() => navigate(`/provider/listings/edit/${listing._id}`)}
                  >
                    {listing.title}
                  </h3>
                  <p className="text-sm text-neutral-400 mt-0.5">
                    {listing.category?.name || 'Uncategorized'} &middot; {listing.address?.city || 'N/A'}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <HiStar className="h-4 w-4 text-warning" />
                        <span className="text-sm font-medium text-neutral-500">
                          {listing.averageRating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-xs text-neutral-300">
                          ({listing.totalReviews || 0})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiChartBar className="h-4 w-4 text-neutral-300" />
                        <span className="text-xs text-neutral-400">
                          {listing.viewCount || 0} views
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary-500">
                      {formatCurrency(listing.pricing?.basePrice || 0)}
                      <span className="text-xs font-normal text-neutral-300 ml-0.5">
                        /{listing.pricing?.priceUnit || 'event'}
                      </span>
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteLoading}
      />
    </div>
  );
};

export default MyListingsPage;
