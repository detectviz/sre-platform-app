import { css } from '@emotion/css';
import { Button, HorizontalGroup, Icon, Input, useTheme2 } from '@grafana/ui';
import { useI18n } from '../../i18n';
import { useActionTelemetry } from '../../hooks/useActionTelemetry';

export function NavHeader() {
  const theme = useTheme2();
  const { t } = useI18n();
  const onSearch = useActionTelemetry('navigation.search', 'navigation');
  const onToggleTheme = useActionTelemetry('navigation.theme.toggle', 'navigation');
  const onLogout = useActionTelemetry('navigation.logout', 'navigation');

  return (
    <header
      className={css`
        align-items: center;
        background: ${theme.colors.background.canvas};
        border-bottom: 1px solid ${theme.colors.border.medium};
        display: flex;
        gap: ${theme.spacing(2)};
        padding: ${theme.spacing(1)} ${theme.spacing(2)};
      `}
    >
      <HorizontalGroup width="auto" spacing="sm">
        <Icon name="grafana" size="xl" />
        <strong>{t('app.title')}</strong>
      </HorizontalGroup>
      <Input
        prefix={<Icon name="search" />}
        placeholder={t('navigation.searchPlaceholder')}
        onBlur={() => onSearch()}
      />
      <div className={css`margin-left: auto;`}>
        <HorizontalGroup spacing="sm">
          <Button
            variant="secondary"
            icon="moon"
            onClick={() => onToggleTheme({ mode: 'toggle' })}
            title={t('navigation.theme')}
          />
          <Button
            variant="secondary"
            icon="user"
            onClick={() => onSearch({ scope: 'profile' })}
            title={t('navigation.profile')}
          />
          <Button variant="secondary" icon="sign-out" onClick={() => onLogout()}>
            {t('navigation.logout')}
          </Button>
        </HorizontalGroup>
      </div>
    </header>
  );
}
