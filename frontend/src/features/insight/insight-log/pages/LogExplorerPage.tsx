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
import { createLogInsightScene } from '../scenes/LogInsightScene';
import { LogInsightTable } from '../components/LogInsightTable';
import { fetchLogInsights } from '../api/insight-log.api';

/**
 * 模組：日誌洞察分析 (specs/008-insight-log)
 * 職責：探索日誌查詢並標記異常
 * 架構來源：grafana/public/app/features/logs
 */
export function LogExplorerPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createLogInsightScene(), []);

  const query = useQuery(['insight/logs', tenantId], () => fetchLogInsights(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'insight/insight-log', scope: 'insight/logs', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'insight/insight-log', scope: 'insight/logs', tenantId, context: err as object });
      notify.push({ id: 'insight/logs-error', message: t('notifications.loadError'), severity: 'error', module: 'insight/insight-log' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'insight/insight-log', scope: 'LogExplorerPage', tenantId });
    metrics.pageView('LogExplorerPage', { module: 'insight/insight-log', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.insights ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.logExplorer.title')} description={t('pages.logExplorer.description')}>
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('LogExplorerPage:primary', { module: 'insight/insight-log' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'insight/insight-log',
                action: 'configure',
                resource: 'pages.logExplorer.title',
                tenantId,
              });
              notify.push({ id: 'LogExplorerPage-saved', message: t('notifications.saved'), severity: 'success', module: 'insight/insight-log' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <LogInsightTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
