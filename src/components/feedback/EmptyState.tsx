import React from 'react';
import { HiInboxArrowDown } from 'react-icons/hi2';
import Button from '../ui/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="mb-4 text-neutral-200">
        {icon || <HiInboxArrowDown className="h-16 w-16 mx-auto" />}
      </div>
      <h3 className="text-lg font-semibold text-neutral-600 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-400 max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
