import React, { useState, useEffect } from 'react';
import {
  HiUserCircle,
  HiBuildingStorefront,
  HiPhone,
  HiEnvelope,
  HiGlobeAlt,
  HiMapPin,
  HiClock,
  HiCheckBadge,
  HiStar,
  HiCalendarDays,
  HiSignal,
  HiSignalSlash,
  HiPencilSquare,
  HiLink,
} from 'react-icons/hi2';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setVendor } from '../../../store/slices/authSlice';
import { vendorApi } from '../../../services/api/vendorApi';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import TextArea from '../../../components/ui/TextArea';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Avatar from '../../../components/ui/Avatar';
import StarRating from '../../../components/ui/StarRating';
import LoadingSpinner from '../../../components/feedback/LoadingSpinner';
import toast from 'react-hot-toast';
import type { Vendor } from '../../../types';

const CITIES = [
  { value: 'Lahore', label: 'Lahore' },
  { value: 'Karachi', label: 'Karachi' },
  { value: 'Islamabad', label: 'Islamabad' },
  { value: 'Rawalpindi', label: 'Rawalpindi' },
  { value: 'Faisalabad', label: 'Faisalabad' },
  { value: 'Multan', label: 'Multan' },
  { value: 'Peshawar', label: 'Peshawar' },
  { value: 'Quetta', label: 'Quetta' },
  { value: 'Sialkot', label: 'Sialkot' },
  { value: 'Hyderabad', label: 'Hyderabad' },
];

