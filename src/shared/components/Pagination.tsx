import React from 'react';
import Icon from './Icon';

interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ total, page, pageSize, onPageChange, onPageSizeChange }) => {
    const totalPages = Math.ceil(total / pageSize);
    const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);

    return (
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 text-sm text-slate-400 shrink-0">
            <div>第 {startItem}-{endItem} 項, 共 {total} 項</div>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => onPageChange(page - 1)}
                    className="p-1 rounded-md hover:bg-slate-700 disabled:opacity-50" 
                    disabled={page === 1}
                >
                    <Icon name="chevron-left" className="w-4 h-4"/>
                </button>
                <span className="w-8 h-8 rounded-md bg-slate-700 text-white flex items-center justify-center">{page}</span>
                <button 
                    onClick={() => onPageChange(page + 1)}
                    className="p-1 rounded-md hover:bg-slate-700 disabled:opacity-50" 
                    disabled={page >= totalPages}
                >
                    <Icon name="chevron-right" className="w-4 h-4"/>
                </button>
                <select 
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="bg-slate-700/50 border border-slate-600/80 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                    <option value={10}>10 / 頁</option>
                    <option value={20}>20 / 頁</option>
                    <option value={50}>50 / 頁</option>
                </select>
            </div>
        </div>
    );
};

export default Pagination;
