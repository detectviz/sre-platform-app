



import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AppLayout from '@/app/layouts/AppLayout';
import PageWithTabsLayout from '@/app/layouts/PageWithTabsLayout';
import BacktestingPage from '@/features/analysis/pages/analysis/BacktestingPage';
import CapacityPlanningPage from '@/features/analysis/pages/analysis/CapacityPlanningPage';
import LogExplorerPage from '@/features/analysis/pages/analysis/LogExplorerPage';
import AutomationHistoryPage from '@/features/automation/pages/automation/AutomationHistoryPage';
import AutomationPlaybooksPage from '@/features/automation/pages/automation/AutomationPlaybooksPage';
import AutomationTriggersPage from '@/features/automation/pages/automation/AutomationTriggersPage';
import DashboardEditorPage from '@/features/dashboards/pages/dashboards/DashboardEditorPage';
import DashboardListPage from '@/features/dashboards/pages/dashboards/DashboardListPage';
import DashboardTemplatesPage from '@/features/dashboards/pages/dashboards/DashboardTemplatesPage';
import InfrastructureInsightsPage from '@/features/dashboards/pages/dashboards/InfrastructureInsightsPage';
import DashboardViewPage from '@/features/dashboards/pages/DashboardViewPage';
import SREWarRoomPage from '@/features/dashboards/pages/SREWarRoomPage';
import AlertRulePage from '@/features/incidents/pages/incidents/AlertRulePage';
import IncidentListPage from '@/features/incidents/pages/incidents/IncidentListPage';
import SilenceRulePage from '@/features/incidents/pages/incidents/SilenceRulePage';
import PreferenceSettingsPage from '@/features/profile/pages/profile/PreferenceSettingsPage';
import PersonalInfoPage from '@/features/profile/pages/profile/PersonalInfoPage';
import SecuritySettingsPage from '@/features/profile/pages/profile/SecuritySettingsPage';
import AutoDiscoveryPage from '@/features/resources/pages/resources/AutoDiscoveryPage';
import DatasourceManagementPage from '@/features/resources/pages/resources/DatasourceManagementPage';
import ResourceDetailPage from '@/features/resources/pages/resources/ResourceDetailPage';
import ResourceGroupPage from '@/features/resources/pages/resources/ResourceGroupPage';
import ResourceListPage from '@/features/resources/pages/resources/ResourceListPage';
import ResourceOverviewPage from '@/features/resources/pages/resources/ResourceOverviewPage';
import ResourceTopologyPage from '@/features/resources/pages/resources/ResourceTopologyPage';
import AuditLogsPage from '@/features/settings/pages/settings/identity-access/AuditLogsPage';
import PersonnelManagementPage from '@/features/settings/pages/settings/identity-access/PersonnelManagementPage';
import RoleManagementPage from '@/features/settings/pages/settings/identity-access/RoleManagementPage';
import TeamManagementPage from '@/features/settings/pages/settings/identity-access/TeamManagementPage';
import AuthSettingsPage from '@/features/settings/pages/settings/platform/AuthSettingsPage';
import GrafanaSettingsPage from '@/features/settings/pages/settings/platform/GrafanaSettingsPage';
import LayoutSettingsPage from '@/features/settings/pages/settings/platform/LayoutSettingsPage';
import LicensePage from '@/features/settings/pages/settings/platform/LicensePage';
import MailSettingsPage from '@/features/settings/pages/settings/platform/MailSettingsPage';
import TagManagementPage from '@/features/settings/pages/settings/platform/TagManagementPage';
import NotificationChannelPage from '@/features/settings/pages/settings/notification-management/NotificationChannelPage';
import NotificationHistoryPage from '@/features/settings/pages/settings/notification-management/NotificationHistoryPage';
import NotificationStrategyPage from '@/features/settings/pages/settings/notification-management/NotificationStrategyPage';
import { ContentProvider, useContent, useContentSection } from '@/contexts/ContentContext';
import { PageMetadataProvider } from '@/contexts/PageMetadataContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ChartThemeProvider } from '@/contexts/ChartThemeContext';
import { OptionsProvider } from '@/contexts/OptionsContext';
import { UserProvider } from '@/contexts/UserContext';
import { UIConfigProvider, useUIConfig } from '@/contexts/UIConfigContext';
import Icon from '@/shared/components/Icon';
import { ROUTES, buildRoute } from '@/shared/constants/routes';
import { Dashboard, UserPreferences } from '@/shared/types';
import api from '@/services/api';
import { showToast } from '@/services/toast';

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
  return <span className="hidden" aria-hidden="true" />;
};

