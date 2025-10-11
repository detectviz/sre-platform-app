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
import { createResourceTopologyScene } from '../scenes/ResourceTopologyScene';
import { ResourceInventoryTable } from '../components/ResourceInventoryTable';
import { fetchResources } from '../api/resources-management.api';

/**
 * 模組：資源管理 (specs/007-resources-management)
 * 職責：視覺化資源拓撲與依賴關係
 * 架構來源：grafana/public/app/features/explore
 */
export function ResourceTopologyPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createResourceTopologyScene(), []);

  const query = useQuery(['resources/topology', tenantId], () => fetchResources(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'resources/resources-management', scope: 'resources/topology', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'resources/resources-management', scope: 'resources/topology', tenantId, context: err as object });
      notify.push({ id: 'resources/topology-error', message: t('notifications.loadError'), severity: 'error', module: 'resources/resources-management' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'resources/resources-management', scope: 'ResourceTopologyPage', tenantId });
    metrics.pageView('ResourceTopologyPage', { module: 'resources/resources-management', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.topology ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.resourceTopology.title')} >
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('ResourceTopologyPage:primary', { module: 'resources/resources-management' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'resources/resources-management',
                action: 'configure',
                resource: 'pages.resourceTopology.title',
                tenantId,
              });
              notify.push({ id: 'ResourceTopologyPage-saved', message: t('notifications.saved'), severity: 'success', module: 'resources/resources-management' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <ResourceInventoryTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
