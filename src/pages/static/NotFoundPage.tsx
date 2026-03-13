import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineExclamationTriangle, HiArrowLeft, HiMagnifyingGlass } from 'react-icons/hi2';
import Button from '../../components/ui/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <span className="text-[120px] sm:text-[160px] font-bold text-neutral-100 leading-none select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
                <HiOutlineExclamationTriangle className="h-10 w-10 text-primary-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700 mb-3">
          Page not found
        </h1>
        <p className="text-neutral-400 mb-8 max-w-sm mx-auto">
          Sorry, we could not find the page you are looking for. It might have been removed, renamed, or
          does not exist.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<HiArrowLeft className="h-5 w-5" />}
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
          <Button
            variant="outline"
            size="lg"
            leftIcon={<HiMagnifyingGlass className="h-5 w-5" />}
            onClick={() => navigate('/search')}
          >
            Search Events
          </Button>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-neutral-100">
          <p className="text-sm text-neutral-400 mb-4">Here are some helpful links:</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { label: 'Home', path: '/' },
              { label: 'Search', path: '/search' },
              { label: 'About', path: '/about' },
              { label: 'Contact', path: '/contact' },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className="text-sm font-medium text-primary-500 hover:text-primary-600 hover:underline transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
