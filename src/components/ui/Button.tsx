import React from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface ButtonAsButton extends ButtonBaseProps {
  as?: 'button';
  href?: never;
  to?: never;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

interface ButtonAsLink extends ButtonBaseProps {
  as: 'link';
  to: string;
  href?: never;
  type?: never;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface ButtonAsAnchor extends ButtonBaseProps {
  as: 'anchor';
  href: string;
  to?: never;
  type?: never;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500/30',
  secondary:
    'bg-secondary-500 text-white hover:bg-secondary-700 active:bg-secondary-700 focus:ring-secondary-500/30',
  outline:
    'border-2 border-neutral-600 text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 focus:ring-neutral-400/30',
  ghost:
    'text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 focus:ring-neutral-400/30',
  danger:
    'bg-error text-white hover:bg-red-700 active:bg-red-800 focus:ring-error/30',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-base gap-2',
  lg: 'px-7 py-3.5 text-lg gap-2.5',
};

const Spinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const spinnerSize = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <svg
      className={`animate-spin ${spinnerSize}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
};

const Button: React.FC<ButtonProps> = (props) => {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
  } = props;

  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim();

  const content = (
    <>
      {loading && <Spinner size={size} />}
      {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </>
  );

  if (props.as === 'link') {
    return (
      <Link
        to={props.to}
        className={`${combinedClasses} ${disabled || loading ? 'pointer-events-none opacity-50' : ''}`}
        onClick={props.onClick}
      >
        {content}
      </Link>
    );
  }

  if (props.as === 'anchor') {
    return (
      <a
        href={props.href}
        className={`${combinedClasses} ${disabled || loading ? 'pointer-events-none opacity-50' : ''}`}
        target={props.target}
        rel={props.rel}
        onClick={props.onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={props.type || 'button'}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={props.onClick}
    >
      {content}
    </button>
  );
};

export default Button;
