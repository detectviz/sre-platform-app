import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import PageWithTabsLayout from './layouts/PageWithTabsLayout';
import SREWarRoomPage from './pages/SREWarRoomPage';
import DashboardListPage from './pages/dashboards/DashboardListPage';
import DashboardViewPage from './pages/DashboardViewPage';
import IncidentListPage from './pages/incidents/IncidentListPage';
import AlertRulePage from './pages/incidents/AlertRulePage';
import SilenceRulePage from './pages/incidents/SilenceRulePage';
import PlaceholderPage from './pages/PlaceholderPage';
import ResourceListPage from './pages/resources/ResourceListPage';
import ResourceGroupPage from './pages/resources/ResourceGroupPage';
import ResourceTopologyPage from './pages/resources/ResourceTopologyPage';
import AutomationPlaybooksPage from './pages/automation/AutomationPlaybooksPage';
import AutomationHistoryPage from './pages/automation/AutomationHistoryPage';
import AnalysisOverviewPage from './pages/analysis/AnalysisOverviewPage';
import PersonnelManagementPage from './pages/settings/identity-access/PersonnelManagementPage';
import TeamManagementPage from './pages/settings/identity-access/TeamManagementPage';
import RoleManagementPage from './pages/settings/identity-access/RoleManagementPage';
import AuditLogsPage from './pages/settings/identity-access/AuditLogsPage';
import TagManagementPage from './pages/settings/platform/TagManagementPage';
import LayoutSettingsPage from './pages/settings/platform/LayoutSettingsPage';
import AuthSettingsPage from './pages/settings/platform/AuthSettingsPage';
import NotificationStrategyPage from './pages/settings/notification-management/NotificationStrategyPage';
import NotificationChannelPage from './pages/settings/notification-management/NotificationChannelPage';
import NotificationHistoryPage from './pages/settings/notification-management/NotificationHistoryPage';
import PersonalInfoPage from './pages/profile/PersonalInfoPage';
import SecuritySettingsPage from './pages/profile/SecuritySettingsPage';
import PreferenceSettingsPage from './pages/profile/PreferenceSettingsPage';
import { Dashboard } from './types';
import AutomationTriggersPage from './pages/automation/AutomationTriggersPage';
import MailSettingsPage from './pages/settings/platform/MailSettingsPage';
import LogExplorerPage from './pages/analysis/LogExplorerPage';
import TraceAnalysisPage from './pages/analysis/TraceAnalysisPage';
import DashboardTemplatesPage from './pages/dashboards/DashboardTemplatesPage';
import DashboardEditorPage from './pages/dashboards/DashboardEditorPage';
import CapacityPlanningPage from './pages/analysis/CapacityPlanningPage';
import AIInsightsPage from './pages/analysis/AIInsightsPage';
import InfrastructureInsightsPage from './pages/dashboards/InfrastructureInsightsPage';
import api from './services/api';
import Icon from './components/Icon';

// Lucide icons renderer
const RenderIcons = () => {
  const location = useLocation();
  useEffect(() => {
    // @ts-ignore
    if (window.lucide) {
      // @ts-ignore
      window.lucide.createIcons();
    }
  }, [location.pathname]);
  return null;
};

