import { useEffect, useState } from 'react';
import { Button, Field, Form, Input, Page, PageHeader, PageToolbar, useTheme2 } from '@grafana/ui';
import { useI18n } from '@core/i18n';
import { logging } from '@core/services/logging';
import { metrics } from '@core/services/metrics';
import { notify } from '@core/services/notify';

/**
 * 模組：身份驗證管理 (specs/001-platform-auth)
 * 職責：提供 Grafana 風格登入表單與錯誤處理
 * 架構來源：grafana/public/app/features/auth
 */
export function LoginPage() {
  const { t } = useI18n();
  const theme = useTheme2();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    logging.info('page_view', { module: 'settings/platform-auth', scope: 'LoginPage' });
    metrics.pageView('LoginPage', { module: 'settings/platform-auth' });
  }, []);

  const onSubmit = () => {
    setSubmitting(true);
    metrics.pageView('login:submit', { module: 'settings/platform-auth' });
    if (!username || !password) {
      notify.push({ id: 'login-error', message: t('notifications.loadError'), severity: 'error', module: 'settings/platform-auth' });
      setSubmitting(false);
      return;
    }
    logging.info('login:attempt', { module: 'settings/platform-auth', scope: username });
    setTimeout(() => {
      setSubmitting(false);
      notify.push({ id: 'login-ok', message: t('notifications.saved'), severity: 'success', module: 'settings/platform-auth' });
    }, 400);
  };

  return (
    <Page navId="login">
      <PageHeader title={t('login.title')} description={t('login.subtitle')}>
        <PageToolbar />
      </PageHeader>
      <Form
        onSubmit={onSubmit}
        style={{
          maxWidth: 360,
          margin: `${theme.spacing(4)} auto`,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(2),
        }}
      >
        <Field label={t('login.username')}>
          <Input value={username} onChange={(e) => setUsername(e.currentTarget.value)} />
        </Field>
        <Field label={t('login.password')}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
        </Field>
        <Button type="submit" disabled={isSubmitting}>
          {t('login.submit')}
        </Button>
      </Form>
    </Page>
  );
}
