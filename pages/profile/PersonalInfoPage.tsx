

import React, { useState, useEffect, useCallback } from 'react';
import FormRow from '../../components/FormRow';
import Icon from '../../components/Icon';
import api from '../../services/api';
import { User, AuthSettings } from '../../types';

const PersonalInfoPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authSettings, setAuthSettings] = useState<AuthSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userRes, authRes] = await Promise.all([
          api.get<User>('/me'),
          api.get<AuthSettings>('/settings/auth')
      ]);
      setCurrentUser(userRes.data);
      setAuthSettings(authRes.data);
    } catch (err) {
      setError('無法獲取個人資訊或驗證設定。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  if (isLoading) {
    return <div className="text-center"><Icon name="loader-circle" className="w-6 h-6 animate-spin inline-block" /></div>;
  }

  if (error || !currentUser) {
    return <div className="text-center text-red-400">{error || '找不到使用者資料。'}</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mr-6 shrink-0">
            <Icon name="user" className="w-10 h-10 text-slate-300" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{currentUser.name}</h3>
            <p className="text-slate-400">{currentUser.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <FormRow label="角色">
            <p className="text-white bg-slate-800/50 rounded-md px-3 py-2">{currentUser.role}</p>
          </FormRow>
          <FormRow label="團隊">
            <p className="text-white bg-slate-800/50 rounded-md px-3 py-2">{currentUser.team}</p>
          </FormRow>
          <FormRow label="狀態">
             <p className="text-white bg-slate-800/50 rounded-md px-3 py-2 capitalize">{currentUser.status}</p>
          </FormRow>
        </div>
         <div className="mt-6 pt-6 border-t border-slate-700/50 text-right">
            {authSettings?.idpAdminUrl && (
                <a href={authSettings.idpAdminUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-sky-400 hover:text-sky-300 px-3 py-1 rounded-md hover:bg-sky-500/20 ml-auto">
                    <Icon name="external-link" className="w-4 h-4 mr-2" />
                    在 {authSettings.provider} 中管理
                </a>
            )}
         </div>
      </div>
    </div>
  );
};

export default PersonalInfoPage;