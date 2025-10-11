/**
 * 模組：身份驗證管理 (specs/001-platform-auth)
 * 職責：管理身份驗證設定、登入政策與供應商整合
 * 架構來源：grafana/public/app/features/auth
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { AuthProviderTable } from '../components/AuthProviderTable';

export function AuthSettingsPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('platform-auth.settings');
  const onPrimaryAction = useActionTelemetry('platform.auth.create', 'platform.auth');
  const onSecondaryAction = useActionTelemetry('platform.auth.import', 'platform.auth');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.platformAuth.title')} description={t('page.platformAuth.description')}>
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
          <AuthProviderTable />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default AuthSettingsPage;
