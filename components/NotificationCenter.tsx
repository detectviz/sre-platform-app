import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_NOTIFICATIONS } from '../constants';
import { NotificationItem } from '../types';
import Icon from './Icon';

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
    const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => n.status === 'unread').length;

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
        setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'read' } : n));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
    };

    const getSeverityIcon = (severity: NotificationItem['severity']) => {
        switch (severity) {
            case 'critical': return { icon: 'shield-alert', color: 'text-red-400' };
            case 'warning': return { icon: 'alert-triangle', color: 'text-orange-400' };
            case 'info': return { icon: 'info', color: 'text-sky-400' };
            case 'success': return { icon: 'check-circle', color: 'text-green-400' };
        }
    };

    // Conditionally apply classes to make the badge a circle for single-digit counts
    // and a pill for multi-digit counts for better readability.
    const badgeSizeClasses = unreadCount < 10 ? 'w-4' : 'px-1.5';

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full hover:bg-slate-700/50">
                <Icon name="bell" className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className={`absolute top-[0.125rem] right-[0.125rem] flex items-center justify-center h-4 ${badgeSizeClasses} text-[10px] text-white bg-red-500 rounded-full border-2 border-slate-900`}>
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-50 flex flex-col">
                    <div className="flex justify-between items-center p-3 border-b border-slate-700/50">
                        <h3 className="font-semibold text-white">通知中心</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-xs text-sky-400 hover:text-sky-300">全部標為已讀</button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notif => {
                                const { icon, color } = getSeverityIcon(notif.severity);
                                return (
                                    <Link
                                        key={notif.id}
                                        to={notif.linkUrl || '#'}
                                        onClick={() => handleMarkAsRead(notif.id)}
                                        className="flex items-start p-3 hover:bg-slate-700 border-b border-slate-700/50 last:border-b-0"
                                    >
                                        {notif.status === 'unread' && <div className="w-2 h-2 rounded-full bg-sky-400 mr-3 mt-1.5 shrink-0"></div>}
                                        <div className={`mr-3 ${notif.status === 'read' ? 'ml-5' : ''}`}>
                                            <Icon name={icon} className={`w-4 h-4 mt-1 ${color}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <p className={`text-sm ${notif.status === 'unread' ? 'text-white font-semibold' : 'text-slate-300'}`}>{notif.title}</p>
                                            <p className="text-xs text-slate-400">{notif.description}</p>
                                            <p className="text-xs text-slate-500 mt-1">{timeSince(notif.createdAt)}</p>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm">沒有新的通知</div>
                        )}
                    </div>
                    <div className="p-2 border-t border-slate-700/50 text-center">
                        <Link to="/settings/notification-management/history" onClick={() => setIsOpen(false)} className="text-sm text-sky-400 hover:text-sky-300 w-full block">
                            查看所有通知
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
