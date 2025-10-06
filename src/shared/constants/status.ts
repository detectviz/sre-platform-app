import type { LoginStatus } from '@/shared/types';
import type { StatusTagProps } from '../components/StatusTag';

export const LOGIN_STATUS = {
  SUCCESS: 'success' as LoginStatus,
  FAILED: 'failed' as LoginStatus,
} as const;

export type LoginStatusKey = keyof typeof LOGIN_STATUS;
export type LoginStatusValue = (typeof LOGIN_STATUS)[LoginStatusKey];

export const LOGIN_STATUS_TONE: Record<LoginStatusValue, StatusTagProps['tone']> = {
  success: 'success',
  failed: 'danger',
};
