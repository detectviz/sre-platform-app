import React, { useMemo, useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import { ResourceGroup, Resource, Team } from '../types';
import api from '../services/api';
import SearchableSelect, { SearchableSelectOption } from './SearchableSelect';

interface ResourceGroupEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (group: ResourceGroup) => void;
    group: ResourceGroup | null;
}

interface ResourceListItemProps {
    resource: Resource;
    onAction: (id: string) => void;
    iconName: string;
}
const ResourceListItem: React.FC<ResourceListItemProps> = ({ resource, onAction, iconName }) => (
    <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-slate-700/40">
        <div className="max-w-[70%]">
            <p className="truncate font-medium text-white" title={resource.name}>{resource.name}</p>
            <p className="text-xs text-slate-400">{resource.type} · {resource.provider}</p>
        </div>
        <button
            type="button"
            onClick={() => onAction(resource.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-600 hover:text-white"
            aria-label={iconName === 'chevron-right' ? '加入群組' : '移出群組'}
            title={iconName === 'chevron-right' ? '加入群組 Add to group' : '移出群組 Remove from group'}
        >
            <Icon name={iconName} className="h-4 w-4" />
        </button>
    </div>
);

const ResourceGroupEditModal: React.FC<ResourceGroupEditModalProps> = ({ isOpen, onClose, onSave, group }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [owner_team, setOwnerTeam] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [allResources, setAllResources] = useState<Resource[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [availableQuery, setAvailableQuery] = useState('');
    const [selectedQuery, setSelectedQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(group?.name || '');
            setDescription(group?.description || '');
            setOwnerTeam(group?.owner_team || '');
            setSelectedIds(group?.member_ids || []);
            setAvailableQuery('');
            setSelectedQuery('');

            setIsLoading(true);
            Promise.all([
                api.get<{ items: Resource[] }>('/resources', { params: { page: 1, page_size: 1000 } }),
                api.get<{ items: Team[] }>('/iam/teams', { params: { page: 1, page_size: 1000 } })
            ]).then(([resourcesRes, teamsRes]) => {
                const resourceItems = resourcesRes.data.items || [];
                const teamItems = teamsRes.data.items || [];
                setAllResources(resourceItems);
                setTeams(teamItems);
                if (!group?.owner_team && teamItems.length > 0) {
                    setOwnerTeam(teamItems[0].name);
                }
            }).catch(err => console.error("Failed to fetch data for modal", err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, group]);

    const teamOptions = useMemo<SearchableSelectOption[]>(() => (
        teams.map(team => ({ value: team.name, label: team.name }))
    ), [teams]);

    const handleSave = () => {
        const savedGroup: ResourceGroup = {
            id: group?.id || '',
            name,
            description,
            owner_team,
            member_ids: selectedIds,
            status_summary: group?.status_summary || { healthy: 0, warning: 0, critical: 0 }, // Summary will be recalculated on save
            created_at: group?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        onSave(savedGroup);
    };

    const availableResources = useMemo(() => allResources.filter(r => !selectedIds.includes(r.id)), [selectedIds, allResources]);
    const selectedResources = useMemo(() => allResources.filter(r => selectedIds.includes(r.id)), [selectedIds, allResources]);

    const filteredAvailable = useMemo(() => {
        if (!availableQuery) return availableResources;
        const keyword = availableQuery.toLowerCase();
        return availableResources.filter(resource => (
            resource.name.toLowerCase().includes(keyword) ||
            resource.type.toLowerCase().includes(keyword) ||
            resource.provider.toLowerCase().includes(keyword)
        ));
    }, [availableQuery, availableResources]);

    const filteredSelected = useMemo(() => {
        if (!selectedQuery) return selectedResources;
        const keyword = selectedQuery.toLowerCase();
        return selectedResources.filter(resource => (
            resource.name.toLowerCase().includes(keyword) ||
            resource.type.toLowerCase().includes(keyword) ||
            resource.provider.toLowerCase().includes(keyword)
        ));
    }, [selectedQuery, selectedResources]);

    return (
        <Modal
            title={group ? '編輯資源群組' : '新增資源群組'}
            isOpen={isOpen}
            onClose={onClose}
            width="w-2/3 max-w-4xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">儲存</button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <FormRow label="群組名稱 *">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="例如：資料庫高風險群組"
                            className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                        />
                    </FormRow>
                    <FormRow label="擁有團隊">
                        <SearchableSelect
                            value={owner_team}
                            onChange={setOwnerTeam}
                            options={teamOptions}
                            placeholder="輸入團隊名稱"
                            disabled={isLoading}
                        />
                    </FormRow>
                </div>
                <FormRow label="描述">
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={3}
                        placeholder="補充此資源群組的用途或匯入準則。"
                        className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    ></textarea>
                </FormRow>

                <div>
                    <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Icon name="sparkles" className="h-4 w-4 text-slate-300" /> 點擊右側箭頭即可快速加入 / 移除資源。</span>
                        <span>支援以名稱、類型或提供商搜尋。</span>
                    </div>
                    <div className="grid h-72 grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col rounded-lg border border-slate-700 bg-slate-900/40 p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="font-semibold text-white">可用的資源 ({filteredAvailable.length}/{availableResources.length})</h3>
                                <div className="relative w-36">
                                    <input
                                        type="search"
                                        value={availableQuery}
                                        onChange={e => setAvailableQuery(e.target.value)}
                                        placeholder="搜尋資源"
                                        className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                                    />
                                </div>
                            </div>
                            {isLoading ? (
                                <Icon name="loader-circle" className="mx-auto mt-6 h-5 w-5 animate-spin text-slate-400" />
                            ) : (
                                <div className="flex-grow space-y-1.5 overflow-y-auto">
                                    {filteredAvailable.length === 0 ? (
                                        <div className="rounded-md border border-dashed border-slate-700 bg-slate-900/50 p-4 text-center text-xs text-slate-400">
                                            找不到符合搜尋的資源。
                                        </div>
                                    ) : (
                                        filteredAvailable.map(resource => (
                                            <ResourceListItem
                                                key={resource.id}
                                                resource={resource}
                                                onAction={id => setSelectedIds(ids => [...ids, id])}
                                                iconName="chevron-right"
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col rounded-lg border border-slate-700 bg-slate-900/40 p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="font-semibold text-white">已選擇的資源 ({filteredSelected.length}/{selectedResources.length})</h3>
                                <div className="relative w-36">
                                    <input
                                        type="search"
                                        value={selectedQuery}
                                        onChange={e => setSelectedQuery(e.target.value)}
                                        placeholder="搜尋已選資源"
                                        className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                                    />
                                </div>
                            </div>
                            {isLoading ? (
                                <Icon name="loader-circle" className="mx-auto mt-6 h-5 w-5 animate-spin text-slate-400" />
                            ) : (
                                <div className="flex-grow space-y-1.5 overflow-y-auto">
                                    {filteredSelected.length === 0 ? (
                                        <div className="rounded-md border border-dashed border-slate-700 bg-slate-900/50 p-4 text-center text-xs text-slate-400">
                                            尚未選擇符合條件的資源。
                                        </div>
                                    ) : (
                                        filteredSelected.map(resource => (
                                            <ResourceListItem
                                                key={resource.id}
                                                resource={resource}
                                                onAction={id => setSelectedIds(ids => ids.filter(i => i !== id))}
                                                iconName="chevron-left"
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ResourceGroupEditModal;
