import React from 'react';
import SortableHeader from './SortableHeader';
import { TableColumn } from '@/shared/types';
import { TableSortConfig } from '../hooks/useTableSorting';

interface SortableColumnHeaderCellProps {
    column: TableColumn | undefined;
    columnKey: string;
    sortConfig: TableSortConfig | null;
    onSort: (key: string) => void;
    className?: string;
    fallbackLabel?: string;
}

const SortableColumnHeaderCell: React.FC<SortableColumnHeaderCellProps> = ({
    column,
    columnKey,
    sortConfig,
    onSort,
    className,
    fallbackLabel,
}) => {
    const label = column?.label ?? fallbackLabel ?? columnKey;
    const isSortable = column?.sortable !== false;
    const sortKey = column?.sort_key ?? column?.key ?? columnKey;

    const additionalClassName = className ?? '';

    if (!isSortable) {
        const cellClassName = ['app-table__header-cell', additionalClassName].filter(Boolean).join(' ');
        return (
            <th scope="col" className={cellClassName}>
                {label}
            </th>
        );
    }

    return (
        <SortableHeader
            label={label}
            sortKey={sortKey}
            sortConfig={sortConfig}
            onSort={onSort}
            className={additionalClassName}
        />
    );
};

export default SortableColumnHeaderCell;
