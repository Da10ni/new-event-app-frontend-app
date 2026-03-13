import React, { useState, useRef, useEffect } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';

interface SearchBarProps {
  onSearch?: (query: { where: string; when: string; guests: string }) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className = '' }) => {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [where, setWhere] = useState('');
  const [when, setWhen] = useState('');
  const [guests, setGuests] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveSegment(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    onSearch?.({ where, when, guests });
    setActiveSegment(null);
  };

  const isExpanded = activeSegment !== null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Collapsed search bar (pill) */}
      {!isExpanded && (
        <div
          className="flex items-center border border-neutral-200 rounded-full shadow-search hover:shadow-search-hover transition-shadow cursor-pointer"
          onClick={() => setActiveSegment('where')}
        >
          <button className="px-5 py-3 text-sm font-medium text-neutral-600 whitespace-nowrap">
            Anywhere
          </button>
          <span className="h-6 w-px bg-neutral-200" />
          <button className="px-5 py-3 text-sm font-medium text-neutral-600 whitespace-nowrap">
            Any time
          </button>
          <span className="h-6 w-px bg-neutral-200" />
          <button className="px-5 py-3 text-sm text-neutral-400 whitespace-nowrap">
            Add guests
          </button>
          <div className="pr-2 pl-1">
            <div className="p-2 bg-primary-500 rounded-full text-white">
              <HiMagnifyingGlass className="h-4 w-4" />
            </div>
          </div>
        </div>
      )}

      {/* Expanded search bar */}
      {isExpanded && (
        <div className="flex items-center bg-white border border-neutral-200 rounded-full shadow-search-hover">
          {/* Where */}
          <div
            className={`flex-1 min-w-0 px-5 py-2.5 rounded-full cursor-pointer transition-colors ${
              activeSegment === 'where' ? 'bg-neutral-50' : 'hover:bg-neutral-50'
            }`}
            onClick={() => setActiveSegment('where')}
          >
            <label className="block text-[11px] font-semibold text-neutral-600 leading-tight">Where</label>
            <input
              type="text"
              placeholder="Search destinations"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              className="w-full text-sm text-neutral-600 placeholder-neutral-300 bg-transparent border-none outline-none"
              autoFocus={activeSegment === 'where'}
            />
          </div>

          <span className="h-6 w-px bg-neutral-200 shrink-0" />

          {/* When */}
          <div
            className={`flex-1 min-w-0 px-5 py-2.5 rounded-full cursor-pointer transition-colors ${
              activeSegment === 'when' ? 'bg-neutral-50' : 'hover:bg-neutral-50'
            }`}
            onClick={() => setActiveSegment('when')}
          >
            <label className="block text-[11px] font-semibold text-neutral-600 leading-tight">When</label>
            <input
              type="text"
              placeholder="Add dates"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="w-full text-sm text-neutral-600 placeholder-neutral-300 bg-transparent border-none outline-none"
              autoFocus={activeSegment === 'when'}
            />
          </div>

          <span className="h-6 w-px bg-neutral-200 shrink-0" />

          {/* Guests */}
          <div
            className={`flex-1 min-w-0 px-5 py-2.5 rounded-full cursor-pointer transition-colors ${
              activeSegment === 'guests' ? 'bg-neutral-50' : 'hover:bg-neutral-50'
            }`}
            onClick={() => setActiveSegment('guests')}
          >
            <label className="block text-[11px] font-semibold text-neutral-600 leading-tight">Guests</label>
            <input
              type="text"
              placeholder="Add guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full text-sm text-neutral-600 placeholder-neutral-300 bg-transparent border-none outline-none"
              autoFocus={activeSegment === 'guests'}
            />
          </div>

          {/* Search button */}
          <div className="pr-2 pl-1 shrink-0">
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-full font-medium text-sm transition-colors"
            >
              <HiMagnifyingGlass className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
