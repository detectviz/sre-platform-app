/**
 * 模組：身份驗證管理 (specs/001-platform-auth)
 * 職責：提供登入介面、驗證流程與觀測性事件
 * 架構來源：grafana/public/app/features/login/LoginPage.tsx
 */
import { css } from '@emotion/css';
import { Alert, Button, Card, Checkbox, Field, Form, FormAPI, Input, useTheme2 } from '@grafana/ui';
import { useState } from 'react';
import { useI18n } from '../../../core/i18n';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';
import { usePageInstrumentation } from '../../../core/hooks/usePageInstrumentation';
import { metricsService } from '../../../core/services/metrics';
import { notifyService } from '../../../core/services/notify';
import { auditService } from '../../../core/services/audit';
import { loggingService } from '../../../core/services/logging';

interface LoginFormModel {
  username: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const theme = useTheme2();
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const submitAction = useActionTelemetry('platform.auth.login.submit', 'platform.auth');
  usePageInstrumentation('platform-auth.login');

  const onSubmit = async (form: FormAPI<LoginFormModel>) => {
    const values = form.getValues();
    submitAction({ username: values.username });
    metricsService.increment('auth.login.attempt', { remember: String(values.remember) });
    loggingService.info('Login attempt', { username: values.username, remember: values.remember });

    if (values.username && values.password) {
      setError(null);
      auditService.record({
        actor: values.username,
        action: 'login',
        resource: 'platform-auth',
        tenantId: 'tenant-default',
        result: 'success'
      });
      notifyService.publish({
        message: t('form.login.submit'),
        severity: 'success',
        source: 'login'
      });
    } else {
      const message = t('form.login.error');
      setError(message);
      auditService.record({
        actor: values.username ?? 'unknown',
        action: 'login',
        resource: 'platform-auth',
        tenantId: 'tenant-default',
        result: 'failure'
      });
      notifyService.publish({ message, severity: 'error', source: 'login' });
    }
  };

  return (
    <div
      className={css`
        align-items: center;
        display: flex;
        justify-content: center;
        min-height: 100vh;
        background: ${theme.colors.background.canvas};
      `}
    >
      <Card
        className={css`
          max-width: 420px;
          width: 100%;
        `}
      >
        <Card.Heading>{t('page.login.title')}</Card.Heading>
        <Card.Description>{t('page.login.description')}</Card.Description>
        {error && <Alert title={t('form.login.error')} severity="error" elevated>{error}</Alert>}
        <Form<LoginFormModel> onSubmit={onSubmit} defaultValues={{ username: '', password: '', remember: true }}>
          {({ register, control }) => (
            <Form.FieldSet>
              <Field label={t('form.login.username')} invalid={Boolean(error)}>
                <Input {...register('username')} autoComplete="username" />
              </Field>
              <Field label={t('form.login.password')} invalid={Boolean(error)}>
                <Input {...register('password')} type="password" autoComplete="current-password" />
              </Field>
              <Checkbox label={t('form.login.remember')} {...register('remember')} control={control} />
              <Button type="submit" variant="primary" icon="lock" fullWidth>
                {t('form.login.submit')}
              </Button>
            </Form.FieldSet>
          )}
        </Form>
      </Card>
    </div>
  );
}