const CATEGORIES_LIST = [
  { value: 'venue', label: 'Venue' },
  { value: 'catering', label: 'Catering' },
  { value: 'photography', label: 'Photography' },
  { value: 'decoration', label: 'Decoration' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'planning', label: 'Event Planning' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'makeup', label: 'Makeup & Beauty' },
  { value: 'other', label: 'Other' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ProfileFormData {
  businessName: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  area: string;
  address: string;
  operatingHours: Record<string, { open: string; close: string; closed: boolean }>;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

const ProviderProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, vendor } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    businessName: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    city: '',
    area: '',
    address: '',
    operatingHours: DAYS.reduce(
      (acc, day) => ({
        ...acc,
        [day]: { open: '09:00', close: '18:00', closed: false },
      }),
      {} as Record<string, { open: string; close: string; closed: boolean }>
    ),
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getMyProfile();
      const profile = res.data?.data?.vendor || res.data?.data;

      if (profile) {
        setProfileData(profile);
        dispatch(setVendor(profile));
        setFormData({
          businessName: profile.businessName || '',
          description: profile.description || '',
          category: profile.categories?.[0]?.slug || profile.category || '',
          phone: profile.phone || user?.phone || '',
          email: profile.email || user?.email || '',
          website: profile.website || '',
          city: profile.address?.city || '',
          area: profile.address?.area || '',
          address: profile.address?.street || '',
          operatingHours: profile.operatingHours ||
            DAYS.reduce(
              (acc, day) => ({
                ...acc,
                [day]: { open: '09:00', close: '18:00', closed: day === 'Sunday' },
              }),
              {} as Record<string, { open: string; close: string; closed: boolean }>
            ),
          socialLinks: {
            facebook: profile.socialLinks?.facebook || '',
            instagram: profile.socialLinks?.instagram || '',
            twitter: profile.socialLinks?.twitter || '',
            linkedin: profile.socialLinks?.linkedin || '',
          },
        });
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSocialLink = (key: keyof ProfileFormData['socialLinks'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const updateOperatingHours = (
    day: string,
    field: 'open' | 'close' | 'closed',
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!formData.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }

    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        businessName: formData.businessName.trim(),
        description: formData.description.trim(),
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        address: {
          city: formData.city,
          country: 'Pakistan',
          area: formData.area || undefined,
          street: formData.address || undefined,
        },
        operatingHours: formData.operatingHours,
        socialLinks: formData.socialLinks,
      };

      const res = await vendorApi.updateProfile(updateData);
      const updatedVendor = res.data?.data?.vendor;
      if (updatedVendor) {
        dispatch(setVendor(updatedVendor));
      }
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async () => {
    setToggling(true);
    try {
      const res = await vendorApi.toggleAvailability();
      const updatedVendor = res.data?.data?.vendor;
      if (updatedVendor) {
        dispatch(setVendor(updatedVendor));
        setProfileData((prev) =>
          prev ? { ...prev, isAvailable: updatedVendor.isAvailable } : prev
        );
      }
      toast.success(
        updatedVendor?.isAvailable
          ? 'You are now online and accepting bookings'
          : 'You are now offline'
      );
    } catch {
      toast.error('Failed to toggle availability');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Loading profile..." />;
  }

  const isAvailable = (profileData as Record<string, unknown>)?.isAvailable ?? vendor?.isAvailable ?? true;
  const memberSince = vendor?.createdAt || user?.createdAt || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-600">Business Profile</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage your business information and settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Availability Toggle */}
          <Button
            variant={isAvailable ? 'secondary' : 'outline'}
            size="sm"
            leftIcon={
              isAvailable ? (
                <HiSignal className="h-4 w-4" />
              ) : (
                <HiSignalSlash className="h-4 w-4" />
              )
            }
            onClick={handleToggleAvailability}
            loading={toggling}
          >
            {isAvailable ? 'Online' : 'Offline'}
          </Button>
        </div>
      </div>

      {/* Business Profile Card */}
      <Card padding="lg">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Logo / Avatar */}
          <div className="shrink-0">
            <Avatar
              src={user?.avatar?.url}
              name={vendor?.businessName || formData.businessName}
              size="xl"
              bordered
            />
          </div>

          {/* Business Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h2 className="text-xl font-bold text-neutral-600">
                {vendor?.businessName || formData.businessName}
              </h2>
              {vendor?.status === 'active' && (
                <Badge variant="success" size="sm">
                  <HiCheckBadge className="h-3.5 w-3.5 mr-0.5" />
                  Verified
                </Badge>
              )}
              <Badge variant={isAvailable ? 'success' : 'default'} dot size="sm">
                {isAvailable ? 'Available' : 'Unavailable'}
              </Badge>
            </div>

            <p className="text-sm text-neutral-400 mb-4">
              {vendor?.categories?.map((c) => c.name).join(', ') || 'Service Provider'}
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <StarRating rating={vendor?.averageRating || 0} size="sm" />
                <span className="text-sm font-medium text-neutral-600">
                  {(vendor?.averageRating || 0).toFixed(1)}
                </span>
                <span className="text-sm text-neutral-300">
                  ({vendor?.totalReviews || 0} reviews)
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <span className="flex items-center gap-1">
                  <HiBuildingStorefront className="h-4 w-4" />
                  {vendor?.totalListings || 0} Listings
                </span>
                <span className="flex items-center gap-1">
                  <HiCalendarDays className="h-4 w-4" />
                  {vendor?.totalBookings || 0} Bookings
                </span>
                {memberSince && (
                  <span className="flex items-center gap-1">
                    <HiClock className="h-4 w-4" />
                    Member since {formatDate(memberSince)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card padding="md">
          <h3 className="text-base font-semibold text-neutral-600 mb-4 flex items-center gap-2">
            <HiBuildingStorefront className="h-5 w-5 text-primary-500" />
            Business Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Business Name"
              placeholder="Your business name"
              value={formData.businessName}
              onChange={(e) => updateField('businessName', e.target.value)}
            />
            <TextArea
              label="Description"
              placeholder="Tell clients about your business and services..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              maxCharacters={1000}
              rows={4}
            />
            <Select
              label="Primary Category"
              placeholder="Select a category"
              options={CATEGORIES_LIST}
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
            />
          </div>
        </Card>

        {/* Contact Information */}
        <Card padding="md">
          <h3 className="text-base font-semibold text-neutral-600 mb-4 flex items-center gap-2">
            <HiPhone className="h-5 w-5 text-primary-500" />
            Contact Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+92 300 1234567"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              leftIcon={<HiPhone className="h-4 w-4" />}
            />
            <Input
              label="Email"
              type="email"
              placeholder="business@example.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              leftIcon={<HiEnvelope className="h-4 w-4" />}
            />
            <Input
              label="Website"
              type="url"
              placeholder="https://www.yourbusiness.com"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              leftIcon={<HiGlobeAlt className="h-4 w-4" />}
            />
          </div>
        </Card>

        {/* Address */}
        <Card padding="md">
          <h3 className="text-base font-semibold text-neutral-600 mb-4 flex items-center gap-2">
            <HiMapPin className="h-5 w-5 text-primary-500" />
            Address
          </h3>
          <div className="space-y-4">
            <Select
              label="City"
              placeholder="Select a city"
              options={CITIES}
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
            />
            <Input
              label="Area / Neighborhood"
              placeholder="e.g. Gulberg, DHA Phase 5"
              value={formData.area}
              onChange={(e) => updateField('area', e.target.value)}
            />
            <TextArea
              label="Full Address"
              placeholder="Complete street address..."
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              rows={2}
            />
          </div>
        </Card>

        {/* Social Links */}
        <Card padding="md">
          <h3 className="text-base font-semibold text-neutral-600 mb-4 flex items-center gap-2">
            <HiLink className="h-5 w-5 text-primary-500" />
            Social Links
          </h3>
          <div className="space-y-4">
            <Input
              label="Facebook"
              placeholder="https://facebook.com/yourbusiness"
              value={formData.socialLinks.facebook}
              onChange={(e) => updateSocialLink('facebook', e.target.value)}
            />
            <Input
              label="Instagram"
              placeholder="https://instagram.com/yourbusiness"
              value={formData.socialLinks.instagram}
              onChange={(e) => updateSocialLink('instagram', e.target.value)}
            />
            <Input
              label="Twitter"
              placeholder="https://twitter.com/yourbusiness"
              value={formData.socialLinks.twitter}
              onChange={(e) => updateSocialLink('twitter', e.target.value)}
            />
            <Input
              label="LinkedIn"
              placeholder="https://linkedin.com/company/yourbusiness"
              value={formData.socialLinks.linkedin}
              onChange={(e) => updateSocialLink('linkedin', e.target.value)}
            />
          </div>
        </Card>
      </div>

      {/* Operating Hours */}
      <Card padding="md">
        <h3 className="text-base font-semibold text-neutral-600 mb-4 flex items-center gap-2">
          <HiClock className="h-5 w-5 text-primary-500" />
          Operating Hours
        </h3>
        <div className="space-y-3">
          {DAYS.map((day) => {
            const hours = formData.operatingHours[day];
            return (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center gap-3 py-2 border-b border-neutral-50 last:border-0"
              >
                <div className="w-28 shrink-0">
                  <span className="text-sm font-medium text-neutral-600">{day}</span>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      onChange={(e) => updateOperatingHours(day, 'closed', !e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                    />
                    <span className="text-sm text-neutral-400">
                      {hours.closed ? 'Closed' : 'Open'}
                    </span>
                  </label>
                  {!hours.closed && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateOperatingHours(day, 'open', e.target.value)}
                        className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-300">to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateOperatingHours(day, 'close', e.target.value)}
                        className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={fetchProfile}>
          Discard Changes
        </Button>
        <Button
          variant="primary"
          leftIcon={<HiPencilSquare className="h-5 w-5" />}
          onClick={handleSave}
          loading={saving}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProviderProfilePage;
