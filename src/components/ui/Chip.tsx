import React from 'react';
import { HiXMark } from 'react-icons/hi2';

type ChipVariant = 'filled' | 'outlined';

interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  variant?: ChipVariant;
  selected?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  variant = 'filled',
  selected = false,
  removable = false,
  onRemove,
  onClick,
  className = '',
}) => {
  const filledBase = selected
    ? 'bg-primary-500 text-white border-primary-500'
    : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100';

  const outlinedBase = selected
    ? 'bg-primary-50 text-primary-600 border-primary-500'
    : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400';

  const variantClass = variant === 'filled' ? filledBase : outlinedBase;

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border
        transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
        ${variantClass}
        ${className}
      `}
    >
      {icon && <span className="shrink-0 text-base">{icon}</span>}
      <span>{label}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="shrink-0 ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
        >
          <HiXMark className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  );
};

export default Chip;
