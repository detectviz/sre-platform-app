import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { Incident, User } from '../types';
import api from '../services/api';

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
            <FormRow label="指派給">
                <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoading}>
                    {isLoading ? <option>載入中...</option> : users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
            </FormRow>
        </Modal>
    );
};

export default AssignIncidentModal;