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
import { createAuthSettingsScene } from '../scenes/AuthSettingsScene';
import { AuthSettingsTable } from '../components/AuthSettingsTable';
import { fetchAuthProviders } from '../api/platform-auth.api';

/**
 * 模組：身份驗證管理 (specs/001-platform-auth)
 * 職責：管理身份提供者、單一登入配置與存取安全策略
 * 架構來源：grafana/public/app/features/auth
 */
export function AuthSettingsPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createAuthSettingsScene(), []);

  const query = useQuery(['auth-settings/providers', tenantId], () => fetchAuthProviders(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'settings/platform-auth', scope: 'auth-settings/providers', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'settings/platform-auth', scope: 'auth-settings/providers', tenantId, context: err as object });
      notify.push({ id: 'auth-settings/providers-error', message: t('notifications.loadError'), severity: 'error', module: 'settings/platform-auth' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'settings/platform-auth', scope: 'AuthSettingsPage', tenantId });
    metrics.pageView('AuthSettingsPage', { module: 'settings/platform-auth', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.providers ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.authSettings.title')} description={t('pages.authSettings.description')}>
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('AuthSettingsPage:primary', { module: 'settings/platform-auth' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'settings/platform-auth',
                action: 'configure',
                resource: 'pages.authSettings.title',
                tenantId,
              });
              notify.push({ id: 'AuthSettingsPage-saved', message: t('notifications.saved'), severity: 'success', module: 'settings/platform-auth' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <AuthSettingsTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
