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
import { createNavigationWorkbenchScene } from '../scenes/NavigationWorkbenchScene';
import { NavigationExperimentTable } from '../components/NavigationExperimentTable';
import { fetchNavigationExperiments } from '../api/navigation-workbench.api';

/**
 * 模組：導覽工作台 (specs/003-platform-navigation)
 * 職責：動態調整導覽並驗證用戶行為
 * 架構來源：grafana/public/app/core/components/AppChrome
 */
export function NavigationWorkbenchPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createNavigationWorkbenchScene(), []);

  const query = useQuery(['navigation/workbench', tenantId], () => fetchNavigationExperiments(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'navigation/platform-navigation', scope: 'navigation/workbench', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'navigation/platform-navigation', scope: 'navigation/workbench', tenantId, context: err as object });
      notify.push({ id: 'navigation/workbench-error', message: t('notifications.loadError'), severity: 'error', module: 'navigation/platform-navigation' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'navigation/platform-navigation', scope: 'NavigationWorkbenchPage', tenantId });
    metrics.pageView('NavigationWorkbenchPage', { module: 'navigation/platform-navigation', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.experiments ?? [];

  return (
    <Page>
      <PageHeader title={t('nav.navigationWorkbench')} >
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('NavigationWorkbenchPage:primary', { module: 'navigation/platform-navigation' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'navigation/platform-navigation',
                action: 'configure',
                resource: 'nav.navigationWorkbench',
                tenantId,
              });
              notify.push({ id: 'NavigationWorkbenchPage-saved', message: t('notifications.saved'), severity: 'success', module: 'navigation/platform-navigation' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <NavigationExperimentTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
