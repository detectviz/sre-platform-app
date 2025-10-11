import { css } from '@emotion/css';
import { Icon, useTheme2 } from '@grafana/ui';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: ReactNode;
  description?: ReactNode;
}

export function EmptyState({ icon = 'info-circle', title, description }: EmptyStateProps) {
  const theme = useTheme2();
  return (
    <div
      className={css`
        align-items: center;
        border: 1px dashed ${theme.colors.border.weak};
        border-radius: ${theme.shape.borderRadius(1)};
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing(1)};
        padding: ${theme.spacing(4)};
        text-align: center;
      `}
    >
      <Icon name={icon} size="xxl" />
      <strong>{title}</strong>
      {description && <p>{description}</p>}
    </div>
  );
}
