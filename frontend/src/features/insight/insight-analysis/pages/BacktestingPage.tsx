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
import { createInsightForecastScene } from '../scenes/InsightForecastScene';
import { InsightForecastTable } from '../components/InsightForecastTable';
import { fetchBacktesting } from '../api/insight-analysis.api';

/**
 * 模組：智慧分析與預測 (specs/009-insight-analysis)
 * 職責：回測策略並分析命中率
 * 架構來源：grafana/public/app/features/explore
 */
export function BacktestingPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createInsightForecastScene(), []);

  const query = useQuery(['insight/backtesting', tenantId], () => fetchBacktesting(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'insight/insight-analysis', scope: 'insight/backtesting', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'insight/insight-analysis', scope: 'insight/backtesting', tenantId, context: err as object });
      notify.push({ id: 'insight/backtesting-error', message: t('notifications.loadError'), severity: 'error', module: 'insight/insight-analysis' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'insight/insight-analysis', scope: 'BacktestingPage', tenantId });
    metrics.pageView('BacktestingPage', { module: 'insight/insight-analysis', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.runs ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.backtesting.title')} description={t('pages.backtesting.description')}>
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('BacktestingPage:primary', { module: 'insight/insight-analysis' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'insight/insight-analysis',
                action: 'configure',
                resource: 'pages.backtesting.title',
                tenantId,
              });
              notify.push({ id: 'BacktestingPage-saved', message: t('notifications.saved'), severity: 'success', module: 'insight/insight-analysis' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <InsightForecastTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
