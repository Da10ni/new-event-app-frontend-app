import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '../config';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import OtpVerificationPage from '../pages/auth/OtpVerificationPage';
import VendorRegisterPage from '../pages/auth/VendorRegisterPage';

// Client Pages
import HomePage from '../pages/client/home/HomePage';
import SearchResultsPage from '../pages/client/search/SearchResultsPage';
import ListingDetailPage from '../pages/client/listing/ListingDetailPage';
import BookingPage from '../pages/client/booking/BookingPage';
import CheckoutPage from '../pages/client/booking/CheckoutPage';
import MyBookingsPage from '../pages/client/booking/MyBookingsPage';
import BookingDetailPage from '../pages/client/booking/BookingDetailPage';
import WishlistPage from '../pages/client/wishlist/WishlistPage';
import InboxPage from '../pages/client/inbox/InboxPage';
import ProfilePage from '../pages/client/profile/ProfilePage';
import EditProfilePage from '../pages/client/profile/EditProfilePage';
import SettingsPage from '../pages/client/profile/SettingsPage';
import ReviewPage from '../pages/client/review/ReviewPage';

// Provider Pages
import DashboardPage from '../pages/provider/dashboard/DashboardPage';
import MyListingsPage from '../pages/provider/listings/MyListingsPage';
import AddListingPage from '../pages/provider/listings/AddListingPage';
import EditListingPage from '../pages/provider/listings/EditListingPage';
import ProviderBookingsPage from '../pages/provider/bookings/ProviderBookingsPage';
import ProviderBookingDetailPage from '../pages/provider/bookings/ProviderBookingDetailPage';
import EarningsPage from '../pages/provider/earnings/EarningsPage';
import ReviewsPage from '../pages/provider/reviews/ReviewsPage';
import ProviderProfilePage from '../pages/provider/profile/ProviderProfilePage';
import ProviderInboxPage from '../pages/provider/inbox/ProviderInboxPage';

// Static Pages
import AboutPage from '../pages/static/AboutPage';
import ContactPage from '../pages/static/ContactPage';
import NotFoundPage from '../pages/static/NotFoundPage';

export const router = createBrowserRouter([
  // Public routes with MainLayout (Header + Footer)
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.SEARCH, element: <SearchResultsPage /> },
      { path: ROUTES.CATEGORY, element: <SearchResultsPage /> },
      { path: ROUTES.LISTING_DETAIL, element: <ListingDetailPage /> },
      { path: ROUTES.ABOUT, element: <AboutPage /> },
      { path: ROUTES.CONTACT, element: <ContactPage /> },

      // Protected client routes (with MainLayout)
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.BOOKING, element: <BookingPage /> },
          { path: ROUTES.CHECKOUT, element: <CheckoutPage /> },
          { path: ROUTES.MY_BOOKINGS, element: <MyBookingsPage /> },
          { path: ROUTES.BOOKING_DETAIL, element: <BookingDetailPage /> },
          { path: ROUTES.REVIEW, element: <ReviewPage /> },
          { path: ROUTES.WISHLISTS, element: <WishlistPage /> },
          { path: ROUTES.INBOX, element: <InboxPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
          { path: ROUTES.EDIT_PROFILE, element: <EditProfilePage /> },
          { path: ROUTES.SETTINGS, element: <SettingsPage /> },
        ],
      },
    ],
  },

  // Auth routes with AuthLayout
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
      { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
      { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
      { path: ROUTES.OTP_VERIFY, element: <OtpVerificationPage /> },
      { path: ROUTES.VENDOR_REGISTER, element: <VendorRegisterPage /> },
    ],
  },

  // Provider routes with DashboardLayout (Sidebar)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={['vendor']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: ROUTES.PROVIDER_DASHBOARD, element: <DashboardPage /> },
              { path: ROUTES.PROVIDER_LISTINGS, element: <MyListingsPage /> },
              { path: ROUTES.PROVIDER_CREATE_LISTING, element: <AddListingPage /> },
              { path: ROUTES.PROVIDER_EDIT_LISTING, element: <EditListingPage /> },
              { path: ROUTES.PROVIDER_BOOKINGS, element: <ProviderBookingsPage /> },
              { path: ROUTES.PROVIDER_BOOKING_DETAIL, element: <ProviderBookingDetailPage /> },
              { path: ROUTES.PROVIDER_EARNINGS, element: <EarningsPage /> },
              { path: ROUTES.PROVIDER_REVIEWS, element: <ReviewsPage /> },
              { path: ROUTES.PROVIDER_INBOX, element: <ProviderInboxPage /> },
              { path: ROUTES.PROVIDER_PROFILE, element: <ProviderProfilePage /> },
            ],
          },
        ],
      },
    ],
  },

  // 404
  { path: ROUTES.NOT_FOUND, element: <NotFoundPage /> },
]);
