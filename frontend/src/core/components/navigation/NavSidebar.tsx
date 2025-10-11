import { css } from '@emotion/css';
import { useMemo } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Icon, ToolbarButton, Tooltip, useStyles2 } from '@grafana/ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { AuthGuard } from '@core/contexts/AuthGuard';
import { useI18n } from '@core/i18n';
import { metrics } from '@core/services/metrics';

import { NavigationLink, useNavigation } from './NavigationContext';

interface NavSidebarProps {
  isOpen: boolean;
}

export function NavSidebar({ isOpen }: NavSidebarProps) {
  const styles = useStyles2(getStyles);
  const { items } = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  const links = useMemo(() => items, [items]);

  if (!isOpen) {
    return null;
  }

  const handleNavigate = (path: string) => {
    metrics.actionClick('sidebar.navigate', { module: 'core', target: path });
    navigate(path);
  };

  return (
    <aside className={styles.container}>
      <nav className={styles.nav} aria-label={t('app.navigationPrimary')}>
        {links.map((link) => (
          <AuthGuard key={link.id} resource={link.resource ?? 'navigation'} action={link.action ?? 'read'}>
            <SidebarLink
              link={link}
              active={location.pathname.startsWith(link.path)}
              onNavigate={handleNavigate}
            />
          </AuthGuard>
        ))}
      </nav>
    </aside>
  );
}

interface SidebarLinkProps {
  link: NavigationLink;
  active: boolean;
  onNavigate: (path: string) => void;
}

function SidebarLink({ link, active, onNavigate }: SidebarLinkProps) {
  const styles = useStyles2(getStyles);
  const { t } = useI18n();

  const content = (
    <button type="button" className={active ? styles.linkActive : styles.link} onClick={() => onNavigate(link.path)}>
      {link.icon && <Icon name={link.icon as any} size="md" />}
      <span className={styles.linkLabel}>{t(link.titleKey)}</span>
    </button>
  );

  if (link.children?.length) {
    return (
      <div className={styles.group}>
        {content}
        <div className={styles.childList}>
          {link.children.map((child) => (
            <ToolbarButton
              key={child.id}
              icon={child.icon as any}
              className={styles.child}
              onClick={() => onNavigate(child.path)}
            >
              {t(child.titleKey)}
            </ToolbarButton>
          ))}
        </div>
      </div>
    );
  }

  if (link.titleKey.length > 30) {
    return (
      <Tooltip content={t(link.titleKey)} placement="right">
        {content}
      </Tooltip>
    );
  }

  return content;
}

const getStyles = (theme: GrafanaTheme2) => {
  const baseLink = {
    border: 0,
    background: 'transparent',
    color: theme.colors.text.secondary,
    padding: theme.spacing(0.75, 1),
    borderRadius: theme.shape.borderRadius(1),
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'background 120ms ease',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  };

  return {
    container: css({
      label: 'nav-sidebar',
      width: theme.spacing(32),
      borderRight: `1px solid ${theme.colors.border.weak}`,
      background: theme.colors.background.secondary,
      height: '100%',
      overflowY: 'auto',
    }),
    nav: css({
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(2, 1.5),
      gap: theme.spacing(0.5),
    }),
    link: css({
      ...baseLink,
      '&:hover': {
        background: theme.colors.background.hover,
        color: theme.colors.text.primary,
      },
    }),
    linkActive: css({
      ...baseLink,
      background: theme.colors.action.selected,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeightMedium,
    }),
    linkLabel: css({
      flex: 1,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    }),
    group: css({
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(0.5),
    }),
    childList: css({
      marginLeft: theme.spacing(3),
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(0.25),
    }),
    child: css({
      justifyContent: 'flex-start',
    }),
  };
};
