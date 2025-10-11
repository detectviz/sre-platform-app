import { useEffect } from 'react';
import { useNavigationRegistry } from '../../../core/components/navigation/NavigationContext';
import { useI18n } from '../../../core/i18n';

const NAV_ITEMS = [
  { id: 'settings', labelKey: 'settings.module.title', path: '/settings', icon: 'cog', permission: { resource: 'settings', action: 'view' } },
  { id: 'iam-personnel', labelKey: 'page.iam.personnel.title', path: '/iam/personnel', icon: 'users', permission: { resource: 'iam', action: 'manage_personnel' } },
  { id: 'resources', labelKey: 'page.resources.list.title', path: '/resources/list', icon: 'server', permission: { resource: 'resources', action: 'view_inventory' } },
  { id: 'insight-log', labelKey: 'page.insight.log.title', path: '/insight/logs', icon: 'file-alt', permission: { resource: 'insight', action: 'view_logs' } },
  { id: 'incidents', labelKey: 'page.incident.list.title', path: '/incidents/list', icon: 'bell', permission: { resource: 'incidents', action: 'view_list' } },
  { id: 'notifications', labelKey: 'page.notification.strategy.title', path: '/notifications/strategies', icon: 'envelope', permission: { resource: 'notifications', action: 'view_history' } },
  { id: 'automation', labelKey: 'page.automation.playbooks.title', path: '/automation/playbooks', icon: 'robot', permission: { resource: 'automation', action: 'view_history' } },
  { id: 'dashboards', labelKey: 'page.dashboards.list.title', path: '/dashboards/list', icon: 'chart-line', permission: { resource: 'dashboards', action: 'view_library' } },
  { id: 'profile', labelKey: 'page.userProfile.title', path: '/profile', icon: 'user-circle', permission: { resource: 'profile', action: 'view' } }
] as const;

export function NavigationBootstrap() {
  const registry = useNavigationRegistry();
  const { t } = useI18n();

  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      registry.register({
        id: item.id,
        label: t(item.labelKey),
        path: item.path,
        icon: item.icon,
        permissions: item.permission ? [item.permission] : undefined
      });
    });
  }, [registry, t]);

  return null;
}
