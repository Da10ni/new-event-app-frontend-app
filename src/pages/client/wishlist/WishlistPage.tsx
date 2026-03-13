import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi2';
import { favoriteApi } from '../../../services/api/favoriteApi';
import ListingCard from '../../../components/listing/ListingCard';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/feedback/EmptyState';
import type { Listing } from '../../../types';

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const res = await favoriteApi.getAll();
        // The API returns favorites that contain listing objects
        const data = res.data.data?.favorites || res.data.data || [];
        const listings = data.map((fav: { listing: Listing } | Listing) => {
          return 'listing' in fav ? fav.listing : fav;
        });
        setFavorites(listings);
      } catch {
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700 mb-2">Your Wishlists</h1>
        <p className="text-neutral-400 mb-8">
          {!loading && favorites.length > 0 && `${favorites.length} saved listing${favorites.length !== 1 ? 's' : ''}`}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton variant="card" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="50%" />
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                initialFavorited
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<HiOutlineHeart className="h-16 w-16 mx-auto" />}
            title="No saved listings yet"
            description="Start exploring and save the venues and services you love by tapping the heart icon."
            actionLabel="Start Exploring"
            onAction={() => navigate('/search')}
          />
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
