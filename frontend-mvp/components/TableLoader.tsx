import React from 'react';
import Icon from './Icon';
import { useContentSection } from '../contexts/ContentContext';

interface TableLoaderProps {
    colSpan: number;
    message?: string;
}

const TableLoader: React.FC<TableLoaderProps> = ({ colSpan, message }) => {
    const globalContent = useContentSection('GLOBAL');
    const displayMessage = message ?? globalContent?.LOADING ?? 'Loading...';

    return (
        <tr className="app-table__state-row">
            <td colSpan={colSpan} className="app-table__cell app-table__cell--center">
                <div className="app-table__state">
                    <Icon name="loader-circle" className="app-table__state-icon animate-spin" />
                    <p className="app-table__state-description">{displayMessage}</p>
                </div>
            </td>
        </tr>
    );
};

export default TableLoader;
