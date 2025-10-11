import { css } from '@emotion/react';
import { Icon, useTheme2 } from '@grafana/ui';
import { useLocation } from 'react-router-dom';
import { useNavigation } from './NavigationContext';
import { useI18n } from '@core/i18n';

export function NavBreadcrumb() {
  const { items } = useNavigation();
  const { pathname } = useLocation();
  const theme = useTheme2();
  const { t } = useI18n();

  const match = items.find((link) => pathname.startsWith(link.path));
  const crumbs = match ? [match] : [];

  return (
    <nav
      aria-label="breadcrumb"
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing(1)};
        color: ${theme.colors.text.secondary};
        padding: ${theme.spacing(1)} 0;
      `}
    >
      <Icon name="home" />
      {crumbs.map((crumb) => (
        <span key={crumb.id}>{t(crumb.titleKey)}</span>
      ))}
    </nav>
  );
}
