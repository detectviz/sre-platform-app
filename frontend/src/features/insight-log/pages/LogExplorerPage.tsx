/**
 * 模組：日誌洞察 (specs/008-insight-log)
 * 職責：提供日誌分析、篩選與 AI 洞察
 * 架構來源：grafana/public/app/features/logs
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { LogStreamPanel } from '../components/LogStreamPanel';
import { LogExplorerScene } from '../../../scenes/insight/LogExplorerScene';

export function LogExplorerPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('insight.log');
  const onPrimaryAction = useActionTelemetry('insight.log.create', 'insight.log');
  const onSecondaryAction = useActionTelemetry('insight.log.import', 'insight.log');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.insight.log.title')} description={t('page.insight.log.description')}>
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
          <LogStreamPanel />
          <LogExplorerScene />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default LogExplorerPage;
