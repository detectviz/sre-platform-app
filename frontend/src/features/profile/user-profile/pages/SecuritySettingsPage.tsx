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
import { createUserPreferenceScene } from '../scenes/UserPreferenceScene';
import { UserPreferenceDrawer } from '../components/UserPreferenceDrawer';
import { fetchUserProfile } from '../api/user-profile.api';

/**
 * 模組：用戶個人設定 (specs/015-user-profile)
 * 職責：調整 MFA、金鑰與安全通知
 * 架構來源：grafana/public/app/features/profile
 */
export function SecuritySettingsPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createUserPreferenceScene(), []);

  const query = useQuery(['profile/security', tenantId], () => fetchUserProfile(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'profile/user-profile', scope: 'profile/security', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'profile/user-profile', scope: 'profile/security', tenantId, context: err as object });
      notify.push({ id: 'profile/security-error', message: t('notifications.loadError'), severity: 'error', module: 'profile/user-profile' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'profile/user-profile', scope: 'SecuritySettingsPage', tenantId });
    metrics.pageView('SecuritySettingsPage', { module: 'profile/user-profile', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.security ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.securitySettings.title')} >
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('SecuritySettingsPage:primary', { module: 'profile/user-profile' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'profile/user-profile',
                action: 'configure',
                resource: 'pages.securitySettings.title',
                tenantId,
              });
              notify.push({ id: 'SecuritySettingsPage-saved', message: t('notifications.saved'), severity: 'success', module: 'profile/user-profile' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <UserPreferenceDrawer rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
