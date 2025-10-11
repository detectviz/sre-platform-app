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
 * 職責：管理偏好設定與語系
 * 架構來源：grafana/public/app/features/profile
 */
export function PreferenceSettingsPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createUserPreferenceScene(), []);

  const query = useQuery(['profile/preferences', tenantId], () => fetchUserProfile(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'profile/user-profile', scope: 'profile/preferences', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'profile/user-profile', scope: 'profile/preferences', tenantId, context: err as object });
      notify.push({ id: 'profile/preferences-error', message: t('notifications.loadError'), severity: 'error', module: 'profile/user-profile' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'profile/user-profile', scope: 'PreferenceSettingsPage', tenantId });
    metrics.pageView('PreferenceSettingsPage', { module: 'profile/user-profile', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.preferences ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.preferenceSettings.title')} >
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('PreferenceSettingsPage:primary', { module: 'profile/user-profile' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'profile/user-profile',
                action: 'configure',
                resource: 'pages.preferenceSettings.title',
                tenantId,
              });
              notify.push({ id: 'PreferenceSettingsPage-saved', message: t('notifications.saved'), severity: 'success', module: 'profile/user-profile' });
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
