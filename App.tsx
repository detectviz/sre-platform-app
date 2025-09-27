

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
import { PageMetadataProvider } from './contexts/PageMetadataContext';
import { UIConfigProvider, useUIConfig } from './contexts/UIConfigContext';
import GrafanaSettingsPage from './pages/settings/platform/GrafanaSettingsPage';
import { UserProvider } from './contexts/UserContext';
import { OptionsProvider } from './contexts/OptionsContext';
import { showToast } from './services/toast';
import { PAGE_CONTENT } from './constants/pages';

const { PAGE_LAYOUTS: pageLayouts, APP: appContent } = PAGE_CONTENT;

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

const AppRoutes: React.FC = () => {
    const { tabConfigs, isLoading, error } = useUIConfig();

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-red-400">
                <Icon name="server-crash" className="w-16 h-16 mb-4" />
                <h1 className="text-3xl font-bold text-slate-100">{appContent.LOAD_ERROR_TITLE}</h1>
                <p className="mt-2 text-slate-400">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md flex items-center"
                >
                    <Icon name="refresh-cw" className="w-4 h-4 mr-2" />
                    {appContent.RELOAD_BUTTON}
                </button>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Icon name="loader-circle" className="w-12 h-12 animate-spin text-slate-500" />
            </div>
        );
    }
    
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
            
            <Route path="incidents" element={<PageWithTabsLayout title={pageLayouts.incidents.title} description={pageLayouts.incidents.description} kpiPageName={pageLayouts.incidents.kpiPageName} tabs={tabConfigs?.incidents || []} showRefresh />}>
               <Route index element={<IncidentListPage />} />
               <Route path="rules" element={<AlertRulePage />} />
               <Route path="silence" element={<SilenceRulePage />} />
               <Route path=":incidentId" element={<IncidentListPage />} />
            </Route>
            
            <Route path="resources" element={<PageWithTabsLayout title={pageLayouts.resources.title} description={pageLayouts.resources.description} kpiPageName={pageLayouts.resources.kpiPageName} tabs={tabConfigs?.resources || []} />}>
              <Route index element={<ResourceListPage />} />
              <Route path="groups" element={<ResourceGroupPage />} />
              <Route path="topology" element={<ResourceTopologyPage />} />
              <Route path=":resourceId" element={<ResourceListPage />} />
            </Route>
  
            <Route path="dashboards" element={<PageWithTabsLayout title={pageLayouts.dashboards.title} description={pageLayouts.dashboards.description} kpiPageName={pageLayouts.dashboards.kpiPageName} tabs={tabConfigs?.dashboards || []} />}>
              <Route index element={<DashboardListPage />} />
              <Route path="templates" element={<DashboardTemplatesPage />} />
              <Route path="new" element={<DashboardEditorPage />} />
              <Route path=":dashboardId/edit" element={<DashboardEditorPage />} />
            </Route>
            
            <Route path="analyzing" element={<PageWithTabsLayout title={pageLayouts.analysis.title} description={pageLayouts.analysis.description} kpiPageName={pageLayouts.analysis.kpiPageName} tabs={tabConfigs?.analysis || []} />}>
              <Route index element={<AnalysisOverviewPage />} />
              <Route path="logs" element={<LogExplorerPage />} />
              <Route path="traces" element={<TraceAnalysisPage />} />
              <Route path="capacity" element={<CapacityPlanningPage />} />
              <Route path="insights" element={<AIInsightsPage />} />
            </Route>
            
            <Route path="automation" element={<PageWithTabsLayout title={pageLayouts.automation.title} description={pageLayouts.automation.description} kpiPageName={pageLayouts.automation.kpiPageName} tabs={tabConfigs?.automation || []} />}>
              <Route index element={<AutomationPlaybooksPage />} />
              <Route path="history" element={<AutomationHistoryPage />} />
              <Route path="triggers" element={<AutomationTriggersPage />} />
            </Route>
            
            <Route path="settings">
              <Route index element={<Navigate to="identity-access-management" replace />} />
              <Route path="identity-access-management" element={<PageWithTabsLayout title={pageLayouts.iam.title} description={pageLayouts.iam.description} kpiPageName={pageLayouts.iam.kpiPageName} tabs={tabConfigs?.iam || []} />}>
                <Route index element={<PersonnelManagementPage />} />
                <Route path="teams" element={<TeamManagementPage />} />
                <Route path="roles" element={<RoleManagementPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
              </Route>
              <Route path="notification-management" element={<PageWithTabsLayout title={pageLayouts.notification.title} description={pageLayouts.notification.description} kpiPageName={pageLayouts.notification.kpiPageName} tabs={tabConfigs?.notification || []} />}>
                <Route index element={<NotificationStrategyPage />} />
                <Route path="channels" element={<NotificationChannelPage />} />
                <Route path="history" element={<NotificationHistoryPage />} />
              </Route>
              <Route path="platform-settings" element={<PageWithTabsLayout title={pageLayouts.platformSettings.title} description={pageLayouts.platformSettings.description} kpiPageName={pageLayouts.platformSettings.kpiPageName} tabs={tabConfigs?.platformSettings || []} />}>
                  <Route index element={<TagManagementPage />} />
                  <Route path="mail" element={<MailSettingsPage />} />
                  <Route path="auth" element={<AuthSettingsPage />} />
                  <Route path="layout" element={<LayoutSettingsPage />} />
                  <Route path="grafana" element={<GrafanaSettingsPage />} />
              </Route>
            </Route>
  
            <Route path="profile" element={<PageWithTabsLayout title={pageLayouts.profile.title} description={pageLayouts.profile.description} kpiPageName={pageLayouts.profile.kpiPageName} tabs={tabConfigs?.profile || []} />}>
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


const App: React.FC = () => {
    return (
        <UIConfigProvider>
            <PageMetadataProvider>
                <UserProvider>
                    <OptionsProvider>
                        <AppRoutes />
                    </OptionsProvider>
                </UserProvider>
            </PageMetadataProvider>
        </UIConfigProvider>
    );
};


const DashboardRedirector: React.FC = () => {
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    useEffect(() => {
        const fetchDefaultDashboard = async () => {
            const defaultDashboardId = localStorage.getItem('default-dashboard') || 'sre-war-room';
            
            // FIX: Removed direct access to `DB` object, which is not available in the frontend context.
            // The logic is simplified to always fetch dashboard details via the API, which correctly handles both built-in and user-created dashboards.
            try {
                // Fetch the specific dashboard by ID for better performance
                const { data: dashboard } = await api.get<Dashboard>(`/dashboards/${defaultDashboardId}`);
                setRedirectPath(dashboard?.path || '/sre-war-room');
            } catch {
                // Fallback on API error (e.g., dashboard was deleted)
                showToast('無法載入預設儀表板，將重導向至 SRE 戰情室。', 'error');
                localStorage.setItem('default-dashboard', 'sre-war-room');
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
