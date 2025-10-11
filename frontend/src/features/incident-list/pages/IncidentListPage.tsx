/**
 * 模組：事件列表 (specs/011-incident-list)
 * 職責：顯示並篩選事件列表、AI 標記與協作
 * 架構來源：grafana/public/app/features/alerting
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { IncidentListTable } from '../components/IncidentListTable';
import { IncidentTimelineScene } from '../../../scenes/incidents/IncidentTimelineScene';

export function IncidentListPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('incidents.list');
  const onPrimaryAction = useActionTelemetry('incident.list.create', 'incident.list');
  const onSecondaryAction = useActionTelemetry('incident.list.import', 'incident.list');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.incident.list.title')} description={t('page.incident.list.description')}>
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
          <IncidentListTable />
          <IncidentTimelineScene />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default IncidentListPage;
