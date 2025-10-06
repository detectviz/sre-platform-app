import { useCallback, useMemo, useState } from 'react';

export type TableSortDirection = 'asc' | 'desc';

export interface TableSortConfig {
    key: string;
    direction: TableSortDirection;
}

export interface UseTableSortingOptions {
    defaultSortKey?: string;
    defaultSortDirection?: TableSortDirection;
}

interface UseTableSortingResult {
    sortConfig: TableSortConfig | null;
    sortParams: Record<string, string>;
    handleSort: (key: string) => void;
    clearSort: () => void;
}

export const useTableSorting = (options?: UseTableSortingOptions): UseTableSortingResult => {
    const { defaultSortDirection = 'asc', defaultSortKey } = options || {};

    const [sortConfig, setSortConfig] = useState<TableSortConfig | null>(() => {
        if (!defaultSortKey) {
            return null;
        }
        return {
            key: defaultSortKey,
            direction: defaultSortDirection,
        };
    });

    const handleSort = useCallback((key: string) => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                const nextDirection: TableSortDirection = prev.direction === 'asc' ? 'desc' : 'asc';
                return { key, direction: nextDirection };
            }
            return { key, direction: 'asc' };
        });
    }, []);

    const clearSort = useCallback(() => setSortConfig(null), []);

    const sortParams = useMemo(() => {
        if (!sortConfig) {
            return {};
        }
        return {
            sort_by: sortConfig.key,
            sort_order: sortConfig.direction,
        };
    }, [sortConfig]);

    return {
        sortConfig,
        sortParams,
        handleSort,
        clearSort,
    };
};

export default useTableSorting;
