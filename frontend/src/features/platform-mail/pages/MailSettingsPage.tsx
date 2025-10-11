/**
 * 模組：郵件通知管理 (specs/004-platform-mail)
 * 職責：整合郵件供應商並監控通知健康
 * 架構來源：grafana/public/app/features/alerting/notifications
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { MailProviderTable } from '../components/MailProviderTable';

export function MailSettingsPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('platform-mail.settings');
  const onPrimaryAction = useActionTelemetry('platform.mail.create', 'platform.mail');
  const onSecondaryAction = useActionTelemetry('platform.mail.import', 'platform.mail');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.platformMail.title')} description={t('page.platformMail.description')}>
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
          <MailProviderTable />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default MailSettingsPage;
