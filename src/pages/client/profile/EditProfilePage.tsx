import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCamera, HiChevronLeft } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setUser } from '../../../store/slices/authSlice';
import { uploadApi } from '../../../services/api/uploadApi';
import { userApi } from '../../../services/api/userApi';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [country, setCountry] = useState(user?.address?.country || '');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (phone && !/^\+?[\d\s-]{10,15}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      // Upload avatar first if changed
      let avatarData = undefined;
      if (avatarFile) {
        const uploadRes = await uploadApi.uploadImage(avatarFile, 'avatars');
        avatarData = uploadRes.data.data;
      }

      // Update profile
      const updateData: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        address: {
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          country: country.trim() || undefined,
          zipCode: zipCode.trim() || undefined,
        },
      };

      if (avatarData) {
        updateData.avatar = avatarData;
      }

      const res = await userApi.updateProfile(updateData);
      dispatch(setUser(res.data.data.user || res.data.data));
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-neutral-200 transition-colors"
          >
            <HiChevronLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <h1 className="text-2xl font-bold text-neutral-700">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 sm:p-8 space-y-8">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar
                  src={avatarPreview || user.avatar?.url}
                  name={user.fullName}
                  size="xl"
                  bordered
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full shadow-md hover:bg-primary-600 transition-colors"
                >
                  <HiOutlineCamera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-neutral-400 mt-3">Click the camera icon to change your photo</p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={errors.firstName}
                placeholder="John"
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={errors.lastName}
                placeholder="Doe"
              />
            </div>

            {/* Email (read-only) */}
            <Input
              label="Email Address"
              value={user.email}
              disabled
              helperText="Email cannot be changed"
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              placeholder="+92 300 1234567"
            />

            {/* Address */}
            <div>
              <h3 className="text-sm font-medium text-neutral-600 mb-3">Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Karachi"
                />
                <Input
                  label="State / Province"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Sindh"
                />
                <Input
                  label="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Pakistan"
                />
                <Input
                  label="Zip Code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="75500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4 border-t border-neutral-100">
              <Button
                variant="ghost"
                onClick={() => navigate('/profile')}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={saving}
                className="w-full sm:w-auto sm:ml-auto"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
