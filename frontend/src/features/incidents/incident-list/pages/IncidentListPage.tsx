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
import { createIncidentTimelineScene } from '../scenes/IncidentTimelineScene';
import { IncidentTable } from '../components/IncidentTable';
import { fetchIncidents } from '../api/incident-list.api';

/**
 * 模組：事件列表管理 (specs/011-incident-list)
 * 職責：管理事件處理、AI 標記與派工
 * 架構來源：grafana/public/app/features/alerting
 */
export function IncidentListPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createIncidentTimelineScene(), []);

  const query = useQuery(['incidents/list', tenantId], () => fetchIncidents(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'incidents/incident-list', scope: 'incidents/list', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'incidents/incident-list', scope: 'incidents/list', tenantId, context: err as object });
      notify.push({ id: 'incidents/list-error', message: t('notifications.loadError'), severity: 'error', module: 'incidents/incident-list' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'incidents/incident-list', scope: 'IncidentListPage', tenantId });
    metrics.pageView('IncidentListPage', { module: 'incidents/incident-list', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.incidents ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.incidentList.title')} description={t('pages.incidentList.description')}>
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('IncidentListPage:primary', { module: 'incidents/incident-list' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'incidents/incident-list',
                action: 'configure',
                resource: 'pages.incidentList.title',
                tenantId,
              });
              notify.push({ id: 'IncidentListPage-saved', message: t('notifications.saved'), severity: 'success', module: 'incidents/incident-list' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <IncidentTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
