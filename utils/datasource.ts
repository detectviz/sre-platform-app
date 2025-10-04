import { ConnectionStatus } from '../types';
import { StatusTone } from '../components/StatusTag';

export interface DatasourceStatusMeta {
  label: string;
  tone: StatusTone;
  icon: string;
  description: string;
}

export const DATASOURCE_STATUS_META: Record<ConnectionStatus, DatasourceStatusMeta> = {
  ok: {
    label: '連線正常',
    tone: 'success',
    icon: 'check-circle',
    description: '最近一次測試已通過，連線設定正常運作。',
  },
  error: {
    label: '連線失敗',
    tone: 'danger',
    icon: 'alert-triangle',
    description: '最近一次測試失敗，請檢查網路、驗證或權限設定。',
  },
  pending: {
    label: '測試中',
    tone: 'info',
    icon: 'loader-2',
    description: '已送出測試請求，等待結果更新。',
  },
};

export const getDatasourceStatusMeta = (status: ConnectionStatus): DatasourceStatusMeta =>
  DATASOURCE_STATUS_META[status] ?? DATASOURCE_STATUS_META.pending;