interface SystemConfig {
  default_dashboard?: string;
}

const DashboardRedirector: React.FC = () => {
  const [defaultDashboardId, setDefaultDashboardId] = useState<string>('sre-war-room');

  useEffect(() => {
    const loadSystemConfig = async () => {
      try {
        const userDefault = localStorage.getItem('default-dashboard');
        if (userDefault) {
          setDefaultDashboardId(userDefault);
          return;
        }

        const { data } = await api.get<SystemConfig>('/system/config');
        setDefaultDashboardId(data.default_dashboard || 'sre-war-room');
      } catch (error) {
        setDefaultDashboardId('sre-war-room');
      }
    };

    loadSystemConfig();
  }, []);

  return <Navigate to={buildRoute.dashboardDetails(defaultDashboardId)} replace />;
};

const AppRoutes: React.FC = () => {
  const { tabConfigs, isLoading: isNavLoading, error: navError } = useUIConfig();
  const { isLoading: isContentLoading, error: contentError } = useContent();
  const pageLayouts = useContentSection('PAGE_LAYOUTS');
  const appContent = useContentSection('APP');

  const error = navError || contentError;
  const isLoading = isNavLoading || isContentLoading;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-400">
        <Icon name="server-crash" className="w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold text-slate-100">{appContent?.LOAD_ERROR_TITLE || 'Application Load Error'}</h1>
        <p className="mt-2 text-slate-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md flex items-center"
        >
          <Icon name="refresh-cw" className="w-4 h-4 mr-2" />
          {appContent?.RELOAD_BUTTON || 'Reload Page'}
        </button>
      </div>
    );
  }

  if (isLoading || !pageLayouts) {
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
          <Route index element={<Navigate to={ROUTES.HOME} replace />} />
          <Route path="home" element={<DashboardRedirector />} />
          <Route path="dashboard/infrastructure-insights" element={<InfrastructureInsightsPage />} />
          <Route path="dashboard/resource-overview" element={<ResourceOverviewPage />} />
          <Route path="dashboard/:dashboardId" element={<DashboardViewPage />} />
          <Route path="sre-war-room" element={<SREWarRoomPage />} />

          <Route path="incidents" element={<PageWithTabsLayout title={pageLayouts.incidents.title} description={pageLayouts.incidents.description} kpi_page_name={pageLayouts.incidents.kpi_page_name} tabs={tabConfigs?.incidents || []} showRefresh />}>
            <Route index element={<IncidentListPage />} />
            <Route path="rules" element={<AlertRulePage />} />
            <Route path="silence" element={<SilenceRulePage />} />
            <Route path=":incident_id" element={<IncidentListPage />} />
          </Route>

          <Route path="resources" element={<PageWithTabsLayout title={pageLayouts.resources.title} description={pageLayouts.resources.description} kpi_page_name={pageLayouts.resources.kpi_page_name} tabs={tabConfigs?.resources || []} />}>
            <Route index element={<Navigate to={ROUTES.RESOURCES_LIST} replace />} />
            <Route path="list" element={<ResourceListPage />} />
            <Route path="list/:resource_id" element={<ResourceListPage />} />
            <Route path=":resource_id" element={<ResourceDetailPage />} />
            <Route path="groups" element={<ResourceGroupPage />} />
            <Route path="datasources" element={<DatasourceManagementPage />} />
            <Route path="discovery" element={<AutoDiscoveryPage />} />
            <Route path="topology" element={<ResourceTopologyPage />} />
          </Route>

          <Route path="dashboards" element={<PageWithTabsLayout title={pageLayouts.dashboards.title} description={pageLayouts.dashboards.description} kpi_page_name={pageLayouts.dashboards.kpi_page_name} tabs={tabConfigs?.dashboards || []} />}>
            <Route index element={<DashboardListPage />} />
            <Route path="templates" element={<DashboardTemplatesPage />} />
            <Route path="new" element={<DashboardEditorPage />} />
          </Route>
          <Route path="dashboards/:dashboardId/edit" element={<DashboardEditorPage />} />

          <Route path="analyzing" element={<PageWithTabsLayout title={pageLayouts.analysis.title} description={pageLayouts.analysis.description} kpi_page_name={pageLayouts.analysis.kpi_page_name} tabs={tabConfigs?.analysis || []} />}>
            <Route index element={<Navigate to={ROUTES.ANALYSIS_LOGS} replace />} />
            <Route path="logs" element={<LogExplorerPage />} />
            <Route path="capacity" element={<CapacityPlanningPage />} />
            <Route path="backtesting" element={<BacktestingPage />} />
          </Route>

          <Route path="automation" element={<PageWithTabsLayout title={pageLayouts.automation.title} description={pageLayouts.automation.description} kpi_page_name={pageLayouts.automation.kpi_page_name} tabs={tabConfigs?.automation || []} />}>
            <Route index element={<AutomationPlaybooksPage />} />
            <Route path="history" element={<AutomationHistoryPage />} />
            <Route path="triggers" element={<AutomationTriggersPage />} />
          </Route>

          <Route path="settings">
            <Route index element={<Navigate to="identity-access-management" replace />} />
            <Route path="identity-access-management" element={<PageWithTabsLayout title={pageLayouts.iam.title} description={pageLayouts.iam.description} kpi_page_name={pageLayouts.iam.kpi_page_name} tabs={tabConfigs?.iam || []} />}>
              <Route index element={<PersonnelManagementPage />} />
              <Route path="teams" element={<TeamManagementPage />} />
              <Route path="roles" element={<RoleManagementPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
            </Route>
            <Route path="notification-management" element={<PageWithTabsLayout title={pageLayouts.notification.title} description={pageLayouts.notification.description} kpi_page_name={pageLayouts.notification.kpi_page_name} tabs={tabConfigs?.notification || []} />}>
              <Route index element={<NotificationStrategyPage />} />
              <Route path="channels" element={<NotificationChannelPage />} />
              <Route path="history" element={<NotificationHistoryPage />} />
            </Route>
            <Route path="platform-settings" element={<PageWithTabsLayout title={pageLayouts.platform_settings.title} description={pageLayouts.platform_settings.description} kpi_page_name={pageLayouts.platform_settings.kpi_page_name} tabs={tabConfigs?.platform_settings || []} />}>
              <Route index element={<TagManagementPage />} />
              <Route path="mail" element={<MailSettingsPage />} />
              <Route path="auth" element={<AuthSettingsPage />} />
              <Route path="layout" element={<LayoutSettingsPage />} />
              <Route path="grafana" element={<GrafanaSettingsPage />} />
              <Route path="license" element={<LicensePage />} />
            </Route>
          </Route>
          <Route path="profile" element={<PageWithTabsLayout title={pageLayouts.profile.title} description={pageLayouts.profile.description} kpi_page_name="profile" tabs={tabConfigs?.profile || []} />}>
            <Route index element={<PersonalInfoPage />} />
            <Route path="security" element={<SecuritySettingsPage />} />
            <Route path="preferences" element={<PreferenceSettingsPage />} />
          </Route>

        </Route>
      </Routes>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <UIConfigProvider>
      <UserProvider>
        <OptionsProvider>
          <PageMetadataProvider>
            <ContentProvider>
              <ChartThemeProvider>
                <ThemeProvider>
                  <AppRoutes />
                </ThemeProvider>
              </ChartThemeProvider>
            </ContentProvider>
          </PageMetadataProvider>
        </OptionsProvider>
      </UserProvider>
    </UIConfigProvider>
  )
}

export default App;