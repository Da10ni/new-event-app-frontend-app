import React from 'react';

type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const baseClasses = 'bg-neutral-100 animate-pulse';

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return `${baseClasses} rounded-md h-4 w-full`;
      case 'circle':
        return `${baseClasses} rounded-full h-10 w-10`;
      case 'rect':
        return `${baseClasses} rounded-xl h-32 w-full`;
      case 'card':
        return `${baseClasses} rounded-2xl h-64 w-full`;
      default:
        return baseClasses;
    }
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={`${getVariantClasses()} ${className}`} style={style} />
        ))}
      </div>
    );
  }

  return <div className={`${getVariantClasses()} ${className}`} style={style} />;
};

export default Skeleton;
