import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AuditLog, User, AuditLogOptions } from '../../../types';
import Icon from '../../../components/Icon';
import TableContainer from '../../../components/TableContainer';
import Drawer from '../../../components/Drawer';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import api from '../../../services/api';
import Pagination from '../../../components/Pagination';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';
import PlaceholderModal from '../../../components/PlaceholderModal';
import { exportToCsv } from '../../../services/export';

const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalLogs, setTotalLogs] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [filters, setFilters] = useState<{ user: string; action: string; startDate: string; endDate: string }>({ user: '', action: '', startDate: '', endDate: '' });
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [options, setOptions] = useState<AuditLogOptions | null>(null);
    const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState('');

    const showPlaceholderModal = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };

    useEffect(() => {
        Promise.all([
            api.get<{ items: User[] }>('/iam/users', { params: { page: 1, page_size: 1000 } }),
            api.get<AuditLogOptions>('/iam/audit-logs/options')
        ]).then(([usersRes, optionsRes]) => {
            setUsers(usersRes.data.items);
            setOptions(optionsRes.data);
        }).catch(err => console.error("Failed to fetch users or audit log options", err));
    }, []);
    
    const fetchAuditLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters
            };
            const { data } = await api.get<{ items: AuditLog[], total: number }>('/iam/audit-logs', { params });
            setLogs(data.items);
            setTotalLogs(data.total);
        } catch (err) {
            setError('無法獲取審計日誌。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters]);

    useEffect(() => {
        fetchAuditLogs();
    }, [fetchAuditLogs]);
    
    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);
    
    const handleExport = () => {
        if (logs.length === 0) {
            alert("沒有可匯出的資料。");
            return;
        }
        exportToCsv({
            filename: `audit-logs-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'timestamp', 'user_name', 'action', 'target_type', 'target_name', 'result', 'ip'],
            data: logs.map(log => ({
                id: log.id,
                timestamp: log.timestamp,
                user_name: log.user.name,
                action: log.action,
                target_type: log.target.type,
                target_name: log.target.name,
                result: log.result,
                ip: log.ip,
            })),
        });
    };

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={
                    <div className="flex items-center space-x-2">
                        <select value={filters.user} onChange={e => setFilters({...filters, user: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm">
                            <option value="">所有使用者</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                        <select value={filters.action} onChange={e => setFilters({...filters, action: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm">
                            <option value="">所有操作</option>
                            {options?.actionTypes?.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <input type="datetime-local" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm" />
                        <span className="text-slate-400">to</span>
                        <input type="datetime-local" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm" />
                    </div>
                }
                rightActions={<ToolbarButton icon="download" text="匯出" onClick={handleExport} />}
            />

            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3">時間</th>
                                <th scope="col" className="px-6 py-3">使用者</th>
                                <th scope="col" className="px-6 py-3">操作</th>
                                <th scope="col" className="px-6 py-3">目標</th>
                                <th scope="col" className="px-6 py-3">結果</th>
                                <th scope="col" className="px-6 py-3">IP 位址</th>
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={7} />
                            ) : error ? (
                                <TableError colSpan={7} message={error} onRetry={fetchAuditLogs} />
                            ) : logs.map((log) => (
                                <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    <td className="px-6 py-4">{log.timestamp}</td>
                                    <td className="px-6 py-4">{log.user.name}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{log.action}</td>
                                    <td className="px-6 py-4">{log.target.type}: {log.target.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-semibold ${log.result === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                            {log.result.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{log.ip}</td>
                                    <td className="px-6 py-4 text-center">
                                         <button onClick={() => setSelectedLog(log)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="查看詳情"><Icon name="eye" className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <Pagination 
                    total={totalLogs}
                    page={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                 />
            </TableContainer>

            <Drawer
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title={`日誌詳情: ${selectedLog?.id}`}
                width="w-1/2"
            >
                {selectedLog && (
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
                        <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
                    </div>
                )}
            </Drawer>
            <PlaceholderModal
                isOpen={isPlaceholderModalOpen}
                onClose={() => setIsPlaceholderModalOpen(false)}
                featureName={modalFeatureName}
            />
        </div>
    );
};

export default AuditLogsPage;