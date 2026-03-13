import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setLoading } from '../../store/slices/authSlice';
import { authApi } from '../../services/api/authApi';
import { categoryApi } from '../../services/api/categoryApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { HiUser, HiEnvelope, HiPhone, HiLockClosed, HiBuildingStorefront, HiMapPin, HiArrowLeft, HiArrowRight } from 'react-icons/hi2';
import type { Category } from '../../types';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  description: string;
  categories: string[];
  city: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  businessName?: string;
  categories?: string;
  city?: string;
  agreeToTerms?: string;
}

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];

const VendorRegisterPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    businessName: '', description: '', categories: [], city: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLocalLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    categoryApi.getAll().then((res) => {
      setAvailableCategories(res.data.data.categories || []);
    }).catch(() => {});
  }, []);

  const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleCategory = (catId: string) => {
    const current = form.categories;
    if (current.includes(catId)) {
      updateField('categories', current.filter((id) => id !== catId));
    } else {
      updateField('categories', [...current, catId]);
    }
  };

  const validateStep1 = (): boolean => {
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (form.categories.length === 0) newErrors.categories = 'Select at least one category';
    if (!form.city) newErrors.city = 'City is required';
    if (!form.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLocalLoading(true);
    dispatch(setLoading(true));

    try {
      await authApi.registerVendor({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        businessName: form.businessName,
        description: form.description || undefined,
        categories: form.categories,
        address: { city: form.city, country: 'Pakistan' },
      });

      toast.success('Vendor account created! Please verify your email.');
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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-600">Become a Provider</h1>
        <p className="text-sm text-neutral-400 mt-2">
          {step === 1 ? 'Start by creating your personal account' : 'Tell us about your business'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step >= s ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-400'
            }`}>
              {s}
            </div>
            <span className={`text-xs font-medium ${step >= s ? 'text-neutral-600' : 'text-neutral-300'}`}>
              {s === 1 ? 'Personal' : 'Business'}
            </span>
            {s === 1 && <div className={`flex-1 h-0.5 rounded ${step >= 2 ? 'bg-primary-500' : 'bg-neutral-100'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                value={form.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                error={errors.firstName}
                leftIcon={<HiUser className="h-5 w-5" />}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                error={errors.lastName}
                leftIcon={<HiUser className="h-5 w-5" />}
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
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+92 300 1234567"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              error={errors.phone}
              leftIcon={<HiPhone className="h-5 w-5" />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              error={errors.password}
              leftIcon={<HiLockClosed className="h-5 w-5" />}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              leftIcon={<HiLockClosed className="h-5 w-5" />}
            />
            <Button
              type="button"
              variant="primary"
              fullWidth
              rightIcon={<HiArrowRight className="h-5 w-5" />}
              onClick={handleNext}
            >
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Input
              label="Business Name"
              placeholder="My Events Company"
              value={form.businessName}
              onChange={(e) => updateField('businessName', e.target.value)}
              error={errors.businessName}
              leftIcon={<HiBuildingStorefront className="h-5 w-5" />}
            />
            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-1.5">Description</label>
              <textarea
                placeholder="Tell clients about your services..."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-600 placeholder:text-neutral-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all resize-none"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-1.5">
                Service Categories <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableCategories.filter(c => c.isActive).map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => toggleCategory(cat._id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                      form.categories.includes(cat._id)
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              {errors.categories && <p className="mt-1 text-sm text-error">{errors.categories}</p>}
            </div>

            {/* City selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-1.5">
                City <span className="text-error">*</span>
              </label>
              <div className="relative">
                <HiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                <select
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 pl-10 pr-4 py-3 text-sm text-neutral-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all appearance-none bg-white"
                >
                  <option value="">Select your city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {errors.city && <p className="mt-1 text-sm text-error">{errors.city}</p>}
            </div>

            {/* Terms */}
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
                  <Link to="/terms" className="text-primary-500 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary-500 hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreeToTerms && <p className="mt-1 text-sm text-error">{errors.agreeToTerms}</p>}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                leftIcon={<HiArrowLeft className="h-5 w-5" />}
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Create Vendor Account
              </Button>
            </div>
          </>
        )}
      </form>

      <p className="text-center text-sm text-neutral-400 mt-6">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-medium text-primary-500 hover:text-primary-600 transition-colors">
          Log In
        </Link>
      </p>
      <p className="text-center text-sm text-neutral-400 mt-2">
        Want to sign up as a client?{' '}
        <Link to="/auth/register" className="font-medium text-primary-500 hover:text-primary-600 transition-colors">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default VendorRegisterPage;
