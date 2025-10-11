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
import { createIncidentRulesScene } from '../scenes/IncidentRulesScene';
import { RuleLibraryTable } from '../components/RuleLibraryTable';
import { fetchSilenceRules } from '../api/incident-rules.api';

/**
 * 模組：事件規則配置 (specs/010-incident-rules)
 * 職責：維護靜音策略與審批流程
 * 架構來源：grafana/public/app/features/alerting
 */
export function SilenceRulePage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createIncidentRulesScene(), []);

  const query = useQuery(['incidents/silence', tenantId], () => fetchSilenceRules(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'incidents/incident-rules', scope: 'incidents/silence', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'incidents/incident-rules', scope: 'incidents/silence', tenantId, context: err as object });
      notify.push({ id: 'incidents/silence-error', message: t('notifications.loadError'), severity: 'error', module: 'incidents/incident-rules' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'incidents/incident-rules', scope: 'SilenceRulePage', tenantId });
    metrics.pageView('SilenceRulePage', { module: 'incidents/incident-rules', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.silences ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.silenceRule.title')} description={t('pages.silenceRule.description')}>
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('SilenceRulePage:primary', { module: 'incidents/incident-rules' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'incidents/incident-rules',
                action: 'configure',
                resource: 'pages.silenceRule.title',
                tenantId,
              });
              notify.push({ id: 'SilenceRulePage-saved', message: t('notifications.saved'), severity: 'success', module: 'incidents/incident-rules' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <RuleLibraryTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
