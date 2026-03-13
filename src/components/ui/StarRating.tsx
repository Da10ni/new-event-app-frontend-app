import React, { useState } from 'react';
import { HiStar } from 'react-icons/hi2';

interface StarRatingProps {
  rating?: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  showText = false,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  const handleClick = (starIndex: number, isHalf: boolean) => {
    if (!interactive || !onChange) return;
    const value = isHalf ? starIndex - 0.5 : starIndex;
    onChange(value);
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxStars }, (_, i) => {
          const starNumber = i + 1;
          const fillPercentage = Math.min(100, Math.max(0, (displayRating - i) * 100));

          return (
            <div
              key={i}
              className={`relative ${interactive ? 'cursor-pointer' : ''}`}
              onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            >
              {/* Half-star click zones */}
              {interactive && (
                <>
                  <div
                    className="absolute inset-y-0 left-0 w-1/2 z-10"
                    onMouseEnter={() => setHoverRating(starNumber - 0.5)}
                    onClick={() => handleClick(starNumber, true)}
                  />
                  <div
                    className="absolute inset-y-0 right-0 w-1/2 z-10"
                    onMouseEnter={() => setHoverRating(starNumber)}
                    onClick={() => handleClick(starNumber, false)}
                  />
                </>
              )}

              {/* Background star (empty) */}
              <HiStar className={`${sizeClasses[size]} text-neutral-200`} />

              {/* Filled star overlay */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <HiStar className={`${sizeClasses[size]} text-warning`} />
              </div>
            </div>
          );
        })}
      </div>
      {showText && (
        <span className="text-sm font-medium text-neutral-500 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
