/**
 * 模組：自動化管理 (specs/013-automation-management)
 * 職責：管理自動化手冊、觸發條件與稽核
 * 架構來源：grafana/public/app/features/alerting/unified
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { EmptyState } from '../../../ui/components/EmptyState';


export function AutomationHistoryPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('automation.history');
  const onPrimaryAction = useActionTelemetry('automation.management.create', 'automation.management');
  const onSecondaryAction = useActionTelemetry('automation.management.import', 'automation.management');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.automation.history.title')} description={t('page.automation.history.description')}>
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
          <EmptyState title={t('page.automation.history.title')} description={t('page.automation.history.description')} />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default AutomationHistoryPage;
