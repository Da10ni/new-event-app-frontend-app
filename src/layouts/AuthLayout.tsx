import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top bar with logo */}
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-block">
          <span className="text-xl font-bold text-primary-500 tracking-tight">
            EventsApp
          </span>
        </Link>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-card border border-neutral-100 px-6 sm:px-8 py-8">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Minimal footer */}
      <div className="py-4 px-4 text-center">
        <p className="text-xs text-neutral-300">
          &copy; {new Date().getFullYear()} EventsApp. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
