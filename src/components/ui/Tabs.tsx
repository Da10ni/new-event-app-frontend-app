import React, { useState } from 'react';

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeKey?: string;
  onChange?: (key: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeKey, onChange, className = '' }) => {
  const [internalKey, setInternalKey] = useState(tabs[0]?.key || '');
  const currentKey = activeKey ?? internalKey;

  const handleTabClick = (key: string) => {
    if (onChange) {
      onChange(key);
    } else {
      setInternalKey(key);
    }
  };

  const activeTab = tabs.find((t) => t.key === currentKey);

  return (
    <div className={className}>
      {/* Tab list */}
      <div className="flex border-b border-neutral-100 overflow-x-auto" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.key === currentKey;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.key)}
              className={`
                relative flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors
                ${isActive ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}
                ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      <div role="tabpanel" className="pt-4">
        {activeTab?.content}
      </div>
    </div>
  );
};

export default Tabs;
