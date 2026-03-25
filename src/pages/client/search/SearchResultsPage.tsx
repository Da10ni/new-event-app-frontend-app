import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiAdjustmentsHorizontal, HiXMark, HiMapPin } from 'react-icons/hi2';
import { listingApi } from '../../../services/api/listingApi';
import { categoryApi } from '../../../services/api/categoryApi';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setCategories } from '../../../store/slices/categorySlice';
import ListingCard from '../../../components/listing/ListingCard';
import SearchBar from '../../../components/search/SearchBar';
import CategoryFilterBar from '../../../components/search/CategoryFilterBar';
import FilterChips from '../../../components/search/FilterChips';
import PriceRangeSlider from '../../../components/search/PriceRangeSlider';
import Pagination from '../../../components/ui/Pagination';
import Skeleton from '../../../components/ui/Skeleton';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/feedback/EmptyState';
import StarRating from '../../../components/ui/StarRating';
import type { Listing, ListingFilter, PaginationMeta } from '../../../types';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
];

const CITY_OPTIONS = [
  { value: '', label: 'All Cities' },
  { value: 'Karachi', label: 'Karachi' },
  { value: 'Lahore', label: 'Lahore' },
  { value: 'Islamabad', label: 'Islamabad' },
  { value: 'Rawalpindi', label: 'Rawalpindi' },
  { value: 'Faisalabad', label: 'Faisalabad' },
  { value: 'Multan', label: 'Multan' },
  { value: 'Peshawar', label: 'Peshawar' },
];

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.category);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Read filter state from URL
  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 500000;
  const rating = searchParams.get('rating') ? Number(searchParams.get('rating')) : 0;
  const sort = searchParams.get('sort') || '';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 0) {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      // Reset page when filters change (unless we're explicitly changing page)
      if (!('page' in updates)) {
        newParams.delete('page');
      }
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Fetch categories
  useEffect(() => {
    if (categories.length === 0) {
      categoryApi.getAll().then((res) => {
        dispatch(setCategories(res.data.data.categories));
      }).catch(() => {});
    }
  }, [dispatch, categories.length]);

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: 12 };
        if (query) params.search = query;
        if (categorySlug) params.category = categorySlug;
        if (city) params.city = city;
        if (minPrice > 0) params.minPrice = minPrice;
        if (maxPrice < 500000) params.maxPrice = maxPrice;
        if (rating > 0) params.rating = rating;
        if (sort) params.sort = sort;

        const res = await listingApi.getAll(params as ListingFilter);
        setListings(res.data.data.listings);
        if (res.data.meta) {
          setMeta(res.data.meta);
        }
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [query, categorySlug, city, minPrice, maxPrice, rating, sort, page]);

  // Build active filter chips
  const activeFilters: Array<{ key: string; label: string }> = [];
  if (query) activeFilters.push({ key: 'q', label: `"${query}"` });
  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug);
    activeFilters.push({ key: 'category', label: cat?.name || categorySlug });
  }
  if (city) activeFilters.push({ key: 'city', label: city });
  if (minPrice > 0 || maxPrice < 500000) {
    activeFilters.push({ key: 'price', label: `PKR ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}` });
  }
  if (rating > 0) activeFilters.push({ key: 'rating', label: `${rating}+ stars` });

  const handleRemoveFilter = (key: string) => {
    if (key === 'price') {
      updateParams({ minPrice: null, maxPrice: null });
    } else {
      updateParams({ [key]: null });
    }
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleSearch = (searchData: { where: string; when: string; guests: string }) => {
    const params: Record<string, string | null> = { q: searchData.where || null };
    if (searchData.where) {
      // Check if it might be a city name
      const matchCity = CITY_OPTIONS.find(
        (c) => c.value.toLowerCase() === searchData.where.toLowerCase()
      );
      if (matchCity) params.city = matchCity.value;
    }
    updateParams(params);
  };

  const selectedCategoryId = categories.find((c) => c.slug === categorySlug)?._id || null;

  const handleCategorySelect = (catId: string | null) => {
    if (catId === null) {
      updateParams({ category: null });
    } else {
      const cat = categories.find((c) => c._id === catId);
      updateParams({ category: cat?.slug || null });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="border-b border-neutral-100 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar onSearch={handleSearch} />
        </div>
        {/* Category Bar */}
        {categories.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-50">
            <CategoryFilterBar
              categories={categories.filter((c) => c.isActive)}
              selectedCategory={selectedCategoryId}
              onSelect={handleCategorySelect}
            />
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            {meta && !loading && (
              <p className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-700">{meta.total}</span> results found
                {query && (
                  <span>
                    {' '}for <span className="font-semibold text-neutral-700">"{query}"</span>
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Select
              options={SORT_OPTIONS}
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value || null })}
              containerClassName="w-48"
              placeholder="Sort by"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                showFilters
                  ? 'border-primary-500 bg-primary-50 text-primary-500'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              <HiAdjustmentsHorizontal className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:inline">Filters</span>
              {activeFilters.length > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <FilterChips
          filters={activeFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAll}
          className="mb-6"
        />

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-72 shrink-0 hidden lg:block">
              <div className="sticky top-48 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-700">Filters</h3>
                  <button onClick={handleClearAll} className="text-sm text-primary-500 hover:underline">
                    Reset all
                  </button>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Price Range</h4>
                  <PriceRangeSlider
                    min={0}
                    max={500000}
                    value={[minPrice, maxPrice]}
                    onChange={([min, max]) => updateParams({ minPrice: min || null, maxPrice: max >= 500000 ? null : max })}
                    step={5000}
                  />
                </div>

                {/* Rating Filter */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((stars) => (
                      <button
                        key={stars}
                        onClick={() => updateParams({ rating: rating === stars ? null : stars })}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                          rating === stars
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-neutral-500 hover:bg-neutral-50'
                        }`}
                      >
                        <StarRating rating={stars} size="sm" />
                        <span>& up</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* City Filter */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">City</h4>
                  <Select
                    options={CITY_OPTIONS}
                    value={city}
                    onChange={(e) => updateParams({ city: e.target.value || null })}
                    icon={<HiMapPin className="h-4 w-4" />}
                  />
                </div>
              </div>
            </aside>
          )}

          {/* Mobile Filter Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-700">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 rounded-full hover:bg-neutral-100"
                    >
                      <HiXMark className="h-5 w-5" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-neutral-600 mb-3">Price Range</h4>
                    <PriceRangeSlider
                      min={0}
                      max={500000}
                      value={[minPrice, maxPrice]}
                      onChange={([min, max]) => updateParams({ minPrice: min || null, maxPrice: max >= 500000 ? null : max })}
                      step={5000}
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-neutral-600 mb-3">Minimum Rating</h4>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map((stars) => (
                        <button
                          key={stars}
                          onClick={() => updateParams({ rating: rating === stars ? null : stars })}
                          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                            rating === stars
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-neutral-500 hover:bg-neutral-50'
                          }`}
                        >
                          <StarRating rating={stars} size="sm" />
                          <span>& up</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-neutral-600 mb-3">City</h4>
                    <Select
                      options={CITY_OPTIONS}
                      value={city}
                      onChange={(e) => updateParams({ city: e.target.value || null })}
                      icon={<HiMapPin className="h-4 w-4" />}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" fullWidth onClick={handleClearAll}>
                      Reset
                    </Button>
                    <Button variant="primary" fullWidth onClick={() => setShowFilters(false)}>
                      Show Results
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton variant="card" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </div>
                ))}
              </div>
            ) : listings.length > 0 ? (
              <>
                <div
                  className={`grid gap-6 ${
                    showFilters
                      ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}
                >
                  {listings.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination
                      currentPage={meta.page}
                      totalPages={meta.totalPages}
                      onPageChange={(p) => updateParams({ page: p })}
                    />
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="No results found"
                description="Try adjusting your search or filters to find what you're looking for."
                actionLabel="Clear Filters"
                onAction={handleClearAll}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
