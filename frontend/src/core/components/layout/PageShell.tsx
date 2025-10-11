import { css, cx } from '@emotion/css';
import { ReactNode } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { LinkButton, useStyles2 } from '@grafana/ui';

import { useI18n } from '@core/i18n';

import { NavBreadcrumb } from '../navigation/NavBreadcrumb';

interface PageShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}

export function PageShell({ sidebar, header, children }: PageShellProps) {
  const styles = useStyles2(getStyles);
  const { t } = useI18n();

  return (
    <div className={styles.root}>
      <LinkButton className={styles.skipLink} href="#pageContent">
        {t('app.skipToContent')}
      </LinkButton>
      <header className={styles.topNav}>{header}</header>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>{sidebar}</aside>
        <main id="pageContent" className={cx('page-container', styles.main)}>
          <NavBreadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    root: css({
      label: 'app-shell',
      minHeight: '100vh',
      background: theme.colors.background.canvas,
      display: 'flex',
      flexDirection: 'column',
    }),
    skipLink: css({
      position: 'absolute',
      top: theme.spacing(1),
      left: theme.spacing(1),
      zIndex: theme.zIndex.navbar + 1,
      transform: 'translateY(-150%)',
      '&:focus': {
        transform: 'translateY(0)',
      },
    }),
    topNav: css({
      label: 'app-shell-top-nav',
      position: 'sticky',
      top: 0,
      zIndex: theme.zIndex.navbar,
    }),
    layout: css({
      label: 'app-shell-layout',
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    }),
    sidebar: css({
      label: 'app-shell-sidebar',
      width: 256,
      flexShrink: 0,
      borderRight: `1px solid ${theme.colors.border.weak}`,
      background: theme.colors.background.secondary,
      overflowY: 'auto',
    }),
    main: css({
      label: 'app-shell-main',
      flex: 1,
      padding: theme.spacing(3),
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
    }),
  };
};
