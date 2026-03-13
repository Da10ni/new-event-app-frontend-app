import React from 'react';
import Chip from '../ui/Chip';

interface FilterChip {
  key: string;
  label: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onRemove,
  onClearAll,
  className = '',
}) => {
  if (filters.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {filters.map((filter) => (
        <Chip
          key={filter.key}
          label={filter.label}
          variant="outlined"
          removable
          onRemove={() => onRemove(filter.key)}
        />
      ))}
      {onClearAll && filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-600 underline underline-offset-2 ml-1 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default FilterChips;
