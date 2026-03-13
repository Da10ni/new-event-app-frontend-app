import React from 'react';
import { HiStar } from 'react-icons/hi2';

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  className = '',
}) => {
  if (rating === 0 && (!reviewCount || reviewCount === 0)) {
    return (
      <span className={`inline-flex items-center gap-1 text-sm text-neutral-400 ${className}`}>
        <HiStar className="h-4 w-4" />
        <span>New</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-sm ${className}`}>
      <HiStar className="h-4 w-4 text-neutral-600" />
      <span className="font-medium text-neutral-600">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-neutral-400">({reviewCount})</span>
      )}
    </span>
  );
};

export default RatingDisplay;
