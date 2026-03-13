import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineShare, HiMapPin, HiStar, HiCheck, HiChevronDown, HiChevronUp,
  HiOutlineFlag, HiOutlineCalendarDays, HiOutlineUserGroup,
  HiOutlineChatBubbleLeftRight,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { listingApi } from '../../../services/api/listingApi';
import { useAppSelector } from '../../../store/hooks';
import WishlistHeart from '../../../components/listing/WishlistHeart';
import ListingCard from '../../../components/listing/ListingCard';
import RatingDisplay from '../../../components/listing/RatingDisplay';
import PriceTag from '../../../components/listing/PriceTag';
import Avatar from '../../../components/ui/Avatar';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import StarRating from '../../../components/ui/StarRating';
import Skeleton from '../../../components/ui/Skeleton';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import Select from '../../../components/ui/Select';
import type { Listing, Review } from '../../../types';

const ListingDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('');

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await listingApi.getBySlug(slug);
        const listingData = res.data.data.listing;
        setListing(listingData);

        if (listingData.pricing.packages?.length) {
          setSelectedPackage(listingData.pricing.packages[0].name);
        }

        // Fetch reviews
        try {
          const reviewRes = await listingApi.getReviews(listingData._id, { limit: 5 });
          setReviews(reviewRes.data.data?.reviews || []);
        } catch {
          // Reviews might not exist yet
        }

        // Fetch similar listings
        try {
          const similarRes = await listingApi.getAll({ category: listingData.category.slug, limit: 4 });
          setSimilarListings(
            similarRes.data.data.listings.filter((l: Listing) => l._id !== listingData._id).slice(0, 4)
          );
        } catch {
          // Ignore
        }
      } catch {
        toast.error('Failed to load listing');
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, navigate]);

  const selectedPkg = useMemo(() => {
    if (!listing?.pricing.packages?.length) return null;
    return listing.pricing.packages.find((p) => p.name === selectedPackage) || listing.pricing.packages[0];
  }, [listing, selectedPackage]);

  const displayPrice = selectedPkg?.price || listing?.pricing.basePrice || 0;

  const handleReserve = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to make a booking');
      navigate('/auth/login');
      return;
    }
    if (!listing) return;
    const params = new URLSearchParams();
    if (eventDate) params.set('date', eventDate);
    if (guestCount) params.set('guests', guestCount);
    if (selectedPackage) params.set('package', selectedPackage);
    navigate(`/booking/${listing._id}?${params.toString()}`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Unable to copy link');
    }
  };

  // Rating breakdown
  const ratingBreakdown = useMemo(() => {
    if (reviews.length === 0) return [];
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const idx = Math.min(Math.max(Math.round(r.rating) - 1, 0), 4);
      counts[idx]++;
    });
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star - 1],
      percentage: reviews.length > 0 ? (counts[star - 1] / reviews.length) * 100 : 0,
    }));
  }, [reviews]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton variant="text" width="40%" className="mb-6" />
        <div className="grid grid-cols-4 gap-2 mb-8">
          <Skeleton variant="rect" height={400} className="col-span-2 row-span-2 rounded-l-2xl" />
          <Skeleton variant="rect" height={196} />
          <Skeleton variant="rect" height={196} className="rounded-tr-2xl" />
          <Skeleton variant="rect" height={196} />
          <Skeleton variant="rect" height={196} className="rounded-br-2xl" />
        </div>
        <div className="flex gap-12">
          <div className="flex-1 space-y-6">
            <Skeleton variant="text" height={32} width="70%" />
            <Skeleton variant="text" count={3} />
          </div>
          <div className="w-96">
            <Skeleton variant="card" height={320} />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const images = listing.images;
  const location = [listing.address.area, listing.address.city, listing.address.country].filter(Boolean).join(', ');
  const visibleAmenities = showAllAmenities ? listing.amenities : listing.amenities.slice(0, 8);
  const descriptionShort = listing.description.length > 500;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: listing.category.name, href: `/search?category=${listing.category.slug}` },
            { label: listing.title },
          ]}
        />
      </div>

      {/* Title Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <RatingDisplay rating={listing.averageRating} reviewCount={listing.totalReviews} />
              <span className="text-neutral-300">|</span>
              <span className="flex items-center gap-1 text-neutral-500">
                <HiMapPin className="h-4 w-4" />
                {location}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
            >
              <HiOutlineShare className="h-4 w-4" />
              Share
            </button>
            <WishlistHeart listingId={listing._id} />
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden">
          {images.length >= 5 ? (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px]">
              <div className="col-span-2 row-span-2">
                <img
                  src={images[0].url}
                  alt={images[0].caption || listing.title}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => setShowAllPhotos(true)}
                />
              </div>
              {images.slice(1, 5).map((img, idx) => (
                <div key={img._id || idx}>
                  <img
                    src={img.url}
                    alt={img.caption || `${listing.title} ${idx + 2}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => setShowAllPhotos(true)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[420px]">
              <img
                src={images[0]?.url || 'https://placehold.co/1200x420?text=No+Image'}
                alt={listing.title}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          )}

          {images.length > 5 && (
            <button
              onClick={() => setShowAllPhotos(true)}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Show all {images.length} photos
            </button>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      <Modal isOpen={showAllPhotos} onClose={() => setShowAllPhotos(false)} title="All Photos" size="xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((img, idx) => (
            <img
              key={img._id || idx}
              src={img.url}
              alt={img.caption || `Photo ${idx + 1}`}
              className="w-full rounded-xl object-cover aspect-[4/3]"
            />
          ))}
        </div>
      </Modal>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            {/* Host Info */}
            <div className="flex items-center justify-between pb-8 border-b border-neutral-100">
              <div className="flex items-center gap-4">
                <Avatar name={listing.vendor.businessName} size="lg" />
                <div>
                  <h2 className="text-lg font-semibold text-neutral-700">
                    Hosted by {listing.vendor.businessName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingDisplay rating={listing.vendor.averageRating} />
                    <Badge variant="default">
                      {listing.category.name}
                    </Badge>
                  </div>
                </div>
              </div>
              <Link
                to={`/vendor/${listing.vendor.businessSlug}`}
                className="text-sm font-medium text-primary-500 hover:underline hidden sm:block"
              >
                View Profile
              </Link>
            </div>

            {/* Description */}
            <div className="py-8 border-b border-neutral-100">
              <h3 className="text-lg font-semibold text-neutral-700 mb-4">About this listing</h3>
              <p className="text-neutral-500 leading-relaxed whitespace-pre-line">
                {showFullDescription || !descriptionShort
                  ? listing.description
                  : `${listing.description.slice(0, 500)}...`}
              </p>
              {descriptionShort && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-3 text-sm font-semibold text-neutral-700 underline underline-offset-4 flex items-center gap-1 hover:text-primary-500 transition-colors"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                  {showFullDescription ? (
                    <HiChevronUp className="h-4 w-4" />
                  ) : (
                    <HiChevronDown className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div className="py-8 border-b border-neutral-100">
                <h3 className="text-lg font-semibold text-neutral-700 mb-4">What this place offers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visibleAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 py-2">
                      <HiCheck className="h-5 w-5 text-neutral-500 shrink-0" />
                      <span className="text-neutral-500">{amenity}</span>
                    </div>
                  ))}
                </div>
                {listing.amenities.length > 8 && (
                  <button
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-4 px-6 py-2.5 border border-neutral-600 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    {showAllAmenities
                      ? 'Show less'
                      : `Show all ${listing.amenities.length} amenities`}
                  </button>
                )}
              </div>
            )}

            {/* Capacity */}
            <div className="py-8 border-b border-neutral-100">
              <h3 className="text-lg font-semibold text-neutral-700 mb-4">Capacity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <HiOutlineUserGroup className="h-5 w-5" />
                  <span>{listing.capacity.min} - {listing.capacity.max} guests</span>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="py-8 border-b border-neutral-100" id="reviews">
              <div className="flex items-center gap-3 mb-6">
                <HiStar className="h-6 w-6 text-neutral-700" />
                <h3 className="text-lg font-semibold text-neutral-700">
                  {listing.averageRating.toFixed(1)} · {listing.totalReviews} review{listing.totalReviews !== 1 ? 's' : ''}
                </h3>
              </div>

              {/* Rating Breakdown */}
              {ratingBreakdown.length > 0 && reviews.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-2 mb-8">
                  {ratingBreakdown.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm text-neutral-500 w-3">{star}</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-600 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-neutral-400 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Review List */}
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {(showAllReviews ? reviews : reviews.slice(0, 4)).map((review) => (
                    <div key={review._id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={review.client.avatar?.url}
                          name={`${review.client.firstName} ${review.client.lastName}`}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-semibold text-neutral-700">
                            {review.client.firstName} {review.client.lastName}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                      <p className="text-neutral-500 text-sm leading-relaxed line-clamp-3">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400 text-sm">No reviews yet. Be the first to leave a review!</p>
              )}

              {reviews.length > 4 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mt-6 px-6 py-2.5 border border-neutral-600 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  {showAllReviews ? 'Show less' : `Show all ${listing.totalReviews} reviews`}
                </button>
              )}
            </div>

            {/* Location */}
            <div className="py-8">
              <h3 className="text-lg font-semibold text-neutral-700 mb-4">Location</h3>
              <div className="flex items-start gap-3">
                <HiMapPin className="h-5 w-5 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-neutral-600 font-medium">{listing.address.city}, {listing.address.country}</p>
                  {listing.address.area && (
                    <p className="text-sm text-neutral-400 mt-1">{listing.address.area}</p>
                  )}
                  {listing.address.street && (
                    <p className="text-sm text-neutral-400">{listing.address.street}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 bg-neutral-100 rounded-2xl h-48 flex items-center justify-center text-neutral-400 text-sm">
                Map view
              </div>
            </div>
          </div>

          {/* Right Sidebar - Booking Widget */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-lg p-6 space-y-5">
                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <PriceTag
                    price={displayPrice}
                    currency={listing.pricing.currency}
                    unit={listing.pricing.priceUnit}
                  />
                  {listing.pricing.maxPrice && listing.pricing.maxPrice > listing.pricing.basePrice && (
                    <span className="text-sm text-neutral-400 ml-1">
                      - PKR {listing.pricing.maxPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Date picker */}
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1.5">Event Date</label>
                  <div className="relative">
                    <HiOutlineCalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-xl text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Guest count */}
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1.5">Number of Guests</label>
                  <div className="relative">
                    <HiOutlineUserGroup className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      placeholder={`${listing.capacity.min} - ${listing.capacity.max}`}
                      min={listing.capacity.min}
                      max={listing.capacity.max}
                      className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-xl text-neutral-600 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Package selector */}
                {listing.pricing.packages && listing.pricing.packages.length > 0 && (
                  <Select
                    label="Package"
                    options={listing.pricing.packages.map((p) => ({
                      value: p.name,
                      label: `${p.name} - PKR ${p.price.toLocaleString()}`,
                    }))}
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                  />
                )}

                {/* Price breakdown */}
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Base price</span>
                    <span className="text-neutral-600">
                      PKR {displayPrice.toLocaleString()}
                    </span>
                  </div>
                  {selectedPkg && selectedPkg.includes.length > 0 && (
                    <div className="text-xs text-neutral-400">
                      Includes: {selectedPkg.includes.join(', ')}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm font-semibold pt-3 border-t border-neutral-100">
                    <span className="text-neutral-700">Total</span>
                    <span className="text-neutral-700">
                      PKR {displayPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button variant="primary" fullWidth size="lg" onClick={handleReserve}>
                  Reserve
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<HiOutlineChatBubbleLeftRight className="h-5 w-5" />}
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please log in to send a message');
                      navigate('/auth/login');
                      return;
                    }
                    navigate('/inbox');
                  }}
                >
                  Send Inquiry
                </Button>

                <button className="w-full text-center text-sm text-neutral-400 hover:text-neutral-600 flex items-center justify-center gap-1 transition-colors">
                  <HiOutlineFlag className="h-4 w-4" />
                  Report this listing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 flex items-center justify-between lg:hidden z-40">
          <div>
            <PriceTag
              price={displayPrice}
              currency={listing.pricing.currency}
              unit={listing.pricing.priceUnit}
            />
          </div>
          <Button variant="primary" onClick={handleReserve}>
            Reserve
          </Button>
        </div>
      </div>

      {/* Similar Listings */}
      {similarListings.length > 0 && (
        <section className="bg-neutral-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-neutral-700 mb-6">Similar Listings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarListings.map((l) => (
                <ListingCard key={l._id} listing={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom padding for mobile sticky bar */}
      <div className="h-20 lg:h-0" />
    </div>
  );
};

export default ListingDetailPage;
