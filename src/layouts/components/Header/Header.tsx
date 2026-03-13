import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiBell,
  HiBars3,
  HiXMark,
  HiUserCircle,
  HiUser,
  HiTicket,
  HiHeart,
  HiCog6Tooth,
  HiArrowRightOnRectangle,
  HiSquares2X2,
  HiRectangleStack,
} from 'react-icons/hi2';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { clearAuth } from '../../../store/slices/authSlice';
import { authApi } from '../../../services/api/authApi';
import Avatar from '../../../components/ui/Avatar';
import Dropdown from '../../../components/ui/Dropdown';
import SearchBar from '../../../components/search/SearchBar';
import Button from '../../../components/ui/Button';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, role, refreshToken } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Proceed with local logout even if API call fails
    } finally {
      dispatch(clearAuth());
      navigate('/');
    }
  };

  const isVendor = role === 'vendor';

  const vendorMenuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <HiSquares2X2 />, onClick: () => navigate('/provider/dashboard') },
    { key: 'listings', label: 'My Listings', icon: <HiRectangleStack />, onClick: () => navigate('/provider/listings') },
    { key: 'bookings', label: 'Bookings', icon: <HiTicket />, onClick: () => navigate('/provider/bookings') },
    { key: 'profile', label: 'Profile', icon: <HiUser />, onClick: () => navigate('/provider/profile') },
    { key: 'settings', label: 'Settings', icon: <HiCog6Tooth />, onClick: () => navigate('/settings') },
    { key: 'divider-1', type: 'divider' as const },
    { key: 'logout', label: 'Log out', icon: <HiArrowRightOnRectangle />, onClick: handleLogout, danger: true },
  ];

  const clientMenuItems = [
    { key: 'profile', label: 'Profile', icon: <HiUser />, onClick: () => navigate('/profile') },
    { key: 'bookings', label: 'Bookings', icon: <HiTicket />, onClick: () => navigate('/my-bookings') },
    { key: 'wishlists', label: 'Wishlists', icon: <HiHeart />, onClick: () => navigate('/wishlists') },
    { key: 'settings', label: 'Settings', icon: <HiCog6Tooth />, onClick: () => navigate('/settings') },
    { key: 'divider-1', type: 'divider' as const },
    { key: 'logout', label: 'Log out', icon: <HiArrowRightOnRectangle />, onClick: handleLogout, danger: true },
  ];

  const userMenuItems = isVendor ? vendorMenuItems : clientMenuItems;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-100 shadow-sticky">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <span className="text-xl font-bold text-primary-500 tracking-tight">
              EventsApp
            </span>
          </Link>

          {/* Center: Search bar - hidden on mobile */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-8">
            <SearchBar
              onSearch={(query) => {
                navigate(`/search?q=${query.where}&when=${query.when}&guests=${query.guests}`);
              }}
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Become a Provider link - hidden for vendors */}
            {!isVendor && (
              <Link
                to="/become-provider"
                className="hidden md:block text-sm font-medium text-neutral-500 hover:bg-neutral-50 rounded-full px-4 py-2.5 transition-colors"
              >
                Become a Provider
              </Link>
            )}

            {isAuthenticated && user ? (
              <>
                {/* Notification bell */}
                <button className="relative p-2.5 rounded-full hover:bg-neutral-50 transition-colors text-neutral-500">
                  <HiBell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-primary-500 rounded-full" />
                </button>

                {/* User menu dropdown */}
                <Dropdown
                  trigger={
                    <div className="flex items-center gap-2 border border-neutral-200 rounded-full pl-3 pr-1.5 py-1.5 hover:shadow-md transition-shadow">
                      <HiBars3 className="h-4 w-4 text-neutral-500" />
                      <Avatar
                        src={user.avatar?.url}
                        name={user.fullName || `${user.firstName} ${user.lastName}`}
                        size="sm"
                      />
                    </div>
                  }
                  items={userMenuItems}
                  position="bottom-right"
                />
              </>
            ) : (
              <>
                {/* Auth buttons */}
                <div className="hidden sm:flex items-center gap-2">
                  <Button as="link" to="/auth/login" variant="ghost" size="sm">
                    Log In
                  </Button>
                  <Button as="link" to="/auth/register" variant="primary" size="sm">
                    Sign Up
                  </Button>
                </div>

                {/* Mobile: user icon that opens login */}
                <Link to="/auth/login" className="sm:hidden p-2.5 rounded-full hover:bg-neutral-50 transition-colors">
                  <HiUserCircle className="h-6 w-6 text-neutral-500" />
                </Link>
              </>
            )}

            {/* Mobile hamburger - only for logged-out users */}
            {!isAuthenticated && (
              <button
                className="lg:hidden p-2.5 rounded-full hover:bg-neutral-50 transition-colors text-neutral-500"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              >
                {mobileMenuOpen ? <HiXMark className="h-5 w-5" /> : <HiBars3 className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="lg:hidden pb-3">
          <SearchBar
            onSearch={(query) => {
              navigate(`/search?q=${query.where}&when=${query.when}&guests=${query.guests}`);
              setMobileMenuOpen(false);
            }}
          />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-100 bg-white">
          <div className="max-w-container mx-auto px-4 py-4 space-y-2">
            {!isVendor && (
              <Link
                to="/become-provider"
                className="block px-4 py-3 text-sm font-medium text-neutral-500 hover:bg-neutral-50 rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Become a Provider
              </Link>
            )}
            {isAuthenticated && user ? (
              <>
                {isVendor ? (
                  <>
                    <Link
                      to="/provider/dashboard"
                      className="block px-4 py-3 text-sm font-medium text-primary-500 hover:bg-primary-50 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/provider/listings"
                      className="block px-4 py-3 text-sm text-neutral-500 hover:bg-neutral-50 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/provider/bookings"
                      className="block px-4 py-3 text-sm text-neutral-500 hover:bg-neutral-50 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Bookings
                    </Link>
                    <Link
                      to="/provider/profile"
                      className="block px-4 py-3 text-sm text-neutral-500 hover:bg-neutral-50 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-sm text-neutral-500 hover:bg-neutral-50 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="block px-4 py-3 text-sm text-neutral-500 hover:bg-neutral-50 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Bookings
                    </Link>
                    <Link
                      to="/wishlists"
                      className="block px-4 py-3 text-sm text-neutral-500 hover:bg-neutral-50 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Wishlists
                    </Link>
                  </>
                )}
                <Link
                  to="/settings"
                  className="block px-4 py-3 text-sm text-neutral-500 hover:bg-neutral-50 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-error hover:bg-red-50 rounded-xl transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-4 pt-2">
                <Button as="link" to="/auth/login" variant="outline" fullWidth onClick={() => setMobileMenuOpen(false)}>
                  Log In
                </Button>
                <Button as="link" to="/auth/register" variant="primary" fullWidth onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
