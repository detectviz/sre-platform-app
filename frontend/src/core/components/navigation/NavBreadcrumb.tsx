import { css } from '@emotion/css';
import { Breadcrumbs, Icon, useTheme2 } from '@grafana/ui';
import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useI18n } from '../../i18n';

export function NavBreadcrumb() {
  const location = useLocation();
  const { t } = useI18n();
  const theme = useTheme2();

  const segments = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = parts.map((part, index) => {
      const path = `/${parts.slice(0, index + 1).join('/')}`;
      return { text: part.replace(/-/g, ' '), path };
    });
    return [{ text: t('navigation.breadcrumb.home'), path: '/' }, ...crumbs];
  }, [location.pathname, t]);

  return (
    <div
      className={css`
        align-items: center;
        display: flex;
        gap: ${theme.spacing(1)};
        padding: ${theme.spacing(1)} ${theme.spacing(2)};
      `}
    >
      <Icon name="route" />
      <Breadcrumbs>
        {segments.map((segment) => (
          <Link key={segment.path} to={segment.path}>
            {segment.text}
          </Link>
        ))}
      </Breadcrumbs>
    </div>
  );
}
