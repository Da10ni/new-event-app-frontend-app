import React, { useState, useEffect, useMemo } from 'react';
import {
  HiStar,
  HiChatBubbleLeftEllipsis,
  HiPaperAirplane,
  HiChevronDown,
  HiChevronUp,
} from 'react-icons/hi2';
import { vendorApi } from '../../../services/api/vendorApi';
import { listingApi } from '../../../services/api/listingApi';
import Card from '../../../components/ui/Card';
import Avatar from '../../../components/ui/Avatar';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import TextArea from '../../../components/ui/TextArea';
import StarRating from '../../../components/ui/StarRating';
import Pagination from '../../../components/ui/Pagination';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/feedback/EmptyState';
import toast from 'react-hot-toast';
import type { Review, Listing } from '../../../types';
import { reviewApi } from '../../../services/api/reviewApi';

type FilterKey = 'all' | 'positive' | 'neutral' | 'negative';

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // First get all listings, then get reviews for each
      const listingsRes = await vendorApi.getMyListings({ limit: 100 });
      const listings: Listing[] = listingsRes.data?.data?.listings || [];

      const allReviews: Review[] = [];
      await Promise.all(
        listings.map(async (listing) => {
          try {
            const reviewsRes = await listingApi.getReviews(listing._id, { limit: 100 });
            const listingReviews = reviewsRes.data?.data?.reviews || [];
            allReviews.push(...listingReviews);
          } catch {
            // Silently skip listings with no reviews endpoint
          }
        })
      );

      // Sort by newest first
      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(allReviews);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Rating statistics
  const ratingStats = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
    }

    const distribution = [0, 0, 0, 0, 0]; // 1-star to 5-star
    let sum = 0;

    reviews.forEach((r) => {
      sum += r.rating;
      const idx = Math.min(Math.max(Math.floor(r.rating) - 1, 0), 4);
      distribution[idx]++;
    });

    return {
      average: sum / reviews.length,
      total: reviews.length,
      distribution,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    switch (filter) {
      case 'positive':
        return reviews.filter((r) => r.rating >= 4);
      case 'neutral':
        return reviews.filter((r) => r.rating === 3);
      case 'negative':
        return reviews.filter((r) => r.rating <= 2);
      default:
        return reviews;
    }
  }, [reviews, filter]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: reviews.length },
    { key: 'positive', label: 'Positive (4-5)', count: reviews.filter((r) => r.rating >= 4).length },
    { key: 'neutral', label: 'Neutral (3)', count: reviews.filter((r) => r.rating === 3).length },
    { key: 'negative', label: 'Negative (1-2)', count: reviews.filter((r) => r.rating <= 2).length },
  ];

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setReplyLoading(true);
    try {
      await reviewApi.addVendorReply(reviewId, replyText.trim());
      toast.success('Reply posted successfully');
      setReplyingTo(null);
      setReplyText('');
      fetchReviews();
    } catch {
      toast.error('Failed to post reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const toggleReplyExpanded = (reviewId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="200px" height="32px" />
        <Skeleton variant="rect" height={200} />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={140} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-600">Reviews</h1>
        <p className="text-sm text-neutral-400 mt-1">
          See what clients are saying about your services
        </p>
      </div>

      {/* Overall Rating Card */}
      <Card padding="lg">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Big Rating */}
          <div className="text-center shrink-0">
            <p className="text-5xl font-bold text-neutral-600 mb-2">
              {ratingStats.average.toFixed(1)}
            </p>
            <StarRating rating={ratingStats.average} size="lg" />
            <p className="text-sm text-neutral-400 mt-2">
              Based on {ratingStats.total} review{ratingStats.total !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 w-full space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingStats.distribution[star - 1];
              const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12 shrink-0 justify-end">
                    <span className="text-sm font-medium text-neutral-500">{star}</span>
                    <HiStar className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-400 w-10 shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex border-b border-neutral-100 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilter(tab.key);
              setCurrentPage(1);
            }}
            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filter === tab.key
                ? 'text-primary-500'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab.key
                  ? 'bg-primary-50 text-primary-500'
                  : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              {tab.count}
            </span>
            {filter === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {paginatedReviews.length === 0 ? (
        <EmptyState
          title={filter === 'all' ? 'No reviews yet' : `No ${filter} reviews`}
          description="Reviews from your clients will appear here."
        />
      ) : (
        <div className="space-y-4">
          {paginatedReviews.map((review) => (
            <Card key={review._id} padding="md">
              <div className="flex items-start gap-4">
                {/* Client Avatar */}
                <Avatar
                  src={review.client?.avatar?.url}
                  name={`${review.client?.firstName} ${review.client?.lastName}`}
                  size="md"
                  className="shrink-0"
                />

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-neutral-600">
                        {review.client?.firstName} {review.client?.lastName}
                      </p>
                      <p className="text-xs text-neutral-300">{formatDate(review.createdAt)}</p>
                    </div>
                    <StarRating rating={review.rating} size="sm" showText />
                  </div>

                  {review.title && (
                    <p className="text-sm font-semibold text-neutral-600 mb-1">{review.title}</p>
                  )}
                  <p className="text-sm text-neutral-500 whitespace-pre-wrap">{review.comment}</p>

                  {/* Detailed Ratings */}
                  {review.detailedRatings && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {review.detailedRatings.quality != null && (
                        <Badge variant="default" size="sm">
                          Quality: {review.detailedRatings.quality}/5
                        </Badge>
                      )}
                      {review.detailedRatings.communication != null && (
                        <Badge variant="default" size="sm">
                          Communication: {review.detailedRatings.communication}/5
                        </Badge>
                      )}
                      {review.detailedRatings.valueForMoney != null && (
                        <Badge variant="default" size="sm">
                          Value: {review.detailedRatings.valueForMoney}/5
                        </Badge>
                      )}
                      {review.detailedRatings.punctuality != null && (
                        <Badge variant="default" size="sm">
                          Punctuality: {review.detailedRatings.punctuality}/5
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Vendor Reply */}
                  {review.vendorReply && (
                    <div className="mt-3">
                      <button
                        onClick={() => toggleReplyExpanded(review._id)}
                        className="flex items-center gap-1 text-sm text-primary-500 font-medium hover:text-primary-600 transition-colors cursor-pointer"
                      >
                        <HiChatBubbleLeftEllipsis className="h-4 w-4" />
                        Your Reply
                        {expandedReplies.has(review._id) ? (
                          <HiChevronUp className="h-4 w-4" />
                        ) : (
                          <HiChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {expandedReplies.has(review._id) && (
                        <div className="mt-2 ml-5 pl-3 border-l-2 border-primary-200 bg-primary-50/50 rounded-r-lg p-3">
                          <p className="text-sm text-neutral-500 whitespace-pre-wrap">
                            {review.vendorReply.comment}
                          </p>
                          <p className="text-xs text-neutral-300 mt-1">
                            Replied {formatDate(review.vendorReply.repliedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reply Form */}
                  {!review.vendorReply && (
                    <div className="mt-3">
                      {replyingTo === review._id ? (
                        <div className="space-y-2">
                          <TextArea
                            placeholder="Write your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            maxCharacters={500}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<HiPaperAirplane className="h-4 w-4" />}
                              onClick={() => handleReply(review._id)}
                              loading={replyLoading}
                              disabled={!replyText.trim()}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReplyingTo(review._id);
                            setReplyText('');
                          }}
                          className="flex items-center gap-1 text-sm text-primary-500 font-medium hover:text-primary-600 transition-colors mt-1 cursor-pointer"
                        >
                          <HiChatBubbleLeftEllipsis className="h-4 w-4" />
                          Reply to this review
                        </button>
                      )}
                    </div>
                  )}
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

export default ReviewsPage;
