import React, { useState, useRef, useEffect, useCallback } from 'react';

type DropdownPosition = 'bottom-left' | 'bottom-right';

interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownDivider {
  key: string;
  type: 'divider';
}

type DropdownEntry = DropdownItem | DropdownDivider;

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownEntry[];
  position?: DropdownPosition;
  className?: string;
}

function isDivider(entry: DropdownEntry): entry is DropdownDivider {
  return 'type' in entry && entry.type === 'divider';
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  position = 'bottom-right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const positionClasses = position === 'bottom-left' ? 'left-0' : 'right-0';

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute ${positionClasses} mt-2 min-w-[200px] bg-white rounded-xl shadow-card border border-neutral-100
            py-1.5 z-50 animate-[fadeIn_0.15s_ease-out]
          `}
        >
          {items.map((entry) => {
            if (isDivider(entry)) {
              return <div key={entry.key} className="my-1.5 border-t border-neutral-100" />;
            }

            return (
              <button
                key={entry.key}
                disabled={entry.disabled}
                onClick={() => {
                  entry.onClick?.();
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors
                  ${entry.danger ? 'text-error hover:bg-red-50' : 'text-neutral-500 hover:bg-neutral-50'}
                  ${entry.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {entry.icon && <span className="shrink-0 text-lg">{entry.icon}</span>}
                <span>{entry.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
