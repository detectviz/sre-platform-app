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

    const composedClassName = ['app-table__header-cell', 'app-table__header-button', className]
        .filter(Boolean)
        .join(' ');

    return (
        <th
            scope="col"
            aria-sort={ariaSort}
            tabIndex={0}
            role="button"
            className={composedClassName}
            onClick={() => onSort(sortKey)}
            onKeyDown={handleKeyDown}
        >
            <div className="flex items-center gap-1.5">
                {label}
                <Icon
                    name={isSorted ? (direction === 'asc' ? 'arrow-up' : 'arrow-down') : 'chevrons-up-down'}
                    className="app-table__sort-icon"
                />
            </div>
        </th>
    );
};

export default SortableHeader;
