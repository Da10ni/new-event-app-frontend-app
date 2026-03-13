import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { authApi } from '../../services/api/authApi';
import { setTokens } from '../../services/api/axiosInstance';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { HiArrowLeft } from 'react-icons/hi2';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const OtpVerificationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const email = (location.state as { email?: string })?.email || '';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/auth/register');
    }
  }, [email, navigate]);

  // Resend timer
  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last filled or the next empty
    const lastFilledIndex = Math.min(pastedData.length, OTP_LENGTH) - 1;
    focusInput(lastFilledIndex);
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      toast.error('Please enter the complete verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyEmail({ email, otp: otpString });
      const data = response.data.data;

      if (data && data.user && data.accessToken) {
        setTokens(data.accessToken, data.refreshToken);
        dispatch(
          setCredentials({
            user: data.user,
            vendor: data.vendor,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          })
        );
      }

      toast.success('Email verified successfully!');
      navigate(data.user.role === 'vendor' ? '/provider/dashboard' : '/');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid verification code. Please try again.';
      toast.error(message);
      setOtp(Array(OTP_LENGTH).fill(''));
      focusInput(0);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await authApi.forgotPassword(email);
      toast.success('Verification code resent!');
      setResendTimer(RESEND_COOLDOWN);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      focusInput(0);
    } catch {
      toast.error('Failed to resend code. Please try again.');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!email) return null;

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-600">Verify your email</h1>
        <p className="text-sm text-neutral-400 mt-2">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-neutral-500">{email}</span>
        </p>
      </div>

      {/* OTP Input boxes */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {Array.from({ length: OTP_LENGTH }, (_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={`
              w-12 h-14 text-center text-xl font-semibold rounded-xl border-2
              transition-all duration-200 outline-none
              ${
                otp[i]
                  ? 'border-primary-500 bg-primary-50/30'
                  : 'border-neutral-200 hover:border-neutral-300'
              }
              focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20
            `}
            autoFocus={i === 0}
          />
        ))}
      </div>

      <Button
        variant="primary"
        fullWidth
        loading={loading}
        onClick={handleVerify}
        disabled={otp.some((d) => !d)}
      >
        Verify
      </Button>

      {/* Resend */}
      <div className="text-center mt-6">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
          >
            Resend verification code
          </button>
        ) : (
          <p className="text-sm text-neutral-400">
            Resend code in{' '}
            <span className="font-medium text-neutral-500">{formatTime(resendTimer)}</span>
          </p>
        )}
      </div>

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

export default OtpVerificationPage;
