import React from 'react';
import { Link } from 'react-router-dom';
import ListingImageCarousel from './ListingImageCarousel';
import WishlistHeart from './WishlistHeart';
import RatingDisplay from './RatingDisplay';
import PriceTag from './PriceTag';
import type { Listing } from '../../types';

interface ListingCardHorizontalProps {
  listing: Listing;
  initialFavorited?: boolean;
  className?: string;
}

const ListingCardHorizontal: React.FC<ListingCardHorizontalProps> = ({
  listing,
  initialFavorited = false,
  className = '',
}) => {
  const images = listing.images.map((img) => ({
    url: img.url,
    caption: img.caption,
  }));

  const location = [listing.address.city, listing.address.country]
    .filter(Boolean)
    .join(', ');

  return (
    <Link
      to={`/listing/${listing.slug}`}
      className={`group flex gap-4 sm:gap-6 w-full rounded-2xl overflow-hidden hover:shadow-card transition-shadow ${className}`}
    >
      {/* Image */}
      <div className="relative w-[200px] sm:w-[280px] shrink-0">
        <ListingImageCarousel images={images} aspectRatio="aspect-[4/3]" />
        <div className="absolute top-2 right-2 z-10">
          <WishlistHeart listingId={listing._id} initialFavorited={initialFavorited} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-3 pr-4 flex flex-col justify-between min-w-0">
        <div>
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
            {listing.category.name}
          </p>
          <h3 className="text-base font-semibold text-neutral-600 line-clamp-1 group-hover:text-primary-500 transition-colors">
            {listing.title}
          </h3>
          <p className="text-sm text-neutral-400 mt-1 line-clamp-1">{location}</p>
          <p className="text-sm text-neutral-400 mt-2 line-clamp-2 hidden sm:block">
            {listing.description}
          </p>
        </div>

        <div className="flex items-end justify-between mt-3">
          <RatingDisplay rating={listing.averageRating} reviewCount={listing.totalReviews} />
          <PriceTag
            price={listing.pricing.basePrice}
            currency={listing.pricing.currency}
            unit={listing.pricing.priceUnit}
          />
        </div>
      </div>
    </Link>
  );
};

export default ListingCardHorizontal;
