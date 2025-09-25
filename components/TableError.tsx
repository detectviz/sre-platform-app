import React from 'react';
import Icon from './Icon';

interface TableErrorProps {
    colSpan: number;
    message: string;
    onRetry?: () => void;
}

const TableError: React.FC<TableErrorProps> = ({ colSpan, message, onRetry }) => {
    return (
        <tr>
            <td colSpan={colSpan} className="text-center py-20 text-red-400">
                <div className="flex flex-col items-center justify-center">
                    <Icon name="alert-circle" className="w-10 h-10 mb-2" />
                    <p className="font-semibold">{message}</p>
                    <p className="text-sm text-slate-500">請稍後再試，或聯絡支援團隊。</p>
                    {onRetry && (
                        <button onClick={onRetry} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md flex items-center">
                            <Icon name="refresh-cw" className="w-4 h-4 mr-2" />
                            重試
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default TableError;
