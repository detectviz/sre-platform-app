import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/shared/components/Modal';
import FormRow from '@/shared/components/FormRow';
import { Incident, User } from '@/shared/types';
import api from '@/services/api';
import StatusTag from '@/shared/components/StatusTag';
import AssigneeSelect from './AssigneeSelect';
import UserAvatar from './UserAvatar';

const formatRoleLabel = (role?: string | null) => {
  if (!role) return '';
  return role
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

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
      api
        .get<{ items: User[] }>('/iam/users', { params: { page_size: 1000 } })
        .then(res => {
          setUsers(res.data.items);
          const currentAssignee = res.data.items.find(u => u.name === incident?.assignee);
          setSelectedUserId(
            currentAssignee?.id || (res.data.items.length > 0 ? res.data.items[0].id : '')
          );
        })
        .catch(err => console.error('Failed to load users for assignment', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, incident]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId('');
      setUsers([]);
    }
  }, [isOpen]);

  const selectedUser = useMemo(
    () => users.find(user => user.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const handleAssign = () => {
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
          <button
            onClick={onClose}
            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-600"
          >
            取消
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedUser || isLoading}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            確認轉派
          </button>
        </div>
      }
    >
      <FormRow label="指派給" description="選擇要承接此事件的工程師，會同步紀錄於事件歷史。">
        <AssigneeSelect
          users={users}
          value={selectedUserId}
          onChange={setSelectedUserId}
          disabled={isLoading}
          loading={isLoading}
          placeholder="選擇工程師"
          emptyMessage="找不到可指派的成員"
        />
        {!isLoading && users.length === 0 && (
          <p className="mt-2 text-xs text-red-300">找不到可指派的成員，請先建立使用者。</p>
        )}
        {selectedUser && (
          <div className="mt-4 rounded-lg border border-slate-700/60 bg-slate-900/60 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar user={selectedUser} className="h-12 w-12" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100">{selectedUser.name}</p>
                  {selectedUser.email && (
                    <p className="mt-0.5 break-all text-xs text-slate-400">{selectedUser.email}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedUser.team && <StatusTag label={selectedUser.team} tone="info" dense />}
                {selectedUser.role && (
                  <StatusTag
                    label={formatRoleLabel(selectedUser.role)}
                    tone="neutral"
                    dense
                  />
                )}
                <StatusTag
                  label={selectedUser.status === 'active' ? '啟用' : '停用'}
                  tone={selectedUser.status === 'active' ? 'success' : 'danger'}
                  dense
                />
              </div>
            </div>
          </div>
        )}
      </FormRow>
    </Modal>
  );
};

export default AssignIncidentModal;
