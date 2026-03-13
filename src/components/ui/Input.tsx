import React, { useState, forwardRef } from 'react';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = 'text',
      disabled = false,
      containerClassName = '',
      className = '',
      id,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).slice(2)}`;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-600 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className={`
              w-full rounded-xl border bg-white px-4 py-3 text-neutral-600 placeholder-neutral-300
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              disabled:bg-neutral-50 disabled:text-neutral-300 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-11' : ''}
              ${isPassword || rightIcon ? 'pr-11' : ''}
              ${error ? 'border-error focus:ring-error focus:border-error' : 'border-neutral-200 hover:border-neutral-300'}
              ${className}
            `}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
            >
              {showPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
            </button>
          )}
          {!isPassword && rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {!error && helperText && <p className="mt-1.5 text-sm text-neutral-300">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
