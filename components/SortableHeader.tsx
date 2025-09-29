import React from 'react';
import Icon from './Icon';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ label, sortKey, sortConfig, onSort, className = '' }) => {
  const isSorted = sortConfig?.key === sortKey;
  const direction = isSorted ? sortConfig.direction : null;

  return (
    <th scope="col" className={`px-6 py-3 cursor-pointer select-none group ${className}`} onClick={() => onSort(sortKey)}>
      <div className="flex items-center">
        {label}
        {isSorted ? (
          <Icon name={direction === 'asc' ? 'arrow-up' : 'arrow-down'} className="w-4 h-4 ml-1.5" />
        ) : (
          <Icon name="chevrons-up-down" className="w-4 h-4 ml-1.5 text-slate-600 group-hover:text-slate-400" />
        )}
      </div>
    </th>
  );
};

export default SortableHeader;
