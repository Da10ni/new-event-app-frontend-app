import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setLoading } from '../../store/slices/authSlice';
import { authApi } from '../../services/api/authApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { HiUser, HiEnvelope, HiPhone, HiLockClosed } from 'react-icons/hi2';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-error' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-warning' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-400' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-success' };
  return { score: 5, label: 'Very Strong', color: 'bg-success' };
};

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLocalLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    if (!form.password) return null;
    return getPasswordStrength(form.password);
  }, [form.password]);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{7,15}$/.test(form.phone)) {
      newErrors.phone = 'Enter a valid phone number';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLocalLoading(true);
    dispatch(setLoading(true));

    try {
      await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      toast.success('Account created! Please verify your email.');
      navigate('/auth/verify-otp', { state: { email: form.email } });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLocalLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-600">Create your account</h1>
        <p className="text-sm text-neutral-400 mt-2">Join EventsApp and discover amazing events</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            value={form.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            error={errors.firstName}
            leftIcon={<HiUser className="h-5 w-5" />}
            autoComplete="given-name"
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={form.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            error={errors.lastName}
            leftIcon={<HiUser className="h-5 w-5" />}
            autoComplete="family-name"
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
          leftIcon={<HiEnvelope className="h-5 w-5" />}
          autoComplete="email"
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+92 300 1234567"
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          error={errors.phone}
          leftIcon={<HiPhone className="h-5 w-5" />}
          autoComplete="tel"
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            error={errors.password}
            leftIcon={<HiLockClosed className="h-5 w-5" />}
            autoComplete="new-password"
          />
          {/* Password strength indicator */}
          {passwordStrength && (
            <div className="mt-2">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < passwordStrength.score ? passwordStrength.color : 'bg-neutral-100'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs mt-1 ${
                passwordStrength.score <= 2 ? 'text-error' : 'text-success'
              }`}>
                {passwordStrength.label}
              </p>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          leftIcon={<HiLockClosed className="h-5 w-5" />}
          autoComplete="new-password"
        />

        {/* Terms checkbox */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreeToTerms}
              onChange={(e) => updateField('agreeToTerms', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-400">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-500 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-500 hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="mt-1 text-sm text-error">{errors.agreeToTerms}</p>
          )}
        </div>

        <Button type="submit" variant="primary" fullWidth loading={loading}>
          Sign Up
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-400 mt-8">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-medium text-primary-500 hover:text-primary-600 transition-colors">
          Log In
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
