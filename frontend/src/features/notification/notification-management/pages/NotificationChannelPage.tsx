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
import { createNotificationFlowScene } from '../scenes/NotificationFlowScene';
import { NotificationMatrixTable } from '../components/NotificationMatrixTable';
import { fetchNotificationChannels } from '../api/notification-management.api';

/**
 * 模組：通知管道管理 (specs/012-notification-management)
 * 職責：管理通知管道憑證與狀態
 * 架構來源：grafana/public/app/features/alerting
 */
export function NotificationChannelPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createNotificationFlowScene(), []);

  const query = useQuery(['notifications/channels', tenantId], () => fetchNotificationChannels(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'notification/notification-management', scope: 'notifications/channels', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'notification/notification-management', scope: 'notifications/channels', tenantId, context: err as object });
      notify.push({ id: 'notifications/channels-error', message: t('notifications.loadError'), severity: 'error', module: 'notification/notification-management' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'notification/notification-management', scope: 'NotificationChannelPage', tenantId });
    metrics.pageView('NotificationChannelPage', { module: 'notification/notification-management', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.channels ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.notificationChannel.title')} >
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('NotificationChannelPage:primary', { module: 'notification/notification-management' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'notification/notification-management',
                action: 'configure',
                resource: 'pages.notificationChannel.title',
                tenantId,
              });
              notify.push({ id: 'NotificationChannelPage-saved', message: t('notifications.saved'), severity: 'success', module: 'notification/notification-management' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <NotificationMatrixTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
