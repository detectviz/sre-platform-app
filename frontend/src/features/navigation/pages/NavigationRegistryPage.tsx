/**
 * 模組：導覽模組 (specs/003-platform-navigation)
 * 職責：提供導覽註冊、健康檢查與觀測
 * 架構來源：grafana/public/app/core/components/AppChrome
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { NavigationMatrixTable } from '../components/NavigationMatrixTable';
import { NavigationUsageScene } from '../../../scenes/navigation/NavigationUsageScene';

export function NavigationRegistryPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('navigation.registry');
  const onPrimaryAction = useActionTelemetry('navigation.create', 'navigation');
  const onSecondaryAction = useActionTelemetry('navigation.import', 'navigation');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('navigation.dynamic')} description={t('navigation.dynamic')}>
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
          <NavigationMatrixTable />
          <NavigationUsageScene />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default NavigationRegistryPage;
