
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// FIX: Import TableColumn from types.ts
import { Incident, IncidentAnalysis, MultiIncidentAnalysis, IncidentOptions, StyleDescriptor, User, TableColumn } from '../../types';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import Drawer from '../../components/Drawer';
import Pagination from '../../components/Pagination';
import IncidentDetailPage from './IncidentDetailPage';
import UnifiedSearchModal, { IncidentFilters } from '../../components/UnifiedSearchModal';
import IncidentAnalysisModal from '../../components/IncidentAnalysisModal';
import QuickSilenceModal from '../../components/QuickSilenceModal';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
// FIX: Import TableColumn from types.ts, not from ColumnSettingsModal
import ColumnSettingsModal from '../../components/ColumnSettingsModal';
import { showToast } from '../../services/toast';
import { exportToCsv } from '../../services/export';
import { usePageMetadata } from '../../contexts/PageMetadataContext';
import { useUser } from '../../contexts/UserContext';
import { useOptions } from '../../contexts/OptionsContext';
import AssignIncidentModal from '../../components/AssignIncidentModal';
import UserAvatar from '../../components/UserAvatar';
import ImportFromCsvModal from '../../components/ImportFromCsvModal';


const PAGE_IDENTIFIER = 'incidents';

const IncidentListPage: React.FC = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalIncidents, setTotalIncidents] = useState(0);
    const [users, setUsers] = useState<User[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState<IncidentFilters>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isQuickSilenceModalOpen, setIsQuickSilenceModalOpen] = useState(false);
    const [silencingIncident, setSilencingIncident] = useState<Incident | null>(null);
    const [analysisReport, setAnalysisReport] = useState<IncidentAnalysis | MultiIncidentAnalysis | string | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [assigningIncident, setAssigningIncident] = useState<Incident | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    const { options, isLoading: isLoadingOptions } = useOptions();
    const incidentOptions = options?.incidents;

    const { incidentId } = useParams<{ incidentId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useUser();

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.columnConfigKey;

    const fetchIncidents = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
            };
            const [incidentsRes, columnsRes, usersRes] = await Promise.all([
                api.get<{ items: Incident[], total: number }>('/incidents', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<{ items: User[] }>('/iam/users', { params: { page: 1, page_size: 1000 } })
            ]);
            
            setIncidents(incidentsRes.data.items);
            setTotalIncidents(incidentsRes.data.total);
            setVisibleColumns(columnsRes.data.length > 0 ? columnsRes.data : allColumns.map(c => c.key));
            setUsers(usersRes.data.items);
        } catch (err) {
            setError('無法獲取事故列表。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters, pageKey, allColumns]);

    useEffect(() => {
        // Load table columns configuration from API
        const loadTableColumns = async () => {
            try {
                const response = await fetch(`/api/v1/pages/columns/${PAGE_IDENTIFIER}`);
                if (response.ok) {
                    const columns = await response.json();
                    setAllColumns(columns);
                } else {
                    console.error('Failed to load table columns');
                    // Fallback to hardcoded values
                    setAllColumns([
                        { key: 'summary', label: '摘要' },
                        { key: 'status', label: '狀態' },
                        { key: 'severity', label: '嚴重程度' },
                        { key: 'priority', label: '優先級' },
                        { key: 'serviceImpact', label: '服務影響' },
                        { key: 'resource', label: '資源' },
                        { key: 'assignee', label: '處理人' },
                        { key: 'triggeredAt', label: '觸發時間' },
                    ]);
                }
            } catch (error) {
                console.error('Error loading table columns:', error);
                // Fallback to hardcoded values
                setAllColumns([
                    { key: 'summary', label: '摘要' },
                    { key: 'status', label: '狀態' },
                    { key: 'severity', label: '嚴重程度' },
                    { key: 'priority', label: '優先級' },
                    { key: 'serviceImpact', label: '服務影響' },
                    { key: 'resource', label: '資源' },
                    { key: 'assignee', label: '處理人' },
                    { key: 'triggeredAt', label: '觸發時間' },
                ]);
            }
        };

        loadTableColumns();
    }, []);

    useEffect(() => {
        if (pageKey) {
            fetchIncidents();
        }
    }, [fetchIncidents, pageKey]);
    
    useEffect(() => {
        setSelectedIds([]);
    }, [currentPage, pageSize, filters]);

    const userMap = useMemo(() => new Map(users.map(u => [u.name, u])), [users]);

    const handleSaveColumnConfig = async (newColumnKeys: string[]) => {
        if (!pageKey) {
            showToast('無法儲存欄位設定：頁面設定遺失。', 'error');
            return;
        }
        try {
            await api.put(`/settings/column-config/${pageKey}`, newColumnKeys);
            setVisibleColumns(newColumnKeys);
            showToast('欄位設定已儲存。', 'success');
        } catch (err) {
            showToast('無法儲存欄位設定。', 'error');
        } finally {
            setIsColumnSettingsModalOpen(false);
        }
    };
    
    const handleExport = () => {
        const dataToExport = selectedIds.length > 0
            ? incidents.filter(i => selectedIds.includes(i.id))
            : incidents;
        
        if (dataToExport.length === 0) {
            showToast("沒有可匯出的資料。", 'error');
            return;
        }
        
        exportToCsv({
            filename: `incidents-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'summary', 'resource', 'status', 'severity', 'priority', 'assignee', 'triggeredAt'],
            data: dataToExport,
        });
    };

    const handleAcknowledge = async (ids: string[]) => {
        try {
            await Promise.all(ids.map(id => api.post(`/incidents/${id}/actions`, { action: 'acknowledge' })));
            showToast(`成功認領 ${ids.length} 個事件。`, 'success');
            fetchIncidents();
        } catch (error) {
            showToast('認領事件失敗。', 'error');
        }
    };

    const handleResolve = async (ids: string[]) => {
        try {
            await Promise.all(ids.map(id => api.post(`/incidents/${id}/actions`, { action: 'resolve' })));
            showToast(`成功解決 ${ids.length} 個事件。`, 'success');
            fetchIncidents();
        } catch (error) {
            showToast('解決事件失敗。', 'error');
        }
    };

    const handleQuickSilence = (incident: Incident) => {
        setSilencingIncident(incident);
        setIsQuickSilenceModalOpen(true);
    };

    const handleConfirmSilence = async (id: string, durationHours: number) => {
        const incidentToSilence = incidents.find(inc => inc.id === id);
        if (!incidentToSilence) return;
        const now = new Date();
        const endsAt = new Date(now.getTime() + durationHours * 3600 * 1000);

        const newSilenceRule = {
            name: `Silence for ${incidentToSilence.id}`,
            description: `Quick silence for incident: ${incidentToSilence.summary}`,
            enabled: true,
            type: 'single',
            matchers: [{ key: 'resource', operator: '=', value: incidentToSilence.resource }, { key: 'rule', operator: '=', value: incidentToSilence.rule }],
            schedule: { type: 'single', startsAt: now.toISOString(), endsAt: endsAt.toISOString() },
            creator: currentUser?.name || 'System',
            createdAt: now.toISOString(),
        };

        try {
            await api.post('/silence-rules', newSilenceRule);
            await api.post(`/incidents/${id}/actions`, { action: 'silence', durationHours });
            showToast(`事件 "${incidentToSilence.summary}" 已成功靜音 ${durationHours} 小時。`, 'success');
            setIsQuickSilenceModalOpen(false);
            fetchIncidents();
        } catch (err) {
            showToast('建立靜音規則失敗。', 'error');
        }
    };
    
    const handleRunAIAnalysis = async () => {
        if (selectedIds.length === 0) return;

        setIsAnalysisModalOpen(true);
        setIsAnalysisLoading(true);
        setAnalysisReport(null);

        try {
            const { data } = await api.post<IncidentAnalysis | MultiIncidentAnalysis>('/ai/incidents/analyze', {
                incident_ids: selectedIds,
            });
            setAnalysisReport(data);
        } catch (err) {
            console.error(err);
            setAnalysisReport("無法生成 AI 分析報告。");
        } finally {
            setIsAnalysisLoading(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedIds(e.target.checked ? incidents.map(i => i.id) : []);
    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(sid => sid !== id));
    
    const handleReassignClick = (incident: Incident) => {
        setAssigningIncident(incident);
    };

    const handleConfirmAssign = async (assigneeName: string) => {
        if (!assigningIncident) return;
        try {
            await api.post(`/incidents/${assigningIncident.id}/actions`, { action: 'assign', assigneeName });
            showToast(`事件已成功指派給 ${assigneeName}。`, 'success');
            setAssigningIncident(null);
            fetchIncidents();
        } catch (error) {
            showToast('指派事件失敗。', 'error');
        }
    };

    const isAllSelected = incidents.length > 0 && selectedIds.length === incidents.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < incidents.length;
    
    const getStyle = (descriptors: StyleDescriptor[] | undefined, value: string | undefined): string => {
        if (!descriptors || !value) return 'bg-slate-500/20 text-slate-400';
        return descriptors.find(d => d.value === value)?.className || 'bg-slate-500/20 text-slate-400';
    };

    const renderCellContent = (inc: Incident, columnKey: string) => {
        switch (columnKey) {
            case 'summary':
                return <span className="font-medium text-white">{inc.summary}</span>;
            case 'status':
                return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStyle(incidentOptions?.statuses, inc.status)}`}>{inc.status}</span>;
            case 'severity':
                return <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStyle(incidentOptions?.severities, inc.severity)}`}>{inc.severity}</span>;
            case 'priority':
                return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStyle(incidentOptions?.priorities, inc.priority)}`}>{inc.priority || 'N/A'}</span>;
            case 'serviceImpact':
                return <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStyle(incidentOptions?.serviceImpacts, inc.serviceImpact)}`}>{inc.serviceImpact}</span>;
            case 'resource':
                return inc.resource;
            case 'assignee':
                if (inc.status === 'new' || !inc.assignee) {
                    return (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAcknowledge([inc.id]); }}
                            className="px-3 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors flex items-center"
                        >
                            <Icon name="user-check" className="w-3 h-3 mr-1.5" />
                            認領
                        </button>
                    );
                }
                const assigneeUser = userMap.get(inc.assignee);
                return (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleReassignClick(inc); }}
                        className="group flex items-center space-x-2 p-1 -m-1 rounded-md hover:bg-slate-700/50 transition-colors"
                    >
                        <UserAvatar user={assigneeUser || { name: inc.assignee }} className="w-6 h-6" iconClassName="w-4 h-4" />
                        <span className="text-slate-200 group-hover:text-sky-400">{inc.assignee}</span>
                        <Icon name="repeat" className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                );
            case 'triggeredAt':
                return inc.triggeredAt;
            default:
                return null;
        }
    };

    const leftActions = <ToolbarButton icon="search" text="搜索和篩選" onClick={() => setIsSearchModalOpen(true)} />;
    
    const rightActions = (
        <>
            <ToolbarButton icon="upload" text="匯入" onClick={() => setIsImportModalOpen(true)} />
            <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
            <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
        </>
    );

    const batchActions = (
        <>
            <ToolbarButton icon="brain-circuit" text="AI 分析" onClick={handleRunAIAnalysis} ai />
            <ToolbarButton icon="user-check" text="認領" onClick={() => handleAcknowledge(selectedIds)} />
            <ToolbarButton icon="check-circle" text="解決" onClick={() => handleResolve(selectedIds)} />
        </>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar 
                leftActions={leftActions}
                rightActions={rightActions}
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                batchActions={batchActions}
            />
            
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="p-4 w-12">
                                     <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded" checked={isAllSelected} ref={el => { if(el) el.indeterminate = isIndeterminate; }} onChange={handleSelectAll} />
                                </th>
                                {visibleColumns.map(key => (
                                    <th key={key} scope="col" className="px-6 py-3">{allColumns.find(c => c.key === key)?.label || key}</th>
                                ))}
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading || isLoadingOptions ? (
                                <TableLoader colSpan={visibleColumns.length + 2} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchIncidents} />
                            ) : incidents.map((inc) => (
                                <tr key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)} className={`border-b border-slate-800 cursor-pointer ${selectedIds.includes(inc.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12" onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded" checked={selectedIds.includes(inc.id)} onChange={(e) => handleSelectOne(e, inc.id)} />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">
                                            {renderCellContent(inc, key)}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => handleQuickSilence(inc)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="靜音"><Icon name="bell-off" className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination total={totalIncidents} page={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
            </TableContainer>

            <Drawer isOpen={!!incidentId} onClose={() => navigate('/incidents')} title={`事故詳情: ${incidentId}`} width="w-3/5">
                {incidentId && <IncidentDetailPage incidentId={incidentId} onUpdate={fetchIncidents} currentUser={currentUser} />}
            </Drawer>
            
            <UnifiedSearchModal page="incidents" isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} onSearch={(newFilters) => { setFilters(newFilters as IncidentFilters); setIsSearchModalOpen(false); setCurrentPage(1); }} initialFilters={filters} />
            
            <IncidentAnalysisModal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} title="AI 分析報告" report={analysisReport} isLoading={isAnalysisLoading} />
            
            <QuickSilenceModal isOpen={isQuickSilenceModalOpen} onClose={() => setIsQuickSilenceModalOpen(false)} onSave={handleConfirmSilence} incident={silencingIncident} />
            
            <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={allColumns}
                visibleColumnKeys={visibleColumns}
            />
            <AssignIncidentModal 
                isOpen={!!assigningIncident}
                onClose={() => setAssigningIncident(null)}
                onAssign={handleConfirmAssign}
                incident={assigningIncident}
            />
            <ImportFromCsvModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={fetchIncidents}
                itemName="事件"
                importEndpoint="/incidents/import"
                templateHeaders={['id', 'summary', 'resource', 'status', 'severity', 'priority', 'assignee', 'triggeredAt']}
                templateFilename="incidents-template.csv"
            />
        </div>
    );
};

export default IncidentListPage;