import { useState, useEffect } from 'react';
import api from '../services/api';
import { AllOptions } from '../types';

/**
 * Hook to fetch log-related options from the API
 * Returns time range options for log analysis features
 *
 * Features:
 * - Auto-fetches on mount
 * - Fully depends on API response
 * - Caches results in component state
 *
 * @returns timeRangeOptions - Array of time range options for log filtering
 */
export const useLogOptions = () => {
    const [timeRangeOptions, setTimeRangeOptions] = useState<{ value: string; label: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setIsLoading(true);
                const { data } = await api.get<AllOptions>('/api/v1/ui/options');

                // Use API data only
                if (data?.logs?.time_range_options && data.logs.time_range_options.length > 0) {
                    setTimeRangeOptions(data.logs.time_range_options);
                } else {
                    // API returned empty array
                    setTimeRangeOptions([]);
                }
                setError(null);
            } catch (err) {
                console.error('Failed to fetch log options:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setTimeRangeOptions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, []); // Only fetch once on mount

    return {
        timeRangeOptions,
        isLoading,
        error,
    };
};
