import { css } from '@emotion/css';
import { ReactNode, useMemo } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Icon, Input, Stack, ToolbarButton, useStyles2 } from '@grafana/ui';

import { useAuth } from '@core/contexts/AuthContext';
import { useI18n } from '@core/i18n';
import { metrics } from '@core/services/metrics';

interface NavHeaderProps {
  onToggleSidebar: () => void;
  toolbar?: ReactNode;
}

export function NavHeader({ onToggleSidebar, toolbar }: NavHeaderProps) {
  const styles = useStyles2(getStyles);
  const { t } = useI18n();
  const { user, logout } = useAuth();

  const profileLabel = useMemo(() => user?.displayName ?? t('app.userMenu.profile'), [t, user?.displayName]);

  return (
    <div className={styles.container}>
      <Stack gap={0.5} alignItems="center" className={styles.left}>
        <ToolbarButton
          icon="bars"
          aria-label={t('nav.navigationWorkbench')}
          onClick={() => {
            metrics.actionClick('header.toggle_sidebar', { module: 'core' });
            onToggleSidebar();
          }}
        />
        <Stack gap={0.25} alignItems="center" className={styles.brand}>
          <Icon name="grafana" size="lg" />
          <span>{t('app.title')}</span>
        </Stack>
        <Input
          prefix={<Icon name="search" />}
          placeholder={t('app.searchPlaceholder')}
          width={32}
          onFocus={() => metrics.actionClick('header.search_focus', { module: 'core' })}
        />
      </Stack>
      <Stack gap={0.5} alignItems="center" justifyContent="flex-end" className={styles.right}>
        {toolbar}
        <ToolbarButton
          icon="bell"
          tooltip={t('app.userMenu.alerts')}
          onClick={() => metrics.actionClick('header.alert_center', { module: 'core' })}
        />
        <ToolbarButton
          icon="user"
          tooltip={profileLabel}
          onClick={() => metrics.actionClick('header.profile_click', { module: 'core' })}
        >
          {profileLabel}
        </ToolbarButton>
        <ToolbarButton
          icon="sign-out"
          tooltip={t('app.userMenu.logout')}
          onClick={() => {
            metrics.actionClick('header.logout', { module: 'core' });
            logout();
          }}
        />
      </Stack>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  container: css({
    label: 'nav-header',
    height: theme.spacing(7),
    padding: theme.spacing(0, 1.5),
    borderBottom: `1px solid ${theme.colors.border.weak}`,
    background: theme.colors.background.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: theme.shadows.z2,
  }),
  left: css({
    minWidth: 0,
    flex: 1,
    '& input': {
      background: theme.colors.background.secondary,
    },
  }),
  right: css({
    flex: 1,
    justifyContent: 'flex-end',
  }),
  brand: css({
    fontWeight: theme.typography.fontWeightMedium,
    gap: theme.spacing(0.5),
  }),
});
