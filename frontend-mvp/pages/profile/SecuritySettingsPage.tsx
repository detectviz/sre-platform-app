import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '../../components/Icon';
import api from '../../services/api';
import { LoginHistoryRecord, LoginStatus } from '../../types';
import Pagination from '../../components/Pagination';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import { showToast } from '../../services/toast';
import StatusTag, { StatusTagProps } from '../../components/StatusTag';
import { formatTimestamp } from '../../utils/time';
import { useContent, useContentSection } from '../../contexts/ContentContext';
import { LOGIN_STATUS, LOGIN_STATUS_TONE } from '../../constants/status';
import { useDesignSystemClasses } from '../../hooks/useDesignSystemClasses';
import TableContainer from '../../components/TableContainer';

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

    const { locale } = useContent();
    const globalContent = useContentSection('GLOBAL');
    const pageContent = useContentSection('PROFILE_SECURITY_SETTINGS');
    const changePasswordContent = pageContent?.CHANGE_PASSWORD;
    const sessionContent = pageContent?.SESSION_MANAGEMENT;
    const loginHistoryContent = pageContent?.LOGIN_HISTORY;
    const passwordStrengthCopy = changePasswordContent?.PASSWORD_STRENGTH;
    const design = useDesignSystemClasses();

    const relativeFormatter = useMemo(() => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }), [locale]);

    const formatRelativeFromNow = useCallback((value?: string) => {
        const placeholder = globalContent?.NA ?? '—';
        if (!value) {
            return placeholder;
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
    }, [globalContent?.NA, relativeFormatter]);

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
        const strongLabel = passwordStrengthCopy?.GOOD ?? 'Strong';
        const needsImprovementLabel = passwordStrengthCopy?.NEEDS_IMPROVEMENT ?? 'Needs improvement';
        const weakLabel = passwordStrengthCopy?.WEAK ?? 'Weak';
        const label = score >= 3 ? strongLabel : score === 2 ? needsImprovementLabel : weakLabel;
        return { score, label, tone };
    }, [newPassword, passwordStrengthCopy?.GOOD, passwordStrengthCopy?.NEEDS_IMPROVEMENT, passwordStrengthCopy?.WEAK]);

    const passwordMismatch = useMemo(() => newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword, [newPassword, confirmPassword]);

    const fetchLoginHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<{ items: LoginHistoryRecord[]; total: number }>('/me/login-history', {
                params: { page: currentPage, page_size: pageSize }
            });
            setLoginHistory(data.items);
            setTotal(data.total);
        } catch (err: unknown) {
            const fallback = loginHistoryContent?.ERROR || 'Unable to load sign-in history.';
            if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: string }).message === 'string') {
                setError((err as { message?: string }).message ?? fallback);
            } else {
                setError(fallback);
            }
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, loginHistoryContent?.ERROR]);

    useEffect(() => {
        fetchLoginHistory();
    }, [fetchLoginHistory]);

    const handleRevokeSessions = useCallback(async () => {
        setIsRevokingSessions(true);
        try {
            await api.post('/me/logout-others');
            showToast(sessionContent?.TOAST?.SUCCESS || 'Other sessions have been signed out.', 'success');
        } catch (err: unknown) {
            const fallback = sessionContent?.TOAST?.ERROR || 'Failed to sign out other sessions. Please try again later.';
            const errorMessage =
                (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: string }).message === 'string'
                    ? (err as { message?: string }).message
                    : undefined) || fallback;
            showToast(errorMessage, 'error');
        } finally {
            setIsRevokingSessions(false);
        }
    }, [sessionContent?.TOAST?.ERROR, sessionContent?.TOAST?.SUCCESS]);

    const handlePasswordChange = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            showToast(changePasswordContent?.VALIDATION?.FIELDS_REQUIRED || 'All fields are required.', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast(changePasswordContent?.VALIDATION?.MISMATCH || 'New password and confirmation must match.', 'error');
            return;
        }
        if (passwordStrength.score < 3) {
            showToast(
                changePasswordContent?.VALIDATION?.INSUFFICIENT_STRENGTH ||
                'Use at least 12 characters with upper and lower case letters, numbers, and symbols.',
                'error'
            );
            return;
        }

        setIsUpdating(true);
        try {
            await api.post('/me/change-password', { old_password: oldPassword, new_password: newPassword });
            showToast(changePasswordContent?.TOAST?.SUCCESS || 'Password updated successfully.', 'success');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            const fallback = changePasswordContent?.TOAST?.ERROR || 'Failed to update the password. Please try again later.';
            const errorMessage =
                (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: string }).message === 'string'
                    ? (err as { message?: string }).message
                    : undefined) || fallback;
            showToast(errorMessage, 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const statusMapping: Record<LoginStatus, { label: string; tone: StatusTagProps['tone'] }> = useMemo(() => ({
        success: {
            label: loginHistoryContent?.STATUS_LABELS?.success ?? 'Success',
            tone: LOGIN_STATUS_TONE.success,
        },
        failed: {
            label: loginHistoryContent?.STATUS_LABELS?.failed ?? 'Failed',
            tone: LOGIN_STATUS_TONE.failed,
        },
    }), [loginHistoryContent?.STATUS_LABELS]);

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

    const formatLoginTimestamp = (value: string) => {
        const base = formatTimestamp(value, { showSeconds: false });
        const relative = formatRelativeFromNow(value);
        const template = loginHistoryContent?.RELATIVE_TEMPLATE;
        if (template && template.includes('{relative}')) {
            return `${base}${template.replace('{relative}', relative)}`;
        }
        if (template && !template.includes('{relative}')) {
            return `${base}${template}`;
        }
        return `${base} (${relative})`;
    };

    const meterSegmentClass = (index: number) => {
        if (index >= passwordStrength.score) {
            return `${design.meter.segment} ${design.meter.inactive}`;
        }
        const activeClass = passwordStrength.score >= 3 ? design.meter.success : design.meter.warning;
        return `${design.meter.segment} ${activeClass}`;
    };

    return (
        <div className="max-w-5xl space-y-6">
            <div className={`${design.surface.card} space-y-6`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className={`text-xl font-semibold ${design.text.emphasis}`}>
                            {changePasswordContent?.TITLE || 'Change password'}
                        </h2>
                        <p className={`text-sm ${design.text.secondary}`}>
                            {changePasswordContent?.DESCRIPTION || 'Use at least 12 characters mixing cases, numbers, and symbols.'}
                        </p>
                    </div>
                    <StatusTag tone={passwordStrength.tone} label={passwordStrength.label} icon="lock" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <label className={`flex flex-col gap-1 text-sm ${design.text.secondary}`}>
                        {changePasswordContent?.CURRENT_PASSWORD_LABEL || 'Current password'}
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            className={design.field.base}
                            autoComplete="current-password"
                        />
                    </label>
                    <label className={`flex flex-col gap-1 text-sm ${design.text.secondary}`}>
                        {changePasswordContent?.NEW_PASSWORD_LABEL || 'New password'}
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className={design.field.base}
                            autoComplete="new-password"
                        />
                    </label>
                    <label className={`flex flex-col gap-1 text-sm ${design.text.secondary} md:col-span-2`}>
                        {changePasswordContent?.CONFIRM_PASSWORD_LABEL || 'Confirm new password'}
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className={passwordMismatch ? design.field.invalid : design.field.base}
                            autoComplete="new-password"
                        />
                        {passwordMismatch && (
                            <span className={design.fieldMessage.error}>
                                {changePasswordContent?.MISMATCH_HELPER || 'The new password and confirmation do not match.'}
                            </span>
                        )}
                    </label>
                </div>

                <div className="space-y-2">
                    <div className={`flex items-center gap-2 text-xs ${design.text.secondary}`}>
                        <span>{passwordStrengthCopy?.LABEL || 'Strength indicator'}</span>
                        <div className={design.meter.container}>
                            {[0, 1, 2, 3].map(index => (
                                <span key={index} className={meterSegmentClass(index)} />
                            ))}
                        </div>
                    </div>
                    <ul className={`list-disc list-inside text-xs ${design.text.muted}`}>
                        {(passwordStrengthCopy?.RULES ?? [
                            'At least 12 characters',
                            'Includes upper and lower case letters',
                            'Includes at least one number and symbol',
                        ]).map(rule => (
                            <li key={rule}>{rule}</li>
                        ))}
                    </ul>
                </div>

                <div className={`${design.layout.sectionDivider} flex flex-wrap items-center gap-3`}>
                    <button onClick={handlePasswordChange} disabled={isUpdating} className={design.button.primary}>
                        {isUpdating ? (
                            <>
                                <Icon name="loader-circle" className="h-4 w-4 animate-spin" /> {changePasswordContent?.SUBMIT_LOADING || 'Updating'}
                            </>
                        ) : (
                            changePasswordContent?.SUBMIT || 'Update password'
                        )}
                    </button>
                    <button onClick={handleRevokeSessions} disabled={isRevokingSessions} className={design.button.secondary}>
                        {isRevokingSessions ? (
                            <>
                                <Icon name="loader-circle" className="h-4 w-4 animate-spin" /> {sessionContent?.FORCE_LOGOUT_LOADING || 'Processing'}
                            </>
                        ) : (
                            <>
                                <Icon name="log-out" className="h-4 w-4" /> {sessionContent?.FORCE_LOGOUT || 'Sign out other devices'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className={`${design.surface.card} space-y-4`}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className={`text-xl font-semibold ${design.text.emphasis}`}>
                            {loginHistoryContent?.TITLE || 'Recent sign-in activity'}
                        </h2>
                        <p className={`text-sm ${design.text.secondary}`}>
                            {loginHistoryContent?.DESCRIPTION || 'Review sign-in IPs, devices, and results to spot suspicious behavior.'}
                        </p>
                    </div>
                    <button onClick={fetchLoginHistory} className={design.button.secondary}>
                        <Icon name="refresh-ccw" className="h-4 w-4" /> {loginHistoryContent?.REFRESH || globalContent?.ACTION_LABELS?.REFRESH || 'Refresh'}
                    </button>
                </div>
                <TableContainer
                    table={(
                        <table className="app-table text-sm">
                            <thead className="app-table__head">
                                <tr className="app-table__head-row">
                                    <th className="app-table__header-cell">{loginHistoryContent?.TABLE?.TIME || 'Time'}</th>
                                    <th className="app-table__header-cell">{loginHistoryContent?.TABLE?.IP || 'IP address'}</th>
                                    <th className="app-table__header-cell">{loginHistoryContent?.TABLE?.DEVICE || 'Device'}</th>
                                    <th className="app-table__header-cell app-table__header-cell--center">{loginHistoryContent?.TABLE?.STATUS || 'Status'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <TableLoader colSpan={4} />
                                ) : error ? (
                                    <TableError colSpan={4} message={error} onRetry={fetchLoginHistory} />
                                ) : loginHistory.length > 0 ? (
                                    loginHistory.map(log => (
                                        <tr key={log.id} className="app-table__row">
                                            <td className={`app-table__cell ${design.text.secondary}`}>{formatLoginTimestamp(log.timestamp)}</td>
                                            <td className="app-table__cell">{log.ip}</td>
                                            <td className="app-table__cell">
                                                <span className={`flex items-center gap-2 ${design.text.secondary}`}>
                                                    <Icon name={getDeviceIcon(log.device)} className="h-4 w-4" />
                                                    {log.device}
                                                </span>
                                            </td>
                                            <td className="app-table__cell app-table__cell--center">
                                                <StatusTag dense tone={statusMapping[log.status].tone} label={statusMapping[log.status].label} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="app-table__row">
                                        <td colSpan={4} className={`app-table__cell app-table__cell--center ${design.text.secondary}`}>
                                            {loginHistoryContent?.TABLE?.EMPTY || 'No sign-in records yet.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                    footer={(
                        <Pagination
                            total={total}
                            page={currentPage}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    )}
                />
            </div>
        </div>
    );
};

export default SecuritySettingsPage;