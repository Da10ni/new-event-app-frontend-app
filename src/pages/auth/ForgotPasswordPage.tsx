import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api/authApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { HiEnvelope, HiArrowLeft, HiCheckCircle } from 'react-icons/hi2';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to send reset link. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-green-50">
            <HiCheckCircle className="h-10 w-10 text-success" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-neutral-600 mb-2">Check your email</h1>
        <p className="text-sm text-neutral-400 mb-6">
          We sent a password reset link to{' '}
          <span className="font-medium text-neutral-500">{email}</span>
        </p>
        <p className="text-sm text-neutral-400 mb-8">
          Didn&apos;t receive the email?{' '}
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
          >
            Click to resend
          </button>
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-600 transition-colors"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to Log In
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-600">Forgot password?</h1>
        <p className="text-sm text-neutral-400 mt-2">
          No worries, we&apos;ll send you reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError('');
          }}
          error={emailError}
          leftIcon={<HiEnvelope className="h-5 w-5" />}
          autoComplete="email"
        />

        <Button type="submit" variant="primary" fullWidth loading={loading}>
          Send Reset Link
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

export default ForgotPasswordPage;
