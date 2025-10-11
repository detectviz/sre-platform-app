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
import { AutomationPlaybookTable } from '../components/AutomationPlaybookTable';

export function AutomationPlaybooksPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('automation.playbooks');
  const onPrimaryAction = useActionTelemetry('automation.management.create', 'automation.management');
  const onSecondaryAction = useActionTelemetry('automation.management.import', 'automation.management');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.automation.playbooks.title')} description={t('page.automation.playbooks.description')}>
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
          <AutomationPlaybookTable />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default AutomationPlaybooksPage;
