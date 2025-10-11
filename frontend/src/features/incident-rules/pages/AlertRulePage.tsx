/**
 * 模組：事件規則 (specs/010-incident-rules)
 * 職責：維護事件告警與靜音規則
 * 架構來源：grafana/public/app/features/alerting
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { IncidentRuleTable } from '../components/IncidentRuleTable';

export function AlertRulePage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('incidents.rules.alert');
  const onPrimaryAction = useActionTelemetry('incident.rules.create', 'incident.rules');
  const onSecondaryAction = useActionTelemetry('incident.rules.import', 'incident.rules');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.incident.rules.alert.title')} description={t('page.incident.rules.alert.description')}>
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
          <IncidentRuleTable />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default AlertRulePage;
