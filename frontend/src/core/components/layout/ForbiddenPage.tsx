import { Page, PageHeader, PageToolbar } from '@grafana/ui';
import { useI18n } from '@core/i18n';

export function ForbiddenPage() {
  const { t } = useI18n();
  return (
    <Page>
      <PageHeader title={t('pages.forbidden.title')}>
        <PageToolbar />
      </PageHeader>
      <p>{t('pages.forbidden.description')}</p>
    </Page>
  );
}
