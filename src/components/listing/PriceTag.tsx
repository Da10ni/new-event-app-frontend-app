import React from 'react';

interface PriceTagProps {
  price: number;
  currency?: string;
  unit?: string;
  startingFrom?: boolean;
  className?: string;
}

const formatPKR = (amount: number): string => {
  return amount.toLocaleString('en-PK');
};

const PriceTag: React.FC<PriceTagProps> = ({
  price,
  currency = 'PKR',
  unit,
  startingFrom = false,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-baseline gap-1 ${className}`}>
      {startingFrom && (
        <span className="text-xs text-neutral-400">Starting from</span>
      )}
      <span className="font-semibold text-neutral-600">
        {currency} {formatPKR(price)}
      </span>
      {unit && <span className="text-sm text-neutral-400">/ {unit}</span>}
    </div>
  );
};

export default PriceTag;
