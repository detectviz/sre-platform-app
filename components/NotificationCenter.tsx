import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { NotificationItem } from '../types';
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
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false); // Only for dropdown content

    const unreadCount = notifications.filter(n => n.status === 'unread').length;

    // Fetch notifications function
    const fetchNotifications = useCallback((setLoading: boolean) => {
        if (setLoading) {
            setIsLoading(true);
        }
        api.get<NotificationItem[]>('/notifications')
            .then(res => {
                setNotifications(res.data);
            })
            .catch(err => console.error("Failed to fetch notifications", err))
            .finally(() => {
                if (setLoading) {
                    setIsLoading(false);
                }
            });
    }, []);

    // Effect for polling
    useEffect(() => {
        fetchNotifications(false); // Initial fetch without loading spinner
        const interval = setInterval(() => fetchNotifications(false), 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Effect to handle dropdown opening
    useEffect(() => {
        if (isOpen) {
            fetchNotifications(true); // Fetch with loading spinner when opened
        }
    }, [isOpen, fetchNotifications]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMarkAsRead = (id: string) => {
        const originalNotifications = [...notifications];
        // Optimistic update
        setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'read' } : n));
        
        // API call
        api.post(`/notifications/${id}/read`).catch(err => {
            console.error("Failed to mark notification as read:", err);
            showToast('無法將通知標為已讀。', 'error');
            // Revert on error
            setNotifications(originalNotifications);
        });
    };

    const handleMarkAllAsRead = () => {
        const originalNotifications = [...notifications];
        // Optimistic update
        setNotifications(notifications.map(n => ({ ...n, status: 'read' })));

        // API call
        api.post('/notifications/read-all').catch(err => {
            console.error("Failed to mark all as read:", err);
            showToast('無法將所有通知標為已讀。', 'error');
            // Revert on error
            setNotifications(originalNotifications);
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-slate-700/50">
                <div className="relative">
                    <Icon name="bell" className="w-5 h-5 text-slate-300" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold border-2 border-slate-900">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-50 flex flex-col animate-fade-in-down" style={{ maxHeight: '80vh' }}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-700/50 shrink-0">
                        <h3 className="font-semibold text-white">通知中心</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-sm text-sky-400 hover:text-sky-300">全部標為已讀</button>
                        )}
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-10">
                                <Icon name="loader-circle" className="w-6 h-6 animate-spin text-slate-400" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center p-10 text-slate-400">
                                <Icon name="bell-off" className="w-12 h-12 mx-auto mb-2" />
                                <p>沒有新的通知</p>
                            </div>
                        ) : (
                            <ul>
                                {notifications.map(n => {
                                    const severityColors = {
                                        critical: 'border-red-500',
                                        warning: 'border-yellow-500',
                                        info: 'border-sky-500',
                                        success: 'border-green-500'
                                    };
                                    return (
                                        <li key={n.id} className={`p-4 hover:bg-slate-700/50 border-l-4 ${n.status === 'unread' ? severityColors[n.severity] : 'border-transparent'}`}>
                                            <Link to={n.linkUrl || '#'} className="block" onClick={() => handleMarkAsRead(n.id)}>
                                                <div className="flex justify-between items-start">
                                                    <p className="font-semibold text-white">{n.title}</p>
                                                    {n.status === 'unread' && <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0 ml-2 mt-1.5"></div>}
                                                </div>
                                                <p className="text-sm text-slate-300">{n.description}</p>
                                                <p className="text-xs text-slate-500 mt-1">{timeSince(n.createdAt)}</p>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                     <div className="p-2 border-t border-slate-700/50 text-center shrink-0">
                        <Link to="/settings/notification-management/history" onClick={() => setIsOpen(false)} className="text-sm font-medium text-sky-400 hover:text-sky-300">查看所有通知</Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;