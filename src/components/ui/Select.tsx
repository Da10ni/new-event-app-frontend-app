import React, { forwardRef } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      icon,
      disabled = false,
      containerClassName = '',
      className = '',
      id,
      ...rest
    },
    ref
  ) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).slice(2)}`;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-neutral-600 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300 pointer-events-none z-10">
              {icon}
            </span>
          )}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`
              w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-neutral-600
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              disabled:bg-neutral-50 disabled:text-neutral-300 disabled:cursor-not-allowed
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-error focus:ring-error focus:border-error' : 'border-neutral-200 hover:border-neutral-300'}
              ${className}
            `}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <HiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300 pointer-events-none" />
        </div>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {!error && helperText && <p className="mt-1.5 text-sm text-neutral-300">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
