
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import ColumnSettingsModal from '../../components/ColumnSettingsModal';
import { showToast } from '../../services/toast';
import { exportToCsv } from '../../services/export';
import { usePageMetadata } from '../../contexts/PageMetadataContext';
import { useUser } from '../../contexts/UserContext';
import { useOptions } from '../../contexts/OptionsContext';
import AssignIncidentModal from '../../components/AssignIncidentModal';
import UserAvatar from '../../components/UserAvatar';
import ImportFromCsvModal from '../../components/ImportFromCsvModal';
import { TagList } from '../../components/TagList';


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
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

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
            const [incidentsRes, columnConfigRes, allColumnsRes, usersRes] = await Promise.all([
                api.get<{ items: Incident[], total: number }>('/incidents', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`),
                api.get<{ items: User[] }>('/iam/users', { params: { page: 1, page_size: 1000 } })
            ]);

            setIncidents(incidentsRes.data.items);
            setTotalIncidents(incidentsRes.data.total);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
            setUsers(usersRes.data.items);
        } catch (err) {
            setError('無法獲取事故列表。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters, pageKey]);

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
            headers: ['id', 'summary', 'resource', 'status', 'severity', 'impact', 'assignee', 'occurredAt'],
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
        return descriptors.find(d => d.value === value)?.class_name || 'bg-slate-500/20 text-slate-400';
    };

    const getLabel = (descriptors: any[] | undefined, value: string | undefined): string => {
        if (!descriptors || !value) return value || 'N/A';
        return descriptors.find(d => d.value === value)?.label || value;
    };

    const renderCellContent = (inc: Incident, columnKey: string) => {
        switch (columnKey) {
            case 'summary':
                return <span className="font-medium text-white">{inc.summary}</span>;
            case 'status':
                return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStyle(incidentOptions?.statuses, inc.status)}`}>{getLabel(incidentOptions?.statuses, inc.status)}</span>;
            case 'severity':
                return <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStyle(incidentOptions?.severities, inc.severity)}`}>{getLabel(incidentOptions?.severities, inc.severity)}</span>;
            case 'impact':
                return <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStyle(incidentOptions?.impacts, inc.impact)}`}>{getLabel(incidentOptions?.impacts, inc.impact)}</span>;
            case 'resource':
                return inc.resource;
            case 'assignee':
                if (inc.status === 'New' || !inc.assignee) {
                    return (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAcknowledge([inc.id]); }}
                            className="px-3 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-full transition-colors flex items-center shadow-sm"
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
                        className="group flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-700/40 hover:bg-sky-600/25 border border-slate-600/40 hover:border-sky-500/60 text-slate-200 hover:text-sky-200 transition-all duration-200 shadow-sm"
                    >
                        <span className="leading-none">{inc.assignee}</span>
                        <Icon name="repeat" className="w-3 h-3 opacity-60 group-hover:opacity-100 text-slate-400 group-hover:text-sky-400 transition-all duration-200 flex-shrink-0" />
                    </button>
                );
            case 'occurred_at':
                return inc.occurred_at;
            case 'tags':
                if (!inc.tags || Object.keys(inc.tags).length === 0) {
                    return <span className="text-slate-500 text-xs">無標籤</span>;
                }
                return (
                    <TagList
                        tags={inc.tags}
                        maxVisible={5}
                        readonlyKeys={['team', 'owner']}
                        linkMapping={{
                            team: (value, entityId) => `/settings/teams`,
                            owner: (value, entityId) => `/settings/personnel`,
                        }}
                    />
                );
            default:
                return <span className="text-slate-500">--</span>;
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
            <ToolbarButton icon="upload" text="匯入" onClick={() => setIsImportModalOpen(true)} />
            <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
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
                                    <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded" checked={isAllSelected} ref={el => { if (el) el.indeterminate = isIndeterminate; }} onChange={handleSelectAll} />
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
                templateHeaders={['id', 'summary', 'resource', 'status', 'severity', 'impact', 'assignee', 'occurredAt']}
                templateFilename="incidents-template.csv"
            />
        </div>
    );
};

export default IncidentListPage;