import { css, cx } from '@emotion/css';
import { Button, Icon, useTheme2, VerticalGroup } from '@grafana/ui';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useNavigationRegistry } from './NavigationContext';
import { useI18n } from '../../i18n';
import { useActionTelemetry } from '../../hooks/useActionTelemetry';
import { useAuthContext } from '../../contexts/AuthContext';

export function NavSidebar() {
  const theme = useTheme2();
  const { items } = useNavigationRegistry();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const toggle = useActionTelemetry('navigation.sidebar.toggle', 'navigation');
  const { hasPermission } = useAuthContext();

  return (
    <aside
      className={cx(
        css`
          background: ${theme.colors.background.secondary};
          border-right: 1px solid ${theme.colors.border.medium};
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: width 0.2s ease;
          width: ${collapsed ? theme.spacing(8) : theme.spacing(32)};
        `
      )}
    >
      <Button
        variant="secondary"
        icon={collapsed ? 'angle-double-right' : 'angle-double-left'}
        onClick={() => {
          setCollapsed((value) => {
            const next = !value;
            toggle({ collapsed: next });
            return next;
          });
        }}
        className={css`
          margin: ${theme.spacing(1)};
        `}
      >
        {t('navigation.toggle')}
      </Button>
      <nav
        className={css`
          overflow-y: auto;
          padding: ${theme.spacing(1)};
        `}
      >
        <VerticalGroup spacing="sm">
          {items.map((item) => {
            const permitted = item.permissions?.every((permission) =>
              hasPermission(permission.resource as never, permission.action as never)
            );
            if (item.permissions && !permitted) {
              return null;
            }
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  cx(
                    css`
                      align-items: center;
                      border-radius: ${theme.shape.borderRadius(1)};
                      color: ${theme.colors.text.primary};
                      display: flex;
                      gap: ${theme.spacing(1)};
                      padding: ${theme.spacing(1)};
                      text-decoration: none;
                      &:hover {
                        background: ${theme.colors.background.hover};
                      }
                    `,
                    isActive &&
                      css`
                        background: ${theme.colors.action.selected};
                      `
                  )
                }
              >
                {item.icon && <Icon name={item.icon} />}
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </VerticalGroup>
      </nav>
    </aside>
  );
}
