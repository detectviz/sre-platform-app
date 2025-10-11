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
import { fetchAlertRules } from '../api/incident-rules.api';

/**
 * 模組：事件規則配置 (specs/010-incident-rules)
 * 職責：配置與驗證告警規則與閾值
 * 架構來源：grafana/public/app/features/alerting
 */
export function AlertRulePage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createIncidentRulesScene(), []);

  const query = useQuery(['incidents/rules', tenantId], () => fetchAlertRules(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'incidents/incident-rules', scope: 'incidents/rules', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'incidents/incident-rules', scope: 'incidents/rules', tenantId, context: err as object });
      notify.push({ id: 'incidents/rules-error', message: t('notifications.loadError'), severity: 'error', module: 'incidents/incident-rules' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'incidents/incident-rules', scope: 'AlertRulePage', tenantId });
    metrics.pageView('AlertRulePage', { module: 'incidents/incident-rules', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.rules ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.alertRule.title')} description={t('pages.alertRule.description')}>
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('AlertRulePage:primary', { module: 'incidents/incident-rules' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'incidents/incident-rules',
                action: 'configure',
                resource: 'pages.alertRule.title',
                tenantId,
              });
              notify.push({ id: 'AlertRulePage-saved', message: t('notifications.saved'), severity: 'success', module: 'incidents/incident-rules' });
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
