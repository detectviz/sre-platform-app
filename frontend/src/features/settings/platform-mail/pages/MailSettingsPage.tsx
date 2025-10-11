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
import { createMailPipelineScene } from '../scenes/MailPipelineScene';
import { MailProviderTable } from '../components/MailProviderTable';
import { fetchMailProviders } from '../api/platform-mail.api';

/**
 * 模組：郵件通知管理 (specs/004-platform-mail)
 * 職責：維護郵件提供者、佈建金鑰與重試策略
 * 架構來源：grafana/public/app/features/alerting
 */
export function MailSettingsPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createMailPipelineScene(), []);

  const query = useQuery(['mail/settings', tenantId], () => fetchMailProviders(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'settings/platform-mail', scope: 'mail/settings', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'settings/platform-mail', scope: 'mail/settings', tenantId, context: err as object });
      notify.push({ id: 'mail/settings-error', message: t('notifications.loadError'), severity: 'error', module: 'settings/platform-mail' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'settings/platform-mail', scope: 'MailSettingsPage', tenantId });
    metrics.pageView('MailSettingsPage', { module: 'settings/platform-mail', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.providers ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.mailSettings.title')} description={t('pages.mailSettings.description')}>
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('MailSettingsPage:primary', { module: 'settings/platform-mail' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'settings/platform-mail',
                action: 'configure',
                resource: 'pages.mailSettings.title',
                tenantId,
              });
              notify.push({ id: 'MailSettingsPage-saved', message: t('notifications.saved'), severity: 'success', module: 'settings/platform-mail' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <MailProviderTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
