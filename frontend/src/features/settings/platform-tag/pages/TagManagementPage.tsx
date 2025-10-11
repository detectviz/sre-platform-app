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
import { createTagGovernanceScene } from '../scenes/TagGovernanceScene';
import { TagPolicyTable } from '../components/TagPolicyTable';
import { fetchTagTaxonomies } from '../api/platform-tag.api';

/**
 * 模組：標籤系統管理 (specs/005-platform-tag)
 * 職責：治理資源標籤與自動套用規則
 * 架構來源：grafana/public/app/features/library-panels
 */
export function TagManagementPage() {
  const { t } = useI18n();
  const { tenantId, user } = useAuth();
  const scene = useMemo(() => createTagGovernanceScene(), []);

  const query = useQuery(['tag/management', tenantId], () => fetchTagTaxonomies(), {
    onSuccess: () => {
      logging.info('api:success', { module: 'settings/platform-tag', scope: 'tag/management', tenantId });
      scene.track?.('scene:success');
    },
    onError: (err) => {
      logging.error('api:error', { module: 'settings/platform-tag', scope: 'tag/management', tenantId, context: err as object });
      notify.push({ id: 'tag/management-error', message: t('notifications.loadError'), severity: 'error', module: 'settings/platform-tag' });
      scene.track?.('scene:error');
    },
  });

  useEffect(() => {
    logging.info('page_view', { module: 'settings/platform-tag', scope: 'TagManagementPage', tenantId });
    metrics.pageView('TagManagementPage', { module: 'settings/platform-tag', tenantId });
  }, [tenantId]);

  const rows = (query.data as any)?.items ?? (query.data as any)?.policies ?? [];

  return (
    <Page>
      <PageHeader title={t('pages.tagManagement.title')} description={t('pages.tagManagement.description')}>
        <PageToolbar>
          <Button onClick={() => query.refetch()} variant="secondary">
            {t('actions.refresh')}
          </Button>
          <Button
            onClick={() => {
              metrics.actionClick('TagManagementPage:primary', { module: 'settings/platform-tag' });
              audit.record({
                actor: user?.id ?? 'anonymous',
                module: 'settings/platform-tag',
                action: 'configure',
                resource: 'pages.tagManagement.title',
                tenantId,
              });
              notify.push({ id: 'TagManagementPage-saved', message: t('notifications.saved'), severity: 'success', module: 'settings/platform-tag' });
            }}
          >
            {t('actions.save')}
          </Button>
        </PageToolbar>
      </PageHeader>
      <TagPolicyTable rows={rows} />
      <ScenePreview scene={scene} />
    </Page>
  );
}