const App: React.FC = () => {
  const incidentTabs = [
    { label: '事件列表', path: '/incidents', icon: 'list' },
    { label: '告警規則', path: '/incidents/rules', icon: 'settings' },
    { label: '靜音規則', path: '/incidents/silence', icon: 'bell-off' },
  ];

  const resourceTabs = [
    { label: '資源列表', path: '/resources' },
    { label: '資源群組', path: '/resources/groups' },
    { label: '拓撲視圖', path: '/resources/topology' },
  ];

  const dashboardTabs = [
    { label: '儀表板列表', path: '/dashboards' },
    { label: '範本', path: '/dashboards/templates' },
  ];

  const analysisTabs = [
    { label: '總覽', path: '/analyzing' },
    { label: '日誌探索', path: '/analyzing/logs' },
    { label: '追蹤分析', path: '/analyzing/traces' },
    { label: '容量規劃', path: '/analyzing/capacity' },
    { label: 'AI 洞察', path: '/analyzing/insights' },
  ];

  const automationTabs = [
    { label: '腳本', path: '/automation' },
    { label: '觸發器', path: '/automation/triggers' },
    { label: '運行歷史', path: '/automation/history' },
  ];
  
  const iamTabs = [
    { label: '人員管理', path: '/settings/identity-access-management' },
    { label: '團隊管理', path: '/settings/identity-access-management/teams' },
    { label: '角色管理', path: '/settings/identity-access-management/roles' },
    { label: '審計日誌', path: '/settings/identity-access-management/audit-logs' },
  ];

  const notificationTabs = [
    { label: '通知策略', path: '/settings/notification-management' },
    { label: '通知管道', path: '/settings/notification-management/channels' },
    { label: '通知歷史', path: '/settings/notification-management/history' },
  ];
  
  const platformSettingsTabs = [
    { label: '標籤管理', path: '/settings/platform-settings' },
    { label: '郵件設定', path: '/settings/platform-settings/mail' },
    { label: '身份驗證', path: '/settings/platform-settings/auth' },
    { label: '版面管理', path: '/settings/platform-settings/layout' },
  ];

  const profileTabs = [
    { label: '個人資訊', path: '/profile' },
    { label: '安全設定', path: '/profile/security' },
    { label: '偏好設定', path: '/profile/preferences' },
  ];

  return (
    <HashRouter>
      <RenderIcons />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to={`/home`} replace />} />
          <Route path="home" element={<DashboardRedirector />} />
          <Route path="dashboard/infrastructure-insights" element={<InfrastructureInsightsPage />} />
          <Route path="dashboard/:dashboardId" element={<DashboardViewPage />} />
          <Route path="sre-war-room" element={<SREWarRoomPage />} />
          
          <Route path="incidents" element={<PageWithTabsLayout title="事件管理" description="監控和處理系統異常事件" kpiPageName="事件管理" tabs={incidentTabs} showRefresh />}>
             <Route index element={<IncidentListPage />} />
             <Route path="rules" element={<AlertRulePage />} />
             <Route path="silence" element={<SilenceRulePage />} />
             <Route path=":incidentId" element={<IncidentListPage />} />
          </Route>
          
          <Route path="resources" element={<PageWithTabsLayout title="資源管理" description="探索、組織與管理您的所有基礎設施資源" kpiPageName="資源管理" tabs={resourceTabs} />}>
            <Route index element={<ResourceListPage />} />
            <Route path="groups" element={<ResourceGroupPage />} />
            <Route path="topology" element={<ResourceTopologyPage />} />
            <Route path=":resourceId" element={<ResourceListPage />} />
          </Route>

          <Route path="dashboards" element={<PageWithTabsLayout title="儀表板管理" description="統一的系統監控與業務洞察儀表板入口" kpiPageName="儀表板管理" tabs={dashboardTabs} />}>
            <Route index element={<DashboardListPage />} />
            <Route path="templates" element={<DashboardTemplatesPage />} />
            <Route path="new" element={<DashboardEditorPage />} />
            <Route path=":dashboardId/edit" element={<DashboardEditorPage />} />
          </Route>
          
          <Route path="analyzing" element={<PageWithTabsLayout title="分析中心" description="深入了解系統趨勢、效能瓶頸和運營數據" kpiPageName="分析中心" tabs={analysisTabs} />}>
            <Route index element={<AnalysisOverviewPage />} />
            <Route path="logs" element={<LogExplorerPage />} />
            <Route path="traces" element={<TraceAnalysisPage />} />
            <Route path="capacity" element={<CapacityPlanningPage />} />
            <Route path="insights" element={<AIInsightsPage />} />
          </Route>
          
          <Route path="automation" element={<PageWithTabsLayout title="自動化中心" description="提供自動化腳本管理、排程配置和執行追蹤功能" kpiPageName="自動化中心" tabs={automationTabs} />}>
            <Route index element={<AutomationPlaybooksPage />} />
            <Route path="history" element={<AutomationHistoryPage />} />
            <Route path="triggers" element={<AutomationTriggersPage />} />
          </Route>
          
          <Route path="settings">
            <Route index element={<Navigate to="identity-access-management" replace />} />
            <Route path="identity-access-management" element={<PageWithTabsLayout title="身份與存取管理" description="統一管理身份認證、存取權限和組織架構配置" kpiPageName="身份與存取管理" tabs={iamTabs} />}>
              <Route index element={<PersonnelManagementPage />} />
              <Route path="teams" element={<TeamManagementPage />} />
              <Route path="roles" element={<RoleManagementPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
            </Route>
            <Route path="notification-management" element={<PageWithTabsLayout title="通知管理" description="提供統一的通知策略配置、管道管理和歷史記錄查詢功能" kpiPageName="通知管理" tabs={notificationTabs} />}>
              <Route index element={<NotificationStrategyPage />} />
              <Route path="channels" element={<NotificationChannelPage />} />
              <Route path="history" element={<NotificationHistoryPage />} />
            </Route>
            <Route path="platform-settings" element={<PageWithTabsLayout title="平台設定" description="提供系統全域配置管理，包含標籤、郵件、身份驗證等功能" kpiPageName="平台設定" tabs={platformSettingsTabs} />}>
                <Route index element={<TagManagementPage />} />
                <Route path="mail" element={<MailSettingsPage />} />
                <Route path="auth" element={<AuthSettingsPage />} />
                <Route path="layout" element={<LayoutSettingsPage />} />
            </Route>
          </Route>

          <Route path="profile" element={<PageWithTabsLayout title="個人設定" description="提供用戶個人資訊管理、偏好設定和安全配置功能" kpiPageName="個人設定" tabs={profileTabs} />}>
            <Route index element={<PersonalInfoPage />} />
            <Route path="security" element={<SecuritySettingsPage />} />
            <Route path="preferences" element={<PreferenceSettingsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};


const DashboardRedirector: React.FC = () => {
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    useEffect(() => {
        const fetchDefaultDashboard = async () => {
            const defaultDashboardId = localStorage.getItem('default-dashboard') || 'sre-war-room';
            try {
                // Fetch all dashboards to find the correct path.
                // This is acceptable for a mock API with few items.
                const { data } = await api.get<{ items: Dashboard[], total: number }>('/dashboards', { params: { page: 1, page_size: 100 } });
                const dashboard = data.items.find(d => d.id === defaultDashboardId);
                setRedirectPath(dashboard?.path || '/sre-war-room');
            } catch {
                // Fallback on API error
                setRedirectPath('/sre-war-room');
            }
        };

        fetchDefaultDashboard();
    }, []);

    if (!redirectPath) {
        return (
            <div className="flex items-center justify-center h-full">
                <Icon name="loader-circle" className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return <Navigate to={redirectPath} replace />;
};

export default App;