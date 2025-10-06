import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useContent } from '@/contexts/ContentContext';
import { useOptions } from '@/contexts/OptionsContext';
import { ROUTES } from '@/shared/constants/routes';
import Icon from '@/shared/components/Icon';
import StatusTag from '@/shared/components/StatusTag';
import api from '@/services/api';
import { DashboardTemplate } from '@/shared/types';

const DashboardTemplatesPage: React.FC = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { options } = useOptions();
    const { content } = useContent();
    const pageContent = content?.DASHBOARD_TEMPLATES;

    useEffect(() => {
        setIsLoading(true);
        api.get<DashboardTemplate[]>('/dashboards/templates')
            .then(res => setTemplates(res.data))
            .catch(err => console.error('Failed to fetch dashboard templates', err))
            .finally(() => setIsLoading(false));
    }, []);

    const categoryDescriptorMap = useMemo(() => {
        const descriptors = options?.dashboards?.categories ?? [];
        return descriptors.reduce<Record<string, typeof descriptors[number]>>((acc, descriptor) => {
            acc[descriptor.value] = descriptor;
            return acc;
        }, {});
    }, [options]);

    const handleUseTemplate = (template: DashboardTemplate) => {
        navigate(ROUTES.DASHBOARDS_NEW, { state: { template } });
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Icon name="loader-circle" className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!templates.length) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <Icon name="layout-dashboard" className="h-16 w-16 text-slate-500" />
                <div className="space-y-1">
                    <p className="text-lg font-semibold text-slate-100">暫無可用的儀表板範本</p>
                    <p className="text-sm text-slate-400">請聯絡系統管理員或稍後再試。</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => {
                    const categoryDescriptor = categoryDescriptorMap[template.category];
                    return (
                        <article
                            key={template.id}
                            className="group flex h-full flex-col rounded-xl border border-slate-700/60 bg-slate-900/40 p-6 shadow-sm backdrop-blur transition-all duration-200 hover:border-sky-500/50"
                        >
                            <div className="flex flex-1 flex-col gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300">
                                        <Icon name={template.icon} className="h-6 w-6" />
                                    </div>
                                    <StatusTag
                                        dense
                                        className={categoryDescriptor?.class_name}
                                        label={categoryDescriptor?.label ?? template.category}
                                        tooltip={`${categoryDescriptor?.label ?? template.category}｜${template.category}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white" title={template.name}>
                                        {template.name}
                                    </h3>
                                    <p className="text-sm leading-6 text-slate-400" title={template.description}>
                                        {template.description}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => handleUseTemplate(template)}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                                >
                                    <Icon name="plus-circle" className="h-4 w-4" />
                                    {pageContent?.USE_TEMPLATE ?? '使用此範本'}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardTemplatesPage;