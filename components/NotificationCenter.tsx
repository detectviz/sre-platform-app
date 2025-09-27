import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { NotificationItem, NotificationOptions, StyleDescriptor } from '../types';
import Icon from './Icon';
import api from '../services/api';
import { showToast } from '../services/toast';

const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " 年前";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " 個月前";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " 天前";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " 小時前";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " 分鐘前";
    return "剛剛";
};

const NotificationCenter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [options, setOptions] = useState<NotificationOptions | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false); // Only for dropdown content

    const unreadCount = notifications.filter(n => n.status === 'unread').length;

    // Fetch notifications function
    const fetchNotifications = useCallback((setLoading: boolean) => {
        if (setLoading) {
            setIsLoading(true);
        }
        Promise.all([
            api.get<NotificationItem[]>('/notifications'),
            api.get<NotificationOptions>('/notifications/options')
        ]).then(([notificationsRes, optionsRes]) => {
            setNotifications(notificationsRes.data);
            setOptions(optionsRes.data);
        // FIX: Correctly handle promise rejection and complete the catch block syntax.
        }).catch(err => {
            console.error("Failed to fetch notifications", err);
            showToast('無法載入通知。', 'error');
        }).finally(() => {
            if (setLoading) {
                setIsLoading(false);
            }
        });
    }, []);

    // Initial fetch and polling
    useEffect(() => {
        fetchNotifications(false);
        const interval = setInterval(() => fetchNotifications(false), 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

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
        api.post(`/notifications/${id}/read`)
            .then(() => {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
            })
            .catch(() => showToast('Failed to mark notification as read.', 'error'));
    };

    const handleMarkAllAsRead = () => {
        api.post('/notifications/read-all')
            .then(() => {
                setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
            })
            .catch(() => showToast('Failed to mark all as read.', 'error'));
    };

    const getSeverityStyle = (severity: NotificationItem['severity']): StyleDescriptor | undefined => {
        return options?.severities?.find(s => s.value === severity);
    };

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
                        <h3 className="font-semibold text-white">通知中心</h3>
                        {unreadCount > 0 && <button onClick={handleMarkAllAsRead} className="text-xs text-sky-400 hover:text-sky-300">全部標示為已讀</button>}
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8"><Icon name="loader-circle" className="w-6 h-6 animate-spin text-slate-400" /></div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center p-8 text-slate-400">沒有新通知</div>
                        ) : (
                            <div>
                                {notifications.map(n => {
                                    const style = getSeverityStyle(n.severity);
                                    return (
                                        <div key={n.id} className={`p-4 border-l-4 ${style?.className || 'border-slate-600'} ${n.status === 'unread' ? 'bg-slate-700/30' : ''}`}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-grow">
                                                    <p className={`font-semibold ${style?.className?.replace(/bg-\w+-\d+\/\d+/, '').replace(/border-\w+-\d+/, '')}`}>{n.title}</p>
                                                    <p className="text-sm text-slate-300 mt-1">{n.description}</p>
                                                    <div className="text-xs text-slate-500 mt-2 flex items-center">
                                                        <span>{timeSince(n.createdAt)}</span>
                                                        {n.linkUrl && <Link to={n.linkUrl} className="ml-2 text-sky-400 hover:underline">查看詳情</Link>}
                                                    </div>
                                                </div>
                                                {n.status === 'unread' && (
                                                    <button onClick={() => handleMarkAsRead(n.id)} className="p-1.5 rounded-full hover:bg-slate-600 shrink-0 ml-2" title="標示為已讀">
                                                        <Icon name="check" className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                )}
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

// FIX: Add default export to make the component available for import in other modules.
export default NotificationCenter;