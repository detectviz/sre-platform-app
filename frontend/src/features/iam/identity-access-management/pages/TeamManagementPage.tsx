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
import { createIamOverviewScene } from '../scenes/IamOverviewScene';
import { IamRosterTable } from '../components/IamRosterTable';
import { fetchTeams } from '../api/identity-access-management.api';

/**
 * 模組：身份與存取管理 (specs/002-identity-access-management)
 * 職責：管理團隊層級與值班輪值
 * 架構來源：grafana/public/app/features/users
 */
export function TeamManagementPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createIamOverviewScene(), []);

  const query = useQuery(['iam/teams', tenantId], () => fetchTeams(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'iam/identity-access-management', scope: 'iam/teams', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'iam/identity-access-management', scope: 'iam/teams', tenantId, context: err as object });
      notify.push({ id: 'iam/teams-error', message: t('notifications.loadError'), severity: 'error', module: 'iam/identity-access-management' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'iam/identity-access-management', scope: 'TeamManagementPage', tenantId });
    metrics.pageView('TeamManagementPage', { module: 'iam/identity-access-management', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.teams ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.teamManagement.title')} description={t('pages.teamManagement.description')}>
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('TeamManagementPage:primary', { module: 'iam/identity-access-management' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'iam/identity-access-management',
                action: 'configure',
                resource: 'pages.teamManagement.title',
                tenantId,
              });
              notify.push({ id: 'TeamManagementPage-saved', message: t('notifications.saved'), severity: 'success', module: 'iam/identity-access-management' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <IamRosterTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
