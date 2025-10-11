/**
 * 模組：資源管理 (specs/007-resources-management)
 * 職責：掌握資源清冊、拓撲與資料來源治理
 * 架構來源：grafana/public/app/features/explore
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { EmptyState } from '../../../ui/components/EmptyState';


export function ResourceGroupPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('resources.groups');
  const onPrimaryAction = useActionTelemetry('resources.management.create', 'resources.management');
  const onSecondaryAction = useActionTelemetry('resources.management.import', 'resources.management');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.resources.group.title')} description={t('page.resources.group.description')}>
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
          <EmptyState title={t('page.resources.group.title')} description={t('page.resources.group.description')} />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default ResourceGroupPage;
