import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlinePencilSquare, HiCalendarDays, HiStar, HiHeart, HiMapPin, HiEnvelope, HiPhone } from 'react-icons/hi2';
import { useAppSelector } from '../../../store/hooks';
import { bookingApi } from '../../../services/api/bookingApi';
import Avatar from '../../../components/ui/Avatar';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Skeleton from '../../../components/ui/Skeleton';
import RatingDisplay from '../../../components/listing/RatingDisplay';
import type { Booking } from '../../../types';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [stats, setStats] = useState({ bookings: 0, reviews: 0, favorites: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bookingApi.getMyBookings({ limit: 3, sort: 'newest' });
        setRecentBookings(res.data.data.bookings);
        if (res.data.meta) {
          setStats((prev) => ({ ...prev, bookings: res.data.meta!.total }));
        }
      } catch {
        // Ignore
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchData();
  }, []);

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const address = user.address
    ? [user.address.city, user.address.state, user.address.country].filter(Boolean).join(', ')
    : null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card padding="lg" className="mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar
              src={user.avatar?.url}
              name={user.fullName}
              size="xl"
              bordered
            />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-neutral-700">{user.fullName}</h1>
              <p className="text-neutral-400 mt-1">Member since {memberSince}</p>
              {user.isEmailVerified && (
                <Badge variant="success" size="sm" className="mt-2">
                  Verified
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              leftIcon={<HiOutlinePencilSquare className="h-4 w-4" />}
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Info */}
            <Card padding="md">
              <h2 className="font-semibold text-neutral-700 mb-4">Profile Info</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <HiEnvelope className="h-5 w-5 text-neutral-400 shrink-0" />
                  <span className="text-neutral-600">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <HiPhone className="h-5 w-5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-600">{user.phone}</span>
                  </div>
                )}
                {address && (
                  <div className="flex items-center gap-3 text-sm">
                    <HiMapPin className="h-5 w-5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-600">{address}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Stats */}
            <Card padding="md">
              <h2 className="font-semibold text-neutral-700 mb-4">Your Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-2">
                    <HiCalendarDays className="h-5 w-5 text-primary-500" />
                  </div>
                  <p className="text-lg font-bold text-neutral-700">{stats.bookings}</p>
                  <p className="text-xs text-neutral-400">Bookings</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-2">
                    <HiStar className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-lg font-bold text-neutral-700">{stats.reviews}</p>
                  <p className="text-xs text-neutral-400">Reviews</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-2">
                    <HiHeart className="h-5 w-5 text-red-500" />
                  </div>
                  <p className="text-lg font-bold text-neutral-700">{stats.favorites}</p>
                  <p className="text-xs text-neutral-400">Favorites</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Bookings */}
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-neutral-700">Recent Bookings</h2>
                <Link
                  to="/my-bookings"
                  className="text-sm font-medium text-primary-500 hover:underline"
                >
                  View all
                </Link>
              </div>

              {loadingBookings ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton variant="rect" width={80} height={60} className="rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <Link
                      key={booking._id}
                      to={`/my-bookings/${booking._id}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                      <img
                        src={booking.listing.images?.[0]?.url || 'https://placehold.co/80x60?text=No+Image'}
                        alt={booking.listing.title}
                        className="w-20 h-14 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-700 truncate">
                          {booking.listing.title}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {new Date(booking.eventDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={
                          booking.status === 'confirmed'
                            ? 'success'
                            : booking.status === 'cancelled' || booking.status === 'rejected'
                            ? 'error'
                            : booking.status === 'completed'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400 text-center py-6">
                  No bookings yet. Start exploring services!
                </p>
              )}
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card padding="md" hoverable clickable onClick={() => navigate('/wishlists')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <HiHeart className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-700">Wishlists</p>
                    <p className="text-xs text-neutral-400">View saved listings</p>
                  </div>
                </div>
              </Card>
              <Card padding="md" hoverable clickable onClick={() => navigate('/settings')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    <HiOutlinePencilSquare className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-700">Settings</p>
                    <p className="text-xs text-neutral-400">Account & preferences</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
