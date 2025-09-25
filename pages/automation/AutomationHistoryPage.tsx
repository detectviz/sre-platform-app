import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MOCK_PLAYBOOKS } from '../../constants';
import { AutomationExecution } from '../../types';
import Icon from '../../components/Icon';
import Toolbar from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import Pagination from '../../components/Pagination';
import Drawer from '../../components/Drawer';
import ExecutionLogDetail from '../../components/ExecutionLogDetail';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';

const AutomationHistoryPage: React.FC = () => {
    const [executions, setExecutions] = useState<AutomationExecution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedExecution, setSelectedExecution] = useState<AutomationExecution | null>(null);
    
    // Filters state
    const [filters, setFilters] = useState<{ playbookId: string; status: string; startDate: string; endDate: string }>({ playbookId: '', status: '', startDate: '', endDate: '' });

    const fetchExecutions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
            };
            const { data } = await api.get<{ items: AutomationExecution[], total: number }>('/automation/executions', { params });
            setExecutions(data.items);
            setTotal(data.total);
        } catch (err) {
            setError('無法獲取運行歷史。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters]);

    useEffect(() => {
        fetchExecutions();
    }, [fetchExecutions]);

    const getStatusPill = (status: AutomationExecution['status']) => {
        switch (status) {
            case 'success': return 'bg-green-500/20 text-green-400';
            case 'failed': return 'bg-red-500/20 text-red-400';
            case 'running': return 'bg-sky-500/20 text-sky-400 animate-pulse';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400';
        }
    };
    
    const handleRetry = async (executionId: string) => {
        try {
            await api.post(`/automation/executions/${executionId}/retry`);
            fetchExecutions();
        } catch (err) {
            alert('Failed to retry execution.');
        }
    };

    const leftActions = (
        <div className="flex items-center space-x-2">
            <select value={filters.playbookId} onChange={e => setFilters({ ...filters, playbookId: e.target.value })} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm">
                <option value="">所有腳本</option>
                {MOCK_PLAYBOOKS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm">
                <option value="">所有狀態</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="running">Running</option>
                <option value="pending">Pending</option>
            </select>
            <input type="datetime-local" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm" />
            <span className="text-slate-400">to</span>
            <input type="datetime-local" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm" />
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar leftActions={leftActions} />
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3">腳本名稱</th>
                                <th scope="col" className="px-6 py-3">狀態</th>
                                <th scope="col" className="px-6 py-3">觸發來源</th>
                                <th scope="col" className="px-6 py-3">開始時間</th>
                                <th scope="col" className="px-6 py-3">耗時</th>
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={6} />
                            ) : error ? (
                                <TableError colSpan={6} message={error} onRetry={fetchExecutions} />
                            ) : executions.map((exec) => (
                                <tr key={exec.id} className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer" onClick={() => setSelectedExecution(exec)}>
                                    <td className="px-6 py-4 font-medium text-white">{exec.scriptName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusPill(exec.status)}`}>
                                            {exec.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{exec.triggeredBy}</td>
                                    <td className="px-6 py-4">{exec.startTime}</td>
                                    <td className="px-6 py-4">{exec.durationMs ? `${(exec.durationMs / 1000).toFixed(2)}s` : 'N/A'}</td>
                                    <td className="px-6 py-4 text-center">
                                        {exec.status === 'failed' && (
                                            <button onClick={(e) => { e.stopPropagation(); handleRetry(exec.id); }} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="重試">
                                                <Icon name="refresh-cw" className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination 
                    total={total}
                    page={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                 />
            </TableContainer>

            <Drawer
                isOpen={!!selectedExecution}
                onClose={() => setSelectedExecution(null)}
                title={`執行日誌: ${selectedExecution?.scriptName} (${selectedExecution?.id})`}
                width="w-3/5"
            >
                {selectedExecution && <ExecutionLogDetail execution={selectedExecution} />}
            </Drawer>
        </div>
    );
};

export default AutomationHistoryPage;