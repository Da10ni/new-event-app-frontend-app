import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiSquares2X2,
  HiRectangleStack,
  HiCalendarDays,
  HiBanknotes,
  HiStar,
  HiUserCircle,
  HiBars3,
  HiXMark,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { clearAuth } from '../../../store/slices/authSlice';
import { authApi } from '../../../services/api/authApi';
import Avatar from '../../../components/ui/Avatar';
import Badge from '../../../components/ui/Badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/provider/dashboard', icon: <HiSquares2X2 className="h-5 w-5" /> },
  { label: 'Listings', href: '/provider/listings', icon: <HiRectangleStack className="h-5 w-5" /> },
  { label: 'Bookings', href: '/provider/bookings', icon: <HiCalendarDays className="h-5 w-5" /> },
  { label: 'Earnings', href: '/provider/earnings', icon: <HiBanknotes className="h-5 w-5" /> },
  { label: 'Reviews', href: '/provider/reviews', icon: <HiStar className="h-5 w-5" /> },
  { label: 'Profile', href: '/provider/profile', icon: <HiUserCircle className="h-5 w-5" /> },
];

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, role, refreshToken } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Proceed with local logout
    } finally {
      dispatch(clearAuth());
      navigate('/');
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="p-5 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatar?.url}
            name={user ? `${user.firstName} ${user.lastName}` : ''}
            size="lg"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-600 truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Provider'}
            </p>
            <Badge variant="info" size="sm" className="mt-1">
              {role === 'vendor' ? 'Provider' : role || 'User'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
              ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600'
              }
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom logout */}
      <div className="p-3 border-t border-neutral-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:bg-red-50 hover:text-error transition-colors"
        >
          <HiArrowRightOnRectangle className="h-5 w-5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 p-3 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors"
      >
        <HiBars3 className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-white border-r border-neutral-100 h-screen sticky top-0
          ${className}
          /* Desktop: static */
          hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0
        `}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-neutral-100
          transform transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-end p-3">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-full hover:bg-neutral-50 transition-colors text-neutral-500"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
