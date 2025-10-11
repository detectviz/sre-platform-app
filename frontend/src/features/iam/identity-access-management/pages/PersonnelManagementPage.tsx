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
import { fetchPersonnel } from '../api/identity-access-management.api';

/**
 * 模組：身份與存取管理 (specs/002-identity-access-management)
 * 職責：維護 SRE 成員資料與上線狀態
 * 架構來源：grafana/public/app/features/users
 */
export function PersonnelManagementPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createIamOverviewScene(), []);

  const query = useQuery(['iam/personnel', tenantId], () => fetchPersonnel(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'iam/identity-access-management', scope: 'iam/personnel', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'iam/identity-access-management', scope: 'iam/personnel', tenantId, context: err as object });
      notify.push({ id: 'iam/personnel-error', message: t('notifications.loadError'), severity: 'error', module: 'iam/identity-access-management' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'iam/identity-access-management', scope: 'PersonnelManagementPage', tenantId });
    metrics.pageView('PersonnelManagementPage', { module: 'iam/identity-access-management', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.members ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.personnelManagement.title')} description={t('pages.personnelManagement.description')}>
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('PersonnelManagementPage:primary', { module: 'iam/identity-access-management' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'iam/identity-access-management',
                action: 'configure',
                resource: 'pages.personnelManagement.title',
                tenantId,
              });
              notify.push({ id: 'PersonnelManagementPage-saved', message: t('notifications.saved'), severity: 'success', module: 'iam/identity-access-management' });
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
