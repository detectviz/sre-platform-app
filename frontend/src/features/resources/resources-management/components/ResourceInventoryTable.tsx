import { useMemo } from 'react';
import { Table } from '@grafana/ui';
import { useI18n } from '@core/i18n';

export interface ResourceRow {
  name: string;
  status: string;
  owner: string;
  environment: string;
}

interface ResourceInventoryTableProps {
  rows: ResourceRow[];
}

export function ResourceInventoryTable({ rows }: ResourceInventoryTableProps) {
  const { t } = useI18n();
  const columns = useMemo(() => ([
    { id: 'name', title: t('table.columns.name') },
    { id: 'status', title: t('table.columns.status') },
    { id: 'owner', title: t('table.columns.owner') },
    { id: 'environment', title: t('table.columns.environment') },
  ]), [t]);
  return <Table columns={columns} data={rows} />;
}
