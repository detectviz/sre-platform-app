import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { Incident, User } from '../types';
import api from '../services/api';
import StatusTag from './StatusTag';

interface AssignIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assigneeName: string) => void;
  incident: Incident | null;
}

const AssignIncidentModal: React.FC<AssignIncidentModalProps> = ({ isOpen, onClose, onAssign, incident }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            api.get<{ items: User[] }>('/iam/users', { params: { page_size: 1000 } })
                .then(res => {
                    setUsers(res.data.items);
                    const currentAssignee = res.data.items.find(u => u.name === incident?.assignee);
                    setSelectedUserId(currentAssignee?.id || (res.data.items.length > 0 ? res.data.items[0].id : ''));
                })
                .catch(err => console.error("Failed to load users for assignment", err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, incident]);

    const handleAssign = () => {
        const selectedUser = users.find(u => u.id === selectedUserId);
        if (selectedUser) {
            onAssign(selectedUser.name);
        }
    };

    return (
        <Modal
            title={`轉派事件: ${incident?.summary}`}
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/3"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                    <button onClick={handleAssign} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">確認轉派</button>
                </div>
            }
        >
            <FormRow
                label="指派給"
                description="選擇要承接此事件的工程師，會同步紀錄於事件歷史。"
            >
                <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <option>載入中...</option>
                    ) : (
                        users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}｜{u.team}｜{u.role}</option>
                        ))
                    )}
                </select>
                {!isLoading && users.length === 0 && (
                    <p className="text-xs text-red-300 mt-2">找不到可指派的成員，請先建立使用者。</p>
                )}
                {selectedUserId && !isLoading && (
                    (() => {
                        const selected = users.find(u => u.id === selectedUserId);
                        if (!selected) return null;
                        return (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                                <div className="space-y-1">
                                    <p className="font-semibold text-slate-200">{selected.name}</p>
                                    <p className="text-slate-400">{selected.email}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
                                    <StatusTag label={selected.team} tone="info" dense />
                                    <StatusTag label={selected.role} tone="neutral" dense />
                                    <StatusTag label={selected.status === 'active' ? '啟用' : '停用'} tone={selected.status === 'active' ? 'success' : 'danger'} dense />
                                </div>
                            </div>
                        );
                    })()
                )}
            </FormRow>
        </Modal>
    );
};

export default AssignIncidentModal;