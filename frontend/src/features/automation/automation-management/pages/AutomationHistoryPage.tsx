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
import { createAutomationRunbookScene } from '../scenes/AutomationRunbookScene';
import { AutomationTimelineTable } from '../components/AutomationTimelineTable';
import { fetchAutomationHistory } from '../api/automation-management.api';

/**
 * 模組：自動化腳本管理 (specs/013-automation-management)
 * 職責：檢視自動化執行紀錄與成功率
 * 架構來源：grafana/public/app/features/alerting
 */
export function AutomationHistoryPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createAutomationRunbookScene(), []);

  const query = useQuery(['automation/history', tenantId], () => fetchAutomationHistory(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'automation/automation-management', scope: 'automation/history', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'automation/automation-management', scope: 'automation/history', tenantId, context: err as object });
      notify.push({ id: 'automation/history-error', message: t('notifications.loadError'), severity: 'error', module: 'automation/automation-management' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'automation/automation-management', scope: 'AutomationHistoryPage', tenantId });
    metrics.pageView('AutomationHistoryPage', { module: 'automation/automation-management', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.runs ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.automationHistory.title')} >
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('AutomationHistoryPage:primary', { module: 'automation/automation-management' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'automation/automation-management',
                action: 'configure',
                resource: 'pages.automationHistory.title',
                tenantId,
              });
              notify.push({ id: 'AutomationHistoryPage-saved', message: t('notifications.saved'), severity: 'success', module: 'automation/automation-management' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <AutomationTimelineTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
