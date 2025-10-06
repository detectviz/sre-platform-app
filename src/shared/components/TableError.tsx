import React from 'react';
import Icon from './Icon';
import { useContentSection } from '@/contexts/ContentContext';

interface TableErrorProps {
    colSpan: number;
    message: string;
    onRetry?: () => void;
}

const TableError: React.FC<TableErrorProps> = ({ colSpan, message, onRetry }) => {
    const globalContent = useContentSection('GLOBAL');
    const retryLabel = globalContent?.RETRY ?? 'Retry';
    const retryHint = globalContent?.TABLE_ERROR_HINT ?? '請稍後再試，或聯絡支援團隊。';

    return (
        <tr className="app-table__state-row">
            <td colSpan={colSpan} className="app-table__cell app-table__cell--center">
                <div className="app-table__state">
                    <Icon name="alert-circle" className="app-table__state-icon app-table__state-icon--error" />
                    <p className="app-table__state-title">{message}</p>
                    <p className="app-table__state-description">{retryHint}</p>
                    {onRetry && (
                        <div className="app-table__state-actions">
                            <button onClick={onRetry} className="app-btn app-btn--primary">
                                <Icon name="refresh-cw" className="w-4 h-4" />
                                {retryLabel}
                            </button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default TableError;
