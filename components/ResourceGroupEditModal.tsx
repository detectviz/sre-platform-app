import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import { ResourceGroup, Resource, Team } from '../types';
import api from '../services/api';

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
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700/50 text-sm">
        <div>
            <p className="font-medium text-white">{resource.name}</p>
            <p className="text-xs text-slate-400">{resource.type}</p>
        </div>
        <button onClick={() => onAction(resource.id)} className="p-1 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white">
            <Icon name={iconName} className="w-4 h-4" />
        </button>
    </div>
);

const ResourceGroupEditModal: React.FC<ResourceGroupEditModalProps> = ({ isOpen, onClose, onSave, group }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [ownerTeam, setOwnerTeam] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [allResources, setAllResources] = useState<Resource[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(group?.name || '');
            setDescription(group?.description || '');
            setOwnerTeam(group?.ownerTeam || '');
            setSelectedIds(group?.memberIds || []);

            setIsLoading(true);
            Promise.all([
                api.get<{ items: Resource[] }>('/resources', { params: { page: 1, page_size: 1000 } }),
                api.get<{ items: Team[] }>('/iam/teams', { params: { page: 1, page_size: 1000 } })
            ]).then(([resourcesRes, teamsRes]) => {
                const resourceItems = resourcesRes.data.items || [];
                const teamItems = teamsRes.data.items || [];
                setAllResources(resourceItems);
                setTeams(teamItems);
                if (!group?.ownerTeam && teamItems.length > 0) {
                    setOwnerTeam(teamItems[0].name);
                }
            }).catch(err => console.error("Failed to fetch data for modal", err))
              .finally(() => setIsLoading(false));
        }
    }, [isOpen, group]);

    const handleSave = () => {
        const savedGroup: ResourceGroup = {
            id: group?.id || '',
            name,
            description,
            ownerTeam,
            memberIds: selectedIds,
            statusSummary: group?.statusSummary || { healthy: 0, warning: 0, critical: 0 } // Summary will be recalculated on save
        };
        onSave(savedGroup);
    };

    const availableResources = useMemo(() => allResources.filter(r => !selectedIds.includes(r.id)), [selectedIds, allResources]);
    const selectedResources = useMemo(() => allResources.filter(r => selectedIds.includes(r.id)), [selectedIds, allResources]);

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRow label="群組名稱 *">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                    </FormRow>
                     <FormRow label="擁有團隊">
                        <select value={ownerTeam} onChange={e => setOwnerTeam(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoading}>
                           {isLoading ? <option>載入中...</option> : teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                    </FormRow>
                </div>
                <FormRow label="描述">
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"></textarea>
                </FormRow>

                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">成員管理</label>
                    <div className="grid grid-cols-2 gap-4 h-72">
                        <div className="border border-slate-700 rounded-lg p-3 flex flex-col">
                            <h3 className="font-semibold mb-2 text-white">可用的資源 ({availableResources.length})</h3>
                             {isLoading ? <Icon name="loader-circle" className="animate-spin text-slate-400 mx-auto mt-4" /> : (
                                <div className="space-y-1 overflow-y-auto flex-grow">
                                    {availableResources.map(r => <ResourceListItem key={r.id} resource={r} onAction={(id) => setSelectedIds(ids => [...ids, id])} iconName="chevron-right" />)}
                                </div>
                             )}
                        </div>
                        <div className="border border-slate-700 rounded-lg p-3 flex flex-col">
                            <h3 className="font-semibold mb-2 text-white">已選擇的資源 ({selectedResources.length})</h3>
                            {isLoading ? <Icon name="loader-circle" className="animate-spin text-slate-400 mx-auto mt-4" /> : (
                                <div className="space-y-1 overflow-y-auto flex-grow">
                                    {selectedResources.map(r => <ResourceListItem key={r.id} resource={r} onAction={(id) => setSelectedIds(ids => ids.filter(i => i !== id))} iconName="chevron-left" />)}
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
