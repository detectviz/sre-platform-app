import { useMemo } from 'react';
import { Table } from '@grafana/ui';
import { useI18n } from '@core/i18n';

export interface PreferenceRow {
  name: string;
  status: string;
  owner: string;
  updatedAt: string;
}

interface UserPreferenceDrawerProps {
  rows: PreferenceRow[];
}

export function UserPreferenceDrawer({ rows }: UserPreferenceDrawerProps) {
  const { t } = useI18n();
  const columns = useMemo(() => ([
    { id: 'name', title: t('table.columns.name') },
    { id: 'status', title: t('table.columns.status') },
    { id: 'owner', title: t('table.columns.owner') },
    { id: 'updatedAt', title: t('table.columns.updatedAt') },
  ]), [t]);
  return <Table columns={columns} data={rows} />;
}
