import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationItem, NotificationOptions, StyleDescriptor } from '../types';
import Icon from './Icon';
import api from '../services/api';
import { showToast } from '../services/toast';
import { useContentSection } from '../contexts/ContentContext';

type NotificationListApiResponse = NotificationItem[] | { items?: NotificationItem[] };

const extractNotifications = (payload: NotificationListApiResponse | null | undefined): NotificationItem[] => {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (payload && Array.isArray(payload.items)) {
        return payload.items;
    }
    return [];
};

const NotificationCenter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [options, setOptions] = useState<NotificationOptions | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false); // Only for dropdown content
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const content = useContentSection('NOTIFICATION_CENTER');
    const navigate = useNavigate();

    const timeSince = useCallback((dateString: string) => {
        if (!content) return '';
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return content.TIME_UNITS.YEAR.replace('{n}', String(Math.floor(interval)));
        interval = seconds / 2592000;
        if (interval > 1) return content.TIME_UNITS.MONTH.replace('{n}', String(Math.floor(interval)));
        interval = seconds / 86400;
        if (interval > 1) return content.TIME_UNITS.DAY.replace('{n}', String(Math.floor(interval)));
        interval = seconds / 3600;
        if (interval > 1) return content.TIME_UNITS.HOUR.replace('{n}', String(Math.floor(interval)));
        interval = seconds / 60;
        if (interval > 1) return content.TIME_UNITS.MINUTE.replace('{n}', String(Math.floor(interval)));
        return content.TIME_UNITS.JUST_NOW;
    }, [content]);

    const unreadCount = Array.isArray(notifications) ? notifications.filter(n => n.status === 'unread').length : 0;

    // Fetch notifications function
    const fetchNotifications = useCallback((setLoading: boolean) => {
        if (!content) return;
        if (setLoading) {
            setIsLoading(true);
        }
        Promise.all([
            api.get<NotificationListApiResponse>('/notifications'),
            api.get<NotificationOptions>('/notifications/options')
        ]).then(([notificationsRes, optionsRes]) => {
            setNotifications(extractNotifications(notificationsRes.data));
            setOptions(optionsRes.data);
        }).catch(err => {
            console.error("Failed to fetch notifications", err);
            showToast(content.TOAST.LOAD_ERROR, 'error');
        }).finally(() => {
            if (setLoading) {
                setIsLoading(false);
            }
        });
    }, [content]);

    // Initial fetch and polling
    useEffect(() => {
        // The parent component (AppLayout) already waits for content to load,
        // so we can be reasonably sure `content` is available here.
        if (content) {
            fetchNotifications(false);
            const interval = setInterval(() => fetchNotifications(false), 30000);
            return () => clearInterval(interval);
        }
    }, [fetchNotifications, content]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOpen = () => {
        if (!isOpen) {
            fetchNotifications(true); // Fetch with loader when opening
        }
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = (id: string) => {
        if (!content) return;
        api.post(`/notifications/${id}/read`)
            .then(() => {
                setNotifications(prev => Array.isArray(prev) ? prev.map(n => n.id === id ? { ...n, status: 'read' } : n) : []);
            })
            .catch(() => showToast(content.TOAST.MARK_ONE_ERROR, 'error'));
    };

    const handleMarkAllAsRead = () => {
        if (!content) return;
        api.post('/notifications/read-all')
            .then(() => {
                setNotifications(prev => Array.isArray(prev) ? prev.map(n => ({ ...n, status: 'read' })) : []);
            })
            .catch(() => showToast(content.TOAST.MARK_ALL_ERROR, 'error'));
    };

    const handleClearAllRead = () => {
        if (!content || !Array.isArray(notifications)) return;
        const readIds = notifications.filter(n => n.status === 'read').map(n => n.id);
        if (readIds.length === 0) return;

        api.post('/notifications/clear-read', { ids: readIds })
            .then(() => {
                setNotifications(prev => Array.isArray(prev) ? prev.filter(n => n.status !== 'read') : []);
                showToast('已清除所有已讀通知', 'success');
            })
            .catch(() => showToast('清除失敗', 'error'));
    };

    const handleNotificationClick = (notification: NotificationItem) => {
        // Mark as read if unread
        if (notification.status === 'unread') {
            handleMarkAsRead(notification.id);
        }

        // Navigate if has link
        if (notification.link_url) {
            setIsOpen(false);
            navigate(notification.link_url);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const getSeverityStyle = (severity: NotificationItem['severity']): StyleDescriptor | undefined => {
        return options?.severities?.find(s => s.value === severity);
    };

    const getSeverityIcon = (severity: NotificationItem['severity']): string => {
        switch (severity) {
            case 'critical': return 'alert-circle';
            case 'warning': return 'alert-triangle';
            case 'info': return 'info';
            case 'success': return 'check-circle';
            default: return 'bell';
        }
    };

    if (!content) {
        return (
            <div className="relative">
                <button className="relative p-2 rounded-full hover:bg-slate-700/50">
                    <Icon name="bell" className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleOpen} className="relative p-2 rounded-full hover:bg-slate-700/50">
                <Icon name="bell" className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[1rem] h-4 px-1 rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-slate-900">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-50 flex flex-col max-h-[70vh] animate-fade-in-down">
                    <div className="flex justify-between items-center p-4 border-b border-slate-700/50 shrink-0">
                        <h3 className="font-semibold text-white">{content.TITLE}</h3>
                        <div className="flex items-center gap-2">
                            {Array.isArray(notifications) && notifications.filter(n => n.status === 'read').length > 0 && (
                                <button onClick={handleClearAllRead} className="text-xs text-slate-400 hover:text-slate-300">
                                    清除已讀
                                </button>
                            )}
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllAsRead} className="text-xs text-sky-400 hover:text-sky-300">
                                    {content.MARK_ALL_AS_READ}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8"><Icon name="loader-circle" className="w-6 h-6 animate-spin text-slate-400" /></div>
                        ) : !Array.isArray(notifications) || notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700/50 text-slate-300">
                                    <Icon name="bell-off" className="h-6 w-6" />
                                </div>
                                <p className="text-sm font-semibold text-slate-100">
                                    {content.EMPTY_STATE_TITLE ?? content.TITLE}
                                </p>
                                <p className="text-xs leading-relaxed text-slate-400">
                                    {content.EMPTY_STATE_DESCRIPTION ?? content.NO_NOTIFICATIONS}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700/30">
                                {notifications.map(n => {
                                    const style = getSeverityStyle(n.severity);
                                    const isExpanded = expandedIds.has(n.id);
                                    const isCritical = n.severity === 'critical';
                                    const descriptionTooLong = n.description.length > 100;
                                    const displayDescription = !isExpanded && descriptionTooLong
                                        ? n.description.substring(0, 100) + '...'
                                        : n.description;

                                    return (
                                        <div
                                            key={n.id}
                                            className={`relative p-4 border-l-4 transition-all cursor-pointer hover:bg-slate-700/20 ${style?.class_name || 'border-slate-600'
                                                } ${n.status === 'unread' ? 'bg-slate-700/30' : ''
                                                } ${isCritical ? 'border-l-[6px]' : ''
                                                }`}
                                            onClick={() => handleNotificationClick(n)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Severity Icon */}
                                                <div className={`shrink-0 mt-0.5 ${isCritical ? 'animate-pulse' : ''}`}>
                                                    <Icon
                                                        name={getSeverityIcon(n.severity)}
                                                        className={`w-5 h-5 ${isCritical ? 'text-red-400' :
                                                            n.severity === 'warning' ? 'text-orange-400' :
                                                                n.severity === 'info' ? 'text-yellow-400' :
                                                                    'text-slate-400'
                                                            }`}
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`font-semibold leading-tight ${isCritical ? 'text-red-400 text-base' :
                                                            n.severity === 'warning' ? 'text-orange-400' :
                                                                n.severity === 'info' ? 'text-yellow-400' :
                                                                    'text-slate-200'
                                                            }`}>
                                                            {n.title}
                                                        </p>
                                                        {n.status === 'unread' && (
                                                            <div className="shrink-0 w-2 h-2 rounded-full bg-sky-400 mt-1.5"></div>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
                                                        {displayDescription}
                                                    </p>

                                                    {descriptionTooLong && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleExpand(n.id);
                                                            }}
                                                            className="text-xs text-sky-400 hover:text-sky-300 mt-1"
                                                        >
                                                            {isExpanded ? '收起' : '展開'}
                                                        </button>
                                                    )}

                                                    <div className="flex items-center justify-between mt-2.5">
                                                        <span className="text-xs text-slate-500">{timeSince(n.created_at)}</span>
                                                        {n.link_url && (
                                                            <span className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                                                                {content.VIEW_DETAILS}
                                                                <Icon name="arrow-right" className="w-3 h-3" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;