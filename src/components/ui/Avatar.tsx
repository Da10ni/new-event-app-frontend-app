import React, { useState } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  showStatus?: boolean;
  isOnline?: boolean;
  bordered?: boolean;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

const statusSizeClasses: Record<AvatarSize, string> = {
  xs: 'h-1.5 w-1.5 border',
  sm: 'h-2 w-2 border',
  md: 'h-2.5 w-2.5 border-2',
  lg: 'h-3.5 w-3.5 border-2',
  xl: 'h-4 w-4 border-2',
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  showStatus = false,
  isOnline = false,
  bordered = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full overflow-hidden flex items-center justify-center font-semibold
          ${bordered ? 'ring-2 ring-white shadow-md' : ''}
          ${showImage ? '' : 'bg-primary-100 text-primary-600'}
        `}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{name ? getInitials(name) : '?'}</span>
        )}
      </div>
      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full border-white
            ${statusSizeClasses[size]}
            ${isOnline ? 'bg-success' : 'bg-neutral-300'}
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
