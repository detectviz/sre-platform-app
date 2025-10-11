import { Card } from '@grafana/ui';
import { useI18n } from '@core/i18n';

interface KPIBlockProps {
  labelKey: string;
  value: string;
  trend?: string;
}

export function KPIBlock({ labelKey, value, trend }: KPIBlockProps) {
  const { t } = useI18n();
  return (
    <Card heading={t(labelKey)}>
      <div>{value}</div>
      {trend && <small>{trend}</small>}
    </Card>
  );
}
