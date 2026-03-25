import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import ScrollToTop from '../components/ScrollToTop';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-neutral-50">
      <ScrollToTop />
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
