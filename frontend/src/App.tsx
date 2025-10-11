import { Suspense, useMemo, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { getTheme2, Spinner, ThemeProvider2 } from '@grafana/ui';
import { createAppRouter, registerModuleRoutes, settingsModuleRoutes, navigationWorkbenchRoutes } from './routes';
import { PageShell } from '@core/components/layout/PageShell';
import { NavHeader } from '@core/components/navigation/NavHeader';
import { NavSidebar } from '@core/components/navigation/NavSidebar';
import { NavigationProvider, useNavigation } from '@core/components/navigation/NavigationContext';
import { NavigationLink } from '@core/components/navigation/NavigationContext';
import { useEffect } from 'react';
import { MODULE_IDS, RBAC_RESOURCES } from '@core/constants/modules';
import { AuthProvider } from '@core/contexts/AuthContext';
import { metrics } from '@core/services/metrics';

const defaultNavLinks: NavigationLink[] = [
  {
    id: MODULE_IDS.DASHBOARDS,
    path: '/dashboards/catalog',
    titleKey: 'nav.dashboards',
    icon: 'dashboard',
    order: 0,
    resource: RBAC_RESOURCES.DASHBOARDS,
    action: 'read',
  },
  {
    id: MODULE_IDS.RESOURCES,
    path: '/resources/list',
    titleKey: 'nav.resources',
    icon: 'server',
    order: 1,
    resource: RBAC_RESOURCES.RESOURCES,
    action: 'read',
  },
  {
    id: MODULE_IDS.INSIGHT_LOG,
    path: '/insight/logs',
    titleKey: 'nav.insight',
    icon: 'chart-line',
    order: 2,
    resource: RBAC_RESOURCES.RESOURCES,
    action: 'read',
  },
  {
    id: MODULE_IDS.INCIDENT_LIST,
    path: '/incidents/list',
    titleKey: 'nav.incidents',
    icon: 'bell',
    order: 3,
    resource: RBAC_RESOURCES.INCIDENTS,
    action: 'read',
  },
  {
    id: MODULE_IDS.NOTIFICATION,
    path: '/notifications/strategies',
    titleKey: 'nav.notification',
    icon: 'envelope',
    order: 4,
    resource: RBAC_RESOURCES.NOTIFICATION,
    action: 'read',
  },
  {
    id: MODULE_IDS.AUTOMATION,
    path: '/automation/playbooks',
    titleKey: 'nav.automation',
    icon: 'bolt',
    order: 5,
    resource: RBAC_RESOURCES.AUTOMATION,
    action: 'read',
  },
  {
    id: MODULE_IDS.AUTH,
    path: '/settings/auth',
    titleKey: 'nav.settings',
    icon: 'cog',
    order: 6,
    resource: RBAC_RESOURCES.SETTINGS,
    action: 'read',
  },
  {
    id: MODULE_IDS.IAM,
    path: '/iam/personnel',
    titleKey: 'nav.iam',
    icon: 'users-alt',
    order: 7,
    resource: RBAC_RESOURCES.NAVIGATION,
    action: 'read',
  },
  {
    id: MODULE_IDS.PROFILE,
    path: '/profile/info',
    titleKey: 'nav.profile',
    icon: 'user',
    order: 8,
    resource: RBAC_RESOURCES.PROFILE,
    action: 'read',
  },
];

function NavigationInitializer() {
  const { register } = useNavigation();

  useEffect(() => {
    register(defaultNavLinks);
    metrics.pageView('navigation:init', { module: 'core' });
  }, [register]);

  return null;
}

export default function App() {
  const router = useMemo(() => {
    settingsModuleRoutes.forEach((route) => {
      registerModuleRoutes(route.moduleId, [route]);
    });
    navigationWorkbenchRoutes.forEach((route) => {
      registerModuleRoutes(route.moduleId, [route]);
    });
    return createAppRouter();
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ThemeProvider2 theme={getTheme2()}>
      <AuthProvider>
        <NavigationProvider>
          <NavigationInitializer />
          <PageShell
            header={<NavHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />}
            sidebar={<NavSidebar isOpen={sidebarOpen} />}
          >
            <Suspense fallback={<Spinner size={32} />}>
              <RouterProvider router={router} />
            </Suspense>
          </PageShell>
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider2>
  );
}
