/**
 * 模組：洞察分析 (specs/009-insight-analysis)
 * 職責：執行回測、容量規劃與 AI 預測
 * 架構來源：grafana/public/app/features/analytics
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { InsightScenarioDrawer } from '../components/InsightScenarioDrawer';

export function BacktestingPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('insight.backtesting');
  const onPrimaryAction = useActionTelemetry('insight.analysis.create', 'insight.analysis');
  const onSecondaryAction = useActionTelemetry('insight.analysis.import', 'insight.analysis');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.insight.analysis.backtesting.title')} description={t('page.insight.analysis.backtesting.description')}>
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
          <InsightScenarioDrawer />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default BacktestingPage;
