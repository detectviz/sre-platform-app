import { useMemo } from 'react';
import { Table } from '@grafana/ui';
import { useI18n } from '@core/i18n';

export interface InsightForecastRow {
  name: string;
  status: string;
  owner: string;
  updatedAt: string;
}

interface InsightForecastTableProps {
  rows: InsightForecastRow[];
}

export function InsightForecastTable({ rows }: InsightForecastTableProps) {
  const { t } = useI18n();
  const columns = useMemo(() => ([
    { id: 'name', title: t('table.columns.name') },
    { id: 'status', title: t('table.columns.status') },
    { id: 'owner', title: t('table.columns.owner') },
    { id: 'updatedAt', title: t('table.columns.updatedAt') },
  ]), [t]);
  return <Table columns={columns} data={rows} />;
}
