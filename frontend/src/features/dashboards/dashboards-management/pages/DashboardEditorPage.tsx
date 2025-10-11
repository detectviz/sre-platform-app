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
import { createSreDashboardScene } from '../scenes/SreDashboardScene';
import { DashboardCatalogTable } from '../components/DashboardCatalogTable';
import { fetchDashboardDefinitions } from '../api/dashboards-management.api';

/**
 * 模組：儀表板管理 (specs/014-dashboards-management)
 * 職責：編輯儀表板設定與版本
 * 架構來源：grafana/public/app/features/dashboard
 */
export function DashboardEditorPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createSreDashboardScene(), []);

  const query = useQuery(['dashboards/editor', tenantId], () => fetchDashboardDefinitions(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'dashboards/dashboards-management', scope: 'dashboards/editor', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'dashboards/dashboards-management', scope: 'dashboards/editor', tenantId, context: err as object });
      notify.push({ id: 'dashboards/editor-error', message: t('notifications.loadError'), severity: 'error', module: 'dashboards/dashboards-management' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'dashboards/dashboards-management', scope: 'DashboardEditorPage', tenantId });
    metrics.pageView('DashboardEditorPage', { module: 'dashboards/dashboards-management', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.dashboards ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.dashboardEditor.title')} >
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('DashboardEditorPage:primary', { module: 'dashboards/dashboards-management' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'dashboards/dashboards-management',
                action: 'configure',
                resource: 'pages.dashboardEditor.title',
                tenantId,
              });
              notify.push({ id: 'DashboardEditorPage-saved', message: t('notifications.saved'), severity: 'success', module: 'dashboards/dashboards-management' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <DashboardCatalogTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
