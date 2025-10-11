import { css } from '@emotion/css';
import { Badge, Button, Table, useTheme2 } from '@grafana/ui';
import { useMemo } from 'react';
import { useI18n } from '../../../core/i18n';
import { useActionTelemetry } from '../../../core/hooks/useActionTelemetry';

interface RowData {
  id: string;
  name: string;
  owner: string;
  status: string;
  updatedAt: string;
}

export function NavigationPreviewDrawer() {
  const theme = useTheme2();
  const { t } = useI18n();
  const rows = useMemo<RowData[]>(
    () => [
      { id: 'row-1', name: 'Example item', owner: 'team-sre', status: 'active', updatedAt: new Date().toISOString() }
    ],
    []
  );
  const onInspect = useActionTelemetry('platform.navigation.component.inspect', 'platform.navigation');

  return (
    <div
      className={css`
        border: 1px solid ${theme.colors.border.medium};
        border-radius: ${theme.shape.borderRadius(1)};
        padding: ${theme.spacing(2)};
      `}
    >
      <Table
        data={rows}
        columns={{
          name: { header: t('page.platformNavigation.title'), cell: ({ row }) => row.name },
          owner: { header: t('table.owner.column'), cell: ({ row }) => row.owner },
          status: {
            header: t('table.status.column'),
            cell: ({ row }) => <Badge text={row.status} />
          },
          updatedAt: { header: t('table.updatedAt.column'), cell: ({ row }) => row.updatedAt },
          actions: {
            header: t('table.actions.column'),
            cell: ({ row }) => (
              <Button variant="secondary" size="sm" onClick={() => onInspect({ id: row.id })}>
                {t('toolbar.refresh')}
              </Button>
            )
          }
        }}
      />
    </div>
  );
}
