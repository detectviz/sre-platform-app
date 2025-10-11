/**
 * 模組：Grafana 平台整合 (specs/006-platform-grafana)
 * 職責：管理 Grafana 連線、同步與權限
 * 架構來源：grafana/public/app/features/datasource
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { GrafanaIntegrationCard } from '../components/GrafanaIntegrationCard';

export function GrafanaSettingsPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('platform-grafana.settings');
  const onPrimaryAction = useActionTelemetry('platform.grafana.create', 'platform.grafana');
  const onSecondaryAction = useActionTelemetry('platform.grafana.import', 'platform.grafana');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.platformGrafana.title')} description={t('page.platformGrafana.description')}>
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
          <GrafanaIntegrationCard />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default GrafanaSettingsPage;
