/**
 * 模組：平台導覽管理 (specs/003-platform-navigation)
 * 職責：維護全域導覽結構與模組掛載設定
 * 架構來源：grafana/public/app/core/components/AppChrome
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { NavigationPreviewDrawer } from '../components/NavigationPreviewDrawer';

export function NavigationSettingsPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('platform-navigation.settings');
  const onPrimaryAction = useActionTelemetry('platform.navigation.create', 'platform.navigation');
  const onSecondaryAction = useActionTelemetry('platform.navigation.import', 'platform.navigation');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.platformNavigation.title')} description={t('page.platformNavigation.description')}>
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
          <NavigationPreviewDrawer />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default NavigationSettingsPage;
