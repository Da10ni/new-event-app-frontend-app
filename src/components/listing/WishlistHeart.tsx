import React, { useState } from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi2';
import { useAppSelector } from '../../store/hooks';
import { favoriteApi } from '../../services/api/favoriteApi';
import toast from 'react-hot-toast';

interface WishlistHeartProps {
  listingId: string;
  initialFavorited?: boolean;
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
}

const WishlistHeart: React.FC<WishlistHeartProps> = ({
  listingId,
  initialFavorited = false,
  className = '',
  onToggle,
}) => {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to save to wishlist');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isFavorited) {
        await favoriteApi.remove(listingId);
        setIsFavorited(false);
        onToggle?.(false);
        toast.success('Removed from wishlist');
      } else {
        await favoriteApi.add(listingId);
        setIsFavorited(true);
        onToggle?.(true);
        toast.success('Saved to wishlist');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95
        ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isFavorited ? (
        <HiHeart className="h-6 w-6 text-primary-500 drop-shadow-sm" />
      ) : (
        <HiOutlineHeart className="h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
      )}
    </button>
  );
};

export default WishlistHeart;
