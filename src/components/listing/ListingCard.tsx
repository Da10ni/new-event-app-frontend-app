import React from 'react';
import { Link } from 'react-router-dom';
import ListingImageCarousel from './ListingImageCarousel';
import WishlistHeart from './WishlistHeart';
import RatingDisplay from './RatingDisplay';
import PriceTag from './PriceTag';
import type { Listing } from '../../types';

interface ListingCardProps {
  listing: Listing;
  initialFavorited?: boolean;
  className?: string;
}

const ListingCard: React.FC<ListingCardProps> = ({
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
      className={`group flex flex-col h-full w-full ${className}`}
    >
      {/* Image */}
      <div className="relative">
        <ListingImageCarousel images={images} />
        <div className="absolute top-2 right-2 z-10">
          <WishlistHeart listingId={listing._id} initialFavorited={initialFavorited} />
        </div>
        {listing.isFeatured && (
          <span className="absolute top-2 left-2 z-10 bg-white px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-600 shadow-sm">
            Featured
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 flex flex-col flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-neutral-600 line-clamp-1 group-hover:text-primary-500 transition-colors">
            {listing.title}
          </h3>
          <RatingDisplay
            rating={listing.averageRating}
            reviewCount={listing.totalReviews}
            className="shrink-0"
          />
        </div>
        <p className="text-sm text-neutral-400 line-clamp-1">{location}</p>
        <p className="text-sm text-neutral-400">{listing.category.name}</p>
        <PriceTag
          price={listing.pricing.basePrice}
          currency={listing.pricing.currency}
          unit={listing.pricing.priceUnit}
          className="mt-auto pt-1"
        />
      </div>
    </Link>
  );
};

export default ListingCard;
