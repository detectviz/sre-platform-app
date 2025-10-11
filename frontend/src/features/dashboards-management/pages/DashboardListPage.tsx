/**
 * 模組：儀表板管理 (specs/014-dashboards-management)
 * 職責：治理儀表板庫、編輯器與戰情室
 * 架構來源：grafana/public/app/features/dashboard
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { DashboardLibraryTable } from '../components/DashboardLibraryTable';
import { DashboardOverviewScene } from '../../../scenes/dashboards/DashboardOverviewScene';

export function DashboardListPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('dashboards.list');
  const onPrimaryAction = useActionTelemetry('dashboards.management.create', 'dashboards.management');
  const onSecondaryAction = useActionTelemetry('dashboards.management.import', 'dashboards.management');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.dashboards.list.title')} description={t('page.dashboards.list.description')}>
        <PageToolbar>
          <HorizontalGroup spacing="sm">
            <Button icon="plus" onClick={() => onPrimaryAction()}>
              {t('toolbar.primary.cta')}
            </Button>
            <Button variant="secondary" icon="upload" onClick={() => onSecondaryAction()}>
              {t('toolbar.secondary.cta')}
            </Button>
          </HorizontalGroup>
        </PageToolbar>
      </PageHeader>
      <Page.Contents>
        <div
          className={css`
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing(2)};
            padding: ${theme.spacing(2)};
          `}
        >
          <Field label={searchPlaceholder}>
            <Input placeholder={searchPlaceholder} prefix={<i className="fa fa-search" />} />
          </Field>
          <DashboardLibraryTable />
          <DashboardOverviewScene />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default DashboardListPage;
