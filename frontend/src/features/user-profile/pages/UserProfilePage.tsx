/**
 * 模組：使用者個人設定 (specs/015-user-profile)
 * 職責：維護個人偏好、通知與金鑰
 * 架構來源：grafana/public/app/features/profile
 */
import { css } from '@emotion/css';
import { Button, Field, HorizontalGroup, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../../core/i18n';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { UserPreferenceDrawer } from '../components/UserPreferenceDrawer';

export function UserProfilePage() {
  const theme = useTheme2();
  const { t } = useI18n();
  usePageInstrumentation('profile.preferences');
  const onPrimaryAction = useActionTelemetry('user.profile.create', 'user.profile');
  const onSecondaryAction = useActionTelemetry('user.profile.import', 'user.profile');
  const searchPlaceholder = t('form.search.placeholder');

  return (
    <Page>
      <PageHeader title={t('page.userProfile.title')} description={t('page.userProfile.description')}>
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
          <UserPreferenceDrawer />

        </div>
      </Page.Contents>
    </Page>
  );
}

export default UserProfilePage;
