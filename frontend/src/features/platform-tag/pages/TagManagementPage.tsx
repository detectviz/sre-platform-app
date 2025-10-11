/**
 * 模組：標籤系統管理 (specs/005-platform-tag)
 * 職責：管理資源標籤、分類與治理規範
 * 架構來源：grafana/public/app/features/tags
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { TagManagementTable } from '../components/TagManagementTable';

export function TagManagementPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('platform-tag.management');
  const onPrimaryAction = useActionTelemetry('platform.tag.create', 'platform.tag');
  const onSecondaryAction = useActionTelemetry('platform.tag.import', 'platform.tag');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.platformTag.title')} description={t('page.platformTag.description')}>
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
          <TagManagementTable />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default TagManagementPage;
