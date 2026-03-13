import React, { useRef, useState, useEffect } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import type { Category } from '../../types';

interface CategoryFilterBarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
  className?: string;
}

const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelect,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 0);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -300 : 300;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Left arrow */}
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
          <div className="bg-gradient-to-r from-white via-white to-transparent pr-4 h-full flex items-center">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-full border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <HiChevronLeft className="h-4 w-4 text-neutral-600" />
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div
        ref={scrollRef}
        className="flex items-center gap-8 overflow-x-auto scrollbar-hide py-3 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat._id;
          return (
            <button
              key={cat._id}
              onClick={() => onSelect(isActive ? null : cat._id)}
              className={`
                flex flex-col items-center gap-2 min-w-[56px] pb-2 border-b-2 transition-all
                ${
                  isActive
                    ? 'border-neutral-600 text-neutral-600'
                    : 'border-transparent text-neutral-400 hover:text-neutral-500 hover:border-neutral-200'
                }
              `}
            >
              {cat.icon?.url ? (
                <img src={cat.icon.url} alt={cat.name} className="h-6 w-6 object-contain opacity-70" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-neutral-100" />
              )}
              <span className="text-xs font-medium whitespace-nowrap">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Right arrow */}
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
          <div className="bg-gradient-to-l from-white via-white to-transparent pl-4 h-full flex items-center">
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-full border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <HiChevronRight className="h-4 w-4 text-neutral-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilterBar;
