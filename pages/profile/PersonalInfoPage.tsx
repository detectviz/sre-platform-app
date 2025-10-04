import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '../../components/Icon';
import StatusTag from '../../components/StatusTag';
import api from '../../services/api';
import { User, AuthSettings } from '../../types';
import { formatTimestamp } from '../../utils/time';

const PersonalInfoPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authSettings, setAuthSettings] = useState<AuthSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const relativeFormatter = useMemo(() => new Intl.RelativeTimeFormat('zh-TW', { numeric: 'auto' }), []);

  const formatRelativeFromNow = useCallback((value?: string | null) => {
    if (!value) {
      return '—';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    const diffMs = parsed.getTime() - Date.now();
    const thresholds: { limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }[] = [
      { limit: 60_000, divisor: 1_000, unit: 'second' },
      { limit: 3_600_000, divisor: 60_000, unit: 'minute' },
      { limit: 86_400_000, divisor: 3_600_000, unit: 'hour' },
      { limit: 604_800_000, divisor: 86_400_000, unit: 'day' },
      { limit: Number.POSITIVE_INFINITY, divisor: 604_800_000, unit: 'week' },
    ];
    for (const { limit, divisor, unit } of thresholds) {
      if (Math.abs(diffMs) < limit) {
        return relativeFormatter.format(Math.round(diffMs / divisor), unit);
      }
    }
    return relativeFormatter.format(Math.round(diffMs / 2_592_000_000), 'month');
  }, [relativeFormatter]);

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

  const statusLabelMap: Record<User['status'], { label: string; tone: 'success' | 'info' | 'neutral' | 'warning' | 'danger' }> = {
    active: { label: '啟用', tone: 'success' },
    invited: { label: '已邀請', tone: 'info' },
    inactive: { label: '已停用', tone: 'neutral' },
  };
  const statusBadge = statusLabelMap[currentUser.status];

  const lastLoginDisplay = currentUser.last_login_at
    ? `${formatTimestamp(currentUser.last_login_at, { showSeconds: false })}（${formatRelativeFromNow(currentUser.last_login_at)}）`
    : '尚未登入';
  const createdDisplay = `${formatTimestamp(currentUser.created_at, { showSeconds: false })}（${formatRelativeFromNow(currentUser.created_at)}）`;
  const updatedDisplay = `${formatTimestamp(currentUser.updated_at, { showSeconds: false })}（${formatRelativeFromNow(currentUser.updated_at)}）`;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-slate-800/60 p-3 text-slate-300">
              <Icon name="user-circle" className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">{currentUser.name}</h2>
              <p className="text-sm text-slate-300">{currentUser.email}</p>
              <p className="text-xs text-slate-500">使用者 ID：{currentUser.id}</p>
            </div>
          </div>
          <StatusTag tone={statusBadge.tone} label={statusBadge.label} icon="shield" />
        </div>

        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">角色</dt>
            <dd className="mt-2 text-sm font-semibold text-white">{currentUser.role}</dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">團隊</dt>
            <dd className="mt-2 text-sm font-semibold text-white">{currentUser.team}</dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">最近登入</dt>
            <dd className="mt-2 text-sm text-slate-200">{lastLoginDisplay}</dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">建立時間</dt>
            <dd className="mt-2 text-sm text-slate-200">{createdDisplay}</dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 md:col-span-2">
            <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">最近更新</dt>
            <dd className="mt-2 text-sm text-slate-200">{updatedDisplay}</dd>
          </div>
        </dl>

        {authSettings?.idp_admin_url && (
          <div className="mt-6 flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1 text-sm text-slate-300">
              <p>此帳號透過 {authSettings.provider.toUpperCase()} 進行驗證。</p>
              <p className="text-xs text-slate-500">若需更新使用者資訊，請前往身份提供商主控台。</p>
            </div>
            <a
              href={authSettings.idp_admin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-sky-500/40 bg-sky-900/30 px-3 py-2 text-sm font-medium text-sky-200 hover:bg-sky-500/20"
            >
              <Icon name="external-link" className="h-4 w-4" />
              前往身分提供商管理
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoPage;
