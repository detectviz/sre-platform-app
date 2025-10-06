import { getContentString } from '@/assets/content';

import { showToast } from './toast';

interface CsvExportOptions {
    filename?: string;
    headers?: string[];
    data: Record<string, any>[];
}

const NO_DATA_TO_EXPORT_KEY = 'GLOBAL.NO_DATA_TO_EXPORT';
const GENERIC_BATCH_ACTION_ERROR_KEY = 'GLOBAL.MESSAGES.GENERIC_BATCH_ACTION_ERROR';
const GENERIC_ERROR_KEY = 'GLOBAL.MESSAGES.GENERIC_ERROR';

export const exportToCsv = ({ filename = 'export.csv', headers, data }: CsvExportOptions) => {
    if (!data || data.length === 0) {
        const message =
            getContentString(NO_DATA_TO_EXPORT_KEY) ??
            getContentString(GENERIC_BATCH_ACTION_ERROR_KEY) ??
            getContentString(GENERIC_ERROR_KEY) ??
            NO_DATA_TO_EXPORT_KEY;
        showToast(message, 'warning');
        return;
    }

    const columnHeaders = headers || Object.keys(data[0]);

    const csvContent = [
        columnHeaders.join(','),
        ...data.map(row =>
            columnHeaders.map(header => {
                const key = header as keyof typeof row;
                let cell = row[key] === null || row[key] === undefined ? '' : String(row[key]);
                // Escape commas, quotes, and newlines
                if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                    cell = `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            }).join(',')
        )
    ].join('\n');

    // BOM for UTF-8 handling in Excel
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); 
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};