import { useEffect, useMemo } from 'react';
import { Button, Page, PageHeader, PageToolbar } from '@grafana/ui';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@core/i18n';
import { logging } from '@core/services/logging';
import { metrics } from '@core/services/metrics';
import { notify } from '@core/services/notify';
import { audit } from '@core/services/audit';
import { useAuth } from '@core/contexts/AuthContext';
import { ScenePreview } from '@core/components/layout/ScenePreview';
import { createNavigationModelScene } from '../scenes/NavigationModelScene';
import { NavigationDraftDrawer } from '../components/NavigationDraftDrawer';
import { fetchNavigationTree } from '../api/platform-navigation.api';

/**
 * 模組：平台導覽管理 (specs/003-platform-navigation)
 * 職責：定義平台導覽節點與權限映射
 * 架構來源：grafana/public/app/core/components/AppChrome
 */
export function NavigationSettingsPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createNavigationModelScene(), []);

  const query = useQuery(['navigation/settings', tenantId], () => fetchNavigationTree(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'settings/platform-navigation', scope: 'navigation/settings', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'settings/platform-navigation', scope: 'navigation/settings', tenantId, context: err as object });
      notify.push({ id: 'navigation/settings-error', message: t('notifications.loadError'), severity: 'error', module: 'settings/platform-navigation' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'settings/platform-navigation', scope: 'NavigationSettingsPage', tenantId });
    metrics.pageView('NavigationSettingsPage', { module: 'settings/platform-navigation', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.items ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.navigationSettings.title')} description={t('pages.navigationSettings.description')}>
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('NavigationSettingsPage:primary', { module: 'settings/platform-navigation' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'settings/platform-navigation',
                action: 'configure',
                resource: 'pages.navigationSettings.title',
                tenantId,
              });
              notify.push({ id: 'NavigationSettingsPage-saved', message: t('notifications.saved'), severity: 'success', module: 'settings/platform-navigation' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <NavigationDraftDrawer rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
