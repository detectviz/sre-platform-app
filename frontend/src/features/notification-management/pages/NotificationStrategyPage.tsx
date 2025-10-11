/**
 * 模組：通知管理 (specs/012-notification-management)
 * 職責：配置通知策略、管道與歷程審計
 * 架構來源：grafana/public/app/features/alerting/notifications
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { NotificationChannelTable } from '../components/NotificationChannelTable';

export function NotificationStrategyPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('notifications.strategy');
  const onPrimaryAction = useActionTelemetry('notification.management.create', 'notification.management');
  const onSecondaryAction = useActionTelemetry('notification.management.import', 'notification.management');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.notification.strategy.title')} description={t('page.notification.strategy.description')}>
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
          <NotificationChannelTable />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default NotificationStrategyPage;
