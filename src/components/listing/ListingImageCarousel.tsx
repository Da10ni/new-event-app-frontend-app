import React, { useState, useCallback } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { getOptimizedImageUrl } from '../../utils/cloudinaryImage';

interface CarouselImage {
  url: string;
  caption?: string;
}

interface ListingImageCarouselProps {
  images: CarouselImage[];
  aspectRatio?: string;
  showArrowsOnHover?: boolean;
  className?: string;
}

const ListingImageCarousel: React.FC<ListingImageCarouselProps> = ({
  images,
  aspectRatio = 'aspect-[4/3]',
  showArrowsOnHover = true,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goTo = useCallback(
    (index: number, e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      if (index < 0) {
        setCurrentIndex(images.length - 1);
      } else if (index >= images.length) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(index);
      }
    },
    [images.length]
  );

  if (!images || images.length === 0) {
    return (
      <div className={`${aspectRatio} bg-neutral-100 rounded-xl flex items-center justify-center ${className}`}>
        <span className="text-neutral-300 text-sm">No image</span>
      </div>
    );
  }

  const showArrows = showArrowsOnHover ? isHovered : true;

  return (
    <div
      className={`relative ${aspectRatio} overflow-hidden rounded-xl bg-neutral-100 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Images */}
      <div
        className="flex h-full transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={getOptimizedImageUrl(img.url)}
            alt={img.caption || `Image ${i + 1}`}
            className="h-full w-full shrink-0 object-cover"
            loading="lazy"
          />
        ))}
      </div>

      {/* Arrows */}
      {images.length > 1 && showArrows && (
        <>
          <button
            onClick={(e) => goTo(currentIndex - 1, e)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md
              hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <HiChevronLeft className="h-4 w-4 text-neutral-600" />
          </button>
          <button
            onClick={(e) => goTo(currentIndex + 1, e)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md
              hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <HiChevronRight className="h-4 w-4 text-neutral-600" />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => goTo(i, e)}
              className={`
                rounded-full transition-all duration-200
                ${i === currentIndex ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/80'}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingImageCarousel;
