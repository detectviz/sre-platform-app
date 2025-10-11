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
import { createGrafanaBridgeScene } from '../scenes/GrafanaBridgeScene';
import { GrafanaProxyTable } from '../components/GrafanaProxyTable';
import { fetchGrafanaInstances } from '../api/platform-grafana.api';

/**
 * 模組：Grafana 平台整合 (specs/006-platform-grafana)
 * 職責：整合 Grafana Proxy、API 金鑰與租戶隔離
 * 架構來源：grafana/public/app/features/admin
 */
export function GrafanaSettingsPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createGrafanaBridgeScene(), []);

  const query = useQuery(['grafana/settings', tenantId], () => fetchGrafanaInstances(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'settings/platform-grafana', scope: 'grafana/settings', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'settings/platform-grafana', scope: 'grafana/settings', tenantId, context: err as object });
      notify.push({ id: 'grafana/settings-error', message: t('notifications.loadError'), severity: 'error', module: 'settings/platform-grafana' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'settings/platform-grafana', scope: 'GrafanaSettingsPage', tenantId });
    metrics.pageView('GrafanaSettingsPage', { module: 'settings/platform-grafana', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.instances ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.grafanaSettings.title')} description={t('pages.grafanaSettings.description')}>
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('GrafanaSettingsPage:primary', { module: 'settings/platform-grafana' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'settings/platform-grafana',
                action: 'configure',
                resource: 'pages.grafanaSettings.title',
                tenantId,
              });
              notify.push({ id: 'GrafanaSettingsPage-saved', message: t('notifications.saved'), severity: 'success', module: 'settings/platform-grafana' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <GrafanaProxyTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
