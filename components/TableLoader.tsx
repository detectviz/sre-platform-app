import React from 'react';
import Icon from './Icon';

interface TableLoaderProps {
    colSpan: number;
    message?: string;
}

const TableLoader: React.FC<TableLoaderProps> = ({ colSpan, message = "載入中..." }) => {
    return (
        <tr>
            <td colSpan={colSpan} className="text-center py-20 text-slate-400">
                <div className="flex flex-col items-center justify-center">
                    <Icon name="loader-circle" className="w-8 h-8 animate-spin mb-2" />
                    <p>{message}</p>
                </div>
            </td>
        </tr>
    );
};

export default TableLoader;
