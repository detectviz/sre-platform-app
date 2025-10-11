/**
 * 模組：平台設定 (specs/001-platform-auth)
 * 職責：統整各項設定模組入口與狀態
 * 架構來源：grafana/public/app/features/admin
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { Outlet } from 'react-router-dom';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { SettingsSummaryCard } from '../components/SettingsSummaryCard';

export function SettingsLandingPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('settings.landing');
  const onPrimaryAction = useActionTelemetry('settings.create', 'settings');
  const onSecondaryAction = useActionTelemetry('settings.import', 'settings');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('settings.module.title')} description={t('settings.module.description')}>
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
          <SettingsSummaryCard />
          <Outlet />
        </div>
      </Page.Contents>
    </Page>
  );
}

export default SettingsLandingPage;
