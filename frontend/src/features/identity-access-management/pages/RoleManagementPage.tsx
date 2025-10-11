/**
 * 模組：身分與存取管理 (specs/002-identity-access-management)
 * 職責：維護人員、團隊與角色權限矩陣
 * 架構來源：grafana/public/app/features/users
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { IAMDirectoryTable } from '../components/IAMDirectoryTable';

export function RoleManagementPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('iam.roles');
  const onPrimaryAction = useActionTelemetry('identity.access.management.create', 'identity.access.management');
  const onSecondaryAction = useActionTelemetry('identity.access.management.import', 'identity.access.management');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.iam.role.title')} description={t('page.iam.role.description')}>
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
          <IAMDirectoryTable />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default RoleManagementPage;
