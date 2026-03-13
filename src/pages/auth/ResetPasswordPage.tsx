import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api/authApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { HiLockClosed, HiArrowLeft, HiCheckCircle } from 'react-icons/hi2';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!token || !emailParam) {
      toast.error('Invalid reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email: emailParam,
        otp: token,
        newPassword: password,
      });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to reset password. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-green-50">
            <HiCheckCircle className="h-10 w-10 text-success" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-neutral-600 mb-2">Password reset successful</h1>
        <p className="text-sm text-neutral-400 mb-6">
          Your password has been changed. You will be redirected to the login page shortly.
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          Go to Log In
        </Link>
      </div>
    );
  }

  if (!token || !emailParam) {
    return (
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-neutral-600 mb-2">Invalid reset link</h1>
        <p className="text-sm text-neutral-400 mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Button as="link" to="/auth/forgot-password" variant="primary">
          Request New Link
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-600">Set new password</h1>
        <p className="text-sm text-neutral-400 mt-2">
          Must be at least 8 characters
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          leftIcon={<HiLockClosed className="h-5 w-5" />}
          autoComplete="new-password"
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          leftIcon={<HiLockClosed className="h-5 w-5" />}
          autoComplete="new-password"
        />

        <Button type="submit" variant="primary" fullWidth loading={loading}>
          Reset Password
        </Button>
      </form>

      <div className="text-center mt-8">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-600 transition-colors"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to Log In
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
