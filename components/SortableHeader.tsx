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
  const ariaSort = isSorted ? (direction === 'asc' ? 'ascending' : 'descending') : 'none';

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableCellElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSort(sortKey);
    }
  };

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      tabIndex={0}
      role="button"
      className={`px-6 py-3 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 group ${className}`.trim()}
      onClick={() => onSort(sortKey)}
      onKeyDown={handleKeyDown}
    >
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
