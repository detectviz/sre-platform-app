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
import { fetchPlaybooks } from '../api/automation-management.api';

/**
 * 模組：自動化腳本管理 (specs/013-automation-management)
 * 職責：管理自動化手冊與安全審核
 * 架構來源：grafana/public/app/features/alerting
 */
export function AutomationPlaybooksPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createAutomationRunbookScene(), []);

  const query = useQuery(['automation/playbooks', tenantId], () => fetchPlaybooks(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'automation/automation-management', scope: 'automation/playbooks', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'automation/automation-management', scope: 'automation/playbooks', tenantId, context: err as object });
      notify.push({ id: 'automation/playbooks-error', message: t('notifications.loadError'), severity: 'error', module: 'automation/automation-management' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'automation/automation-management', scope: 'AutomationPlaybooksPage', tenantId });
    metrics.pageView('AutomationPlaybooksPage', { module: 'automation/automation-management', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.playbooks ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.automationPlaybooks.title')} >
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('AutomationPlaybooksPage:primary', { module: 'automation/automation-management' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'automation/automation-management',
                action: 'configure',
                resource: 'pages.automationPlaybooks.title',
                tenantId,
              });
              notify.push({ id: 'AutomationPlaybooksPage-saved', message: t('notifications.saved'), severity: 'success', module: 'automation/automation-management' });
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
