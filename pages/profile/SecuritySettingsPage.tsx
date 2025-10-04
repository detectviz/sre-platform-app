import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '../../components/Icon';
import api from '../../services/api';
import { LoginHistoryRecord } from '../../types';
import Pagination from '../../components/Pagination';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import { showToast } from '../../services/toast';
import StatusTag, { StatusTagProps } from '../../components/StatusTag';
import { formatTimestamp } from '../../utils/time';

const SecuritySettingsPage: React.FC = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRevokingSessions, setIsRevokingSessions] = useState(false);

    const [loginHistory, setLoginHistory] = useState<LoginHistoryRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const relativeFormatter = useMemo(() => new Intl.RelativeTimeFormat('zh-TW', { numeric: 'auto' }), []);

    const formatRelativeFromNow = useCallback((value?: string) => {
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

    const passwordStrength = useMemo(() => {
        const value = newPassword;
        const rules = [
            value.length >= 12,
            /[A-Z]/.test(value),
            /[0-9]/.test(value),
            /[^A-Za-z0-9]/.test(value),
        ];
        const score = rules.filter(Boolean).length;
        const tone: StatusTagProps['tone'] = score >= 3 ? 'success' : score === 2 ? 'warning' : 'danger';
        const label = score >= 3 ? '強度良好' : score === 2 ? '建議再加強' : '風險較高';
        return { score, label, tone };
    }, [newPassword]);

    const passwordMismatch = useMemo(() => newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword, [newPassword, confirmPassword]);

    const fetchLoginHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<{ items: LoginHistoryRecord[], total: number }>('/me/login-history', {
                params: { page: currentPage, page_size: pageSize }
            });
            setLoginHistory(data.items);
            setTotal(data.total);
        } catch (err) {
            setError("無法獲取登入歷史。");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);
    
    useEffect(() => {
        fetchLoginHistory();
    }, [fetchLoginHistory]);

    const handleRevokeSessions = useCallback(async () => {
        setIsRevokingSessions(true);
        try {
            await api.post('/me/logout-others');
            showToast('已強制登出其他裝置。', 'success');
        } catch (err) {
            showToast('強制登出其他裝置失敗，請稍後再試。', 'error');
        } finally {
            setIsRevokingSessions(false);
        }
    }, []);

    const handlePasswordChange = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            showToast('所有欄位皆為必填。', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('新密碼與確認密碼不符。', 'error');
            return;
        }
        if (passwordStrength.score < 3) {
            showToast('請設定至少 12 碼並包含大小寫、數字與符號的強密碼。', 'error');
            return;
        }
    
        setIsUpdating(true);
        try {
            await api.post('/me/change-password', { old_password: oldPassword, new_password: newPassword });
            showToast('密碼已成功更新。', 'success');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            const errorMessage = err.message || '更新密碼失敗，請稍後再試。';
            showToast(errorMessage, 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const statusMapping: Record<LoginHistoryRecord['status'], { label: string; tone: 'success' | 'danger' }> = {
        success: { label: '成功', tone: 'success' },
        failed: { label: '失敗', tone: 'danger' },
    };

    const getDeviceIcon = (device: string) => {
        const lowered = device.toLowerCase();
        if (lowered.includes('iphone') || lowered.includes('android') || lowered.includes('mobile')) {
            return 'smartphone';
        }
        if (lowered.includes('mac') || lowered.includes('windows') || lowered.includes('linux')) {
            return 'monitor';
        }
        return 'globe';
    };

    const formatLoginTimestamp = (value: string) => `${formatTimestamp(value, { showSeconds: false })}（${formatRelativeFromNow(value)}）`;

    return (
        <div className="max-w-5xl space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">變更密碼</h2>
                        <p className="text-sm text-slate-400">請設定至少 12 碼並混合大小寫、數字與符號，以保護帳號安全。</p>
                    </div>
                    <StatusTag tone={passwordStrength.tone} label={passwordStrength.label} icon="lock" />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm text-slate-300">
                        舊密碼
                        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" autoComplete="current-password" />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-300">
                        新密碼
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" autoComplete="new-password" />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-300 md:col-span-2">
                        確認新密碼
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`rounded-md border ${passwordMismatch ? 'border-rose-500' : 'border-slate-700'} bg-slate-950/60 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500`} autoComplete="new-password" />
                        {passwordMismatch && <span className="text-xs text-rose-400">新密碼與確認密碼不一致。</span>}
                    </label>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>強度指標</span>
                        <div className="flex flex-1 gap-1">
                            {[0, 1, 2, 3].map(index => (
                                <span key={index} className={`h-1.5 flex-1 rounded-full ${index < passwordStrength.score ? (passwordStrength.score >= 3 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-slate-700'}`} />
                            ))}
                        </div>
                    </div>
                    <ul className="list-disc list-inside text-xs text-slate-500">
                        <li>至少 12 個字元</li>
                        <li>包含大小寫英文字母</li>
                        <li>至少一個數字與特殊符號</li>
                    </ul>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
                    <button
                        onClick={handlePasswordChange}
                        disabled={isUpdating}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500/90 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? (<><Icon name="loader-circle" className="h-4 w-4 animate-spin" /> 更新中</>) : '更新密碼'}
                    </button>
                    <button
                        onClick={handleRevokeSessions}
                        disabled={isRevokingSessions}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80 disabled:opacity-60"
                    >
                        {isRevokingSessions ? (<><Icon name="loader-circle" className="h-4 w-4 animate-spin" /> 處理中</>) : (<><Icon name="log-out" className="h-4 w-4" /> 強制登出其他裝置</>)}
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">最近登入活動</h2>
                        <p className="text-sm text-slate-400">檢視最近的登入 IP、裝置與結果，辨識是否有可疑行為。</p>
                    </div>
                    <button onClick={fetchLoginHistory} className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/80">
                        <Icon name="refresh-ccw" className="h-4 w-4" /> 重新整理
                    </button>
                </div>
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-200">
                        <thead className="bg-slate-950/60 text-xs uppercase text-slate-400">
                            <tr>
                                <th className="px-4 py-2">時間</th>
                                <th className="px-4 py-2">IP 位址</th>
                                <th className="px-4 py-2">裝置</th>
                                <th className="px-4 py-2 text-center">狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={4} />
                            ) : error ? (
                                <TableError colSpan={4} message={error} onRetry={fetchLoginHistory} />
                            ) : loginHistory.length > 0 ? (
                                loginHistory.map(log => (
                                    <tr key={log.id} className="border-b border-slate-800 last:border-b-0">
                                        <td className="px-4 py-3 text-slate-300">{formatLoginTimestamp(log.timestamp)}</td>
                                        <td className="px-4 py-3 text-slate-200">{log.ip}</td>
                                        <td className="px-4 py-3 text-slate-200">
                                            <span className="flex items-center gap-2">
                                                <Icon name={getDeviceIcon(log.device)} className="h-4 w-4 text-slate-400" />
                                                {log.device}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusTag dense tone={statusMapping[log.status].tone} label={statusMapping[log.status].label} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">尚無登入紀錄。</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination total={total} page={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
            </div>
        </div>
    );
};

export default SecuritySettingsPage;