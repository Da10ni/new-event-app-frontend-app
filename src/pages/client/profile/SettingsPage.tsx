import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBell, HiOutlineLockClosed, HiOutlineShieldCheck, HiOutlineTrash,
  HiOutlineUserCircle, HiChevronLeft, HiOutlineEye, HiOutlineEnvelope,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { clearAuth } from '../../../store/slices/authSlice';
import { authApi } from '../../../services/api/authApi';
import { userApi } from '../../../services/api/userApi';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [messageAlerts, setMessageAlerts] = useState(true);

  // Privacy
  const [profilePublic, setProfilePublic] = useState(true);
  const [showReviews, setShowReviews] = useState(true);

  // Delete account
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) errors.newPassword = 'New password is required';
    if (newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userApi.deleteAccount();
      dispatch(clearAuth());
      toast.success('Account deleted successfully');
      navigate('/');
    } catch {
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (val: boolean) => void }> = ({
    enabled,
    onChange,
  }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary-500' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-neutral-200 transition-colors"
          >
            <HiChevronLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <h1 className="text-2xl font-bold text-neutral-700">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <HiOutlineUserCircle className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-700">Account</h2>
                <p className="text-sm text-neutral-400">Manage your account information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-50">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Email</p>
                  <p className="text-sm text-neutral-400">{user?.email}</p>
                </div>
                {user?.isEmailVerified && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Profile</p>
                  <p className="text-sm text-neutral-400">Update your personal information</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/profile/edit')}>
                  Edit
                </Button>
              </div>
            </div>
          </Card>

          {/* Notification Preferences */}
          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <HiOutlineBell className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-700">Notifications</h2>
                <p className="text-sm text-neutral-400">Choose what updates you receive</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-50">
                <div className="flex items-center gap-3">
                  <HiOutlineEnvelope className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Email notifications</p>
                    <p className="text-xs text-neutral-400">General email notifications</p>
                  </div>
                </div>
                <ToggleSwitch enabled={emailNotifications} onChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-neutral-50">
                <div className="flex items-center gap-3">
                  <HiOutlineBell className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Booking updates</p>
                    <p className="text-xs text-neutral-400">Status changes and reminders</p>
                  </div>
                </div>
                <ToggleSwitch enabled={bookingUpdates} onChange={setBookingUpdates} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-neutral-50">
                <div className="flex items-center gap-3">
                  <HiOutlineEnvelope className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Promotional emails</p>
                    <p className="text-xs text-neutral-400">Deals, offers, and recommendations</p>
                  </div>
                </div>
                <ToggleSwitch enabled={promotionalEmails} onChange={setPromotionalEmails} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <HiOutlineBell className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Message alerts</p>
                    <p className="text-xs text-neutral-400">Notifications for new messages</p>
                  </div>
                </div>
                <ToggleSwitch enabled={messageAlerts} onChange={setMessageAlerts} />
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <HiOutlineShieldCheck className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-700">Privacy</h2>
                <p className="text-sm text-neutral-400">Control your privacy preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-50">
                <div className="flex items-center gap-3">
                  <HiOutlineEye className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Public profile</p>
                    <p className="text-xs text-neutral-400">Allow others to see your profile</p>
                  </div>
                </div>
                <ToggleSwitch enabled={profilePublic} onChange={setProfilePublic} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <HiOutlineEye className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Show my reviews</p>
                    <p className="text-xs text-neutral-400">Display your reviews publicly</p>
                  </div>
                </div>
                <ToggleSwitch enabled={showReviews} onChange={setShowReviews} />
              </div>
            </div>
          </Card>

          {/* Change Password */}
          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <HiOutlineLockClosed className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-700">Change Password</h2>
                <p className="text-sm text-neutral-400">Update your account password</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={passwordErrors.currentPassword}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={passwordErrors.newPassword}
                placeholder="Enter new password"
                helperText="Minimum 8 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={passwordErrors.confirmPassword}
                placeholder="Confirm new password"
              />
              <div className="pt-2">
                <Button variant="primary" type="submit" loading={changingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Delete Account */}
          <Card padding="md" className="border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <HiOutlineTrash className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-semibold text-red-600">Danger Zone</h2>
                <p className="text-sm text-neutral-400">Irreversible actions</p>
              </div>
            </div>

            <p className="text-sm text-neutral-500 mb-4">
              Once you delete your account, there is no going back. All your data including
              bookings, reviews, and messages will be permanently removed.
            </p>

            <Button
              variant="danger"
              leftIcon={<HiOutlineTrash className="h-4 w-4" />}
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost."
        confirmLabel="Delete Account"
        cancelLabel="Keep Account"
        destructive
        loading={deleting}
      />
    </div>
  );
};

export default SettingsPage;
