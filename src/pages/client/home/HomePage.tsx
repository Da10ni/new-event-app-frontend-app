import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiMagnifyingGlass, HiCalendarDays, HiCheckBadge, HiSparkles, HiArrowRight, HiChevronLeft, HiChevronRight, HiMapPin, HiShieldCheck, HiClock, HiCurrencyDollar, HiStar, HiUserGroup } from 'react-icons/hi2';
import { listingApi } from '../../../services/api/listingApi';
import { categoryApi } from '../../../services/api/categoryApi';
import { useAppDispatch } from '../../../store/hooks';
import { setFeaturedListings } from '../../../store/slices/listingSlice';
import { setCategories } from '../../../store/slices/categorySlice';
import ListingCard from '../../../components/listing/ListingCard';
import Skeleton from '../../../components/ui/Skeleton';
import Button from '../../../components/ui/Button';
import type { Listing, Category } from '../../../types';

const POPULAR_CITIES = [
  { name: 'Karachi', image: 'https://images.pexels.com/photos/34877361/pexels-photo-34877361.jpeg?auto=compress&cs=tinysrgb&w=600', listings: '500+' },
  { name: 'Lahore', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80', listings: '400+' },
  { name: 'Islamabad', image: 'https://images.pexels.com/photos/28536082/pexels-photo-28536082.jpeg?auto=compress&cs=tinysrgb&w=600', listings: '350+'},
  { name: 'Rawalpindi', image: 'https://images.pexels.com/photos/8583526/pexels-photo-8583526.jpeg?auto=compress&cs=tinysrgb&w=600' , listings: '200+' },
  { name: 'Faisalabad', image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600&q=80', listings: '180+' },
  { name: 'Multan', image: 'https://images.pexels.com/photos/19854844/pexels-photo-19854844.jpeg?auto=compress&cs=tinysrgb&w=600', listings: '120+' },
];

const HOW_IT_WORKS = [
  {
    icon: <HiMagnifyingGlass className="h-8 w-8" />,
    title: 'Search',
    description: 'Browse thousands of venues and services. Filter by category, location, price, and ratings to find your perfect match.',
  },
  {
    icon: <HiCalendarDays className="h-8 w-8" />,
    title: 'Book',
    description: 'Select your date, choose a package, and send a booking request. Communicate directly with the service provider.',
  },
  {
    icon: <HiCheckBadge className="h-8 w-8" />,
    title: 'Enjoy',
    description: 'Once confirmed, enjoy a seamless event experience. Leave a review to help others find great services.',
  },
];

const WHY_CHOOSE = [
  { icon: <HiShieldCheck className="h-7 w-7" />, title: 'Verified Providers', description: 'All vendors are verified for quality and reliability.' },
  { icon: <HiClock className="h-7 w-7" />, title: 'Instant Booking', description: 'Get real-time availability and quick confirmations.' },
  { icon: <HiCurrencyDollar className="h-7 w-7" />, title: 'Best Prices', description: 'Compare prices from multiple vendors in one place.' },
  { icon: <HiStar className="h-7 w-7" />, title: 'Honest Reviews', description: 'Authentic reviews from real customers to guide your choice.' },
  { icon: <HiUserGroup className="h-7 w-7" />, title: 'Dedicated Support', description: '24/7 support team to assist you before, during, and after events.' },
  { icon: <HiSparkles className="h-7 w-7" />, title: 'Wide Selection', description: 'From venues to caterers, photographers to decor specialists.' },
];

const CATEGORY_ICONS: Record<string, string> = {
  venues: '🏛️', catering: '🍽️', photography: '📸', decoration: '🎨', entertainment: '🎵',
  'wedding-planning': '💍', transport: '🚗', lighting: '💡', 'makeup-artist': '💄', florist: '🌸',
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [categories, setCategoriesLocal] = useState<Category[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const featuredRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await listingApi.getFeatured();
        const data = res.data.data.listings;
        setFeatured(data);
        dispatch(setFeaturedListings(data));
      } catch {
        // Silently handle error
      } finally {
        setLoadingFeatured(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        const data = res.data.data.categories;
        setCategoriesLocal(data);
        dispatch(setCategories(data));
      } catch {
        // Silently handle error
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchFeatured();
    fetchCategories();
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const scrollFeatured = (direction: 'left' | 'right') => {
    if (featuredRef.current) {
      const amount = direction === 'left' ? -340 : 340;
      featuredRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-400 via-primary-600 to-secondary-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80')] bg-cover bg-center mix-blend-overlay opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
              Find the Perfect Venue & Services for Your Event
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Discover and book the best event venues, caterers, photographers, and more — all in one place.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-full shadow-xl overflow-hidden p-2">
                <div className="flex-1 flex items-center px-4">
                  <HiMagnifyingGlass className="h-5 w-5 text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search venues, photographers, caterers..."
                    className="w-full px-3 py-2 text-neutral-600 placeholder-neutral-400 bg-transparent border-none outline-none text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 sm:px-8 py-3 rounded-full font-semibold text-sm transition-colors shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <span className="text-white/60 text-sm">Popular:</span>
              {['Wedding Venues', 'Photographers', 'Caterers', 'Decorators'].map((term) => (
                <button
                  key={term}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                  className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-600">Browse by Category</h2>
          <p className="text-neutral-400 mt-2">Find exactly what you need for your event</p>
        </div>

        {loadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }, (_, i) => (
              <Skeleton key={i} variant="rect" height={120} className="rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.filter(c => c.isActive).slice(0, 10).map((category) => (
              <button
                key={category._id}
                onClick={() => navigate(`/search?category=${category.slug}`)}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-neutral-100 bg-white hover:shadow-lg hover:border-primary-100 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl group-hover:bg-primary-100 transition-colors">
                  {category.icon?.url ? (
                    <img src={category.icon.url} alt={category.name} className="h-7 w-7 object-contain" />
                  ) : (
                    <span>{CATEGORY_ICONS[category.slug] || '📋'}</span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-neutral-600 group-hover:text-primary-500 transition-colors">
                    {category.name}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">{category.listingCount} listings</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Featured Listings Section */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-600">Featured Listings</h2>
              <p className="text-neutral-400 mt-1">Hand-picked top-rated services for you</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollFeatured('left')}
                className="p-2 rounded-full border border-neutral-200 bg-white hover:shadow-md transition-shadow"
              >
                <HiChevronLeft className="h-5 w-5 text-neutral-600" />
              </button>
              <button
                onClick={() => scrollFeatured('right')}
                className="p-2 rounded-full border border-neutral-200 bg-white hover:shadow-md transition-shadow"
              >
                <HiChevronRight className="h-5 w-5 text-neutral-600" />
              </button>
            </div>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton variant="card" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="50%" />
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div
              ref={featuredRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featured.map((listing) => (
                <div
                  key={listing._id}
                  className="min-w-[280px] sm:min-w-[300px] lg:min-w-[310px] snap-start"
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-400 py-12">No featured listings available at the moment.</p>
          )}

          <div className="text-center mt-8">
            <Button as="link" to="/search" variant="outline" rightIcon={<HiArrowRight className="h-4 w-4" />}>
              View All Listings
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-600">How It Works</h2>
          <p className="text-neutral-400 mt-2">Plan your perfect event in 3 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {HOW_IT_WORKS.map((step, index) => (
            <div key={step.title} className="text-center group">
              <div className="relative inline-flex mb-6">
                <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500 group-hover:bg-primary-100 transition-colors">
                  {step.icon}
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-600 mb-2">{step.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-600">Popular Cities</h2>
            <p className="text-neutral-400 mt-2">Explore top event destinations across Pakistan</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => navigate(`/search?city=${encodeURIComponent(city.name)}`)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-base">{city.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <HiMapPin className="h-3.5 w-3.5 text-white/70" />
                    <span className="text-white/70 text-xs">{city.listings} listings</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-600">Why Choose EventsApp</h2>
          <p className="text-neutral-400 mt-2">Your trusted partner for event planning</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 p-6 rounded-2xl border border-neutral-100 hover:shadow-lg hover:border-primary-100 transition-all duration-300 bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary-50 flex items-center justify-center text-secondary-500 shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-neutral-600 mb-1">{item.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-l from-secondary-500 to-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Become a Service Provider
              </h2>
              <p className="text-white/80 max-w-lg">
                List your venue or services on EventsApp and reach thousands of potential customers.
                Manage bookings, showcase your work, and grow your business.
              </p>
            </div>
            <div className="shrink-0">
              <Button
                as="link"
                to="/auth/register?role=vendor"
                variant="primary"
                size="lg"
                className="bg-white! text-secondary-500! hover:bg-neutral-50! hover:text-secondary-700!"
                rightIcon={<HiArrowRight className="h-5 w-5" />}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
