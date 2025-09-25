
import React from 'react';
import { Outlet } from 'react-router-dom';
import PageKPIs from '../components/PageKPIs';
import Tabs from '../components/Tabs';
import Icon from '../components/Icon';

const IncidentsPage: React.FC = () => {
    const tabs = [
        { label: '事件列表', path: '/incidents', icon: 'list' },
        { label: '事件規則', path: '/incidents/rules', icon: 'settings' },
        { label: '靜音規則', path: '/incidents/silence', icon: 'bell-off' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-3xl font-bold">事件管理</h1>
                    <p className="text-slate-400 mt-1">監控和處理系統異常事件</p>
                </div>
                <button className="p-2 rounded-full hover:bg-slate-700/50">
                    <Icon name="refresh-cw" className="w-5 h-5" />
                </button>
            </div>
            
            <PageKPIs pageName="Incident Management" />
            
            <Tabs tabs={tabs} />
            
            <div className="mt-6 flex-grow flex flex-col">
                <Outlet />
            </div>
        </div>
    );
};

export default IncidentsPage;
