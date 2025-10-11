import { useCallback } from 'react';
import { metricsService } from '../services/metrics';
import { loggingService } from '../services/logging';
import { OBSERVABILITY_EVENTS } from '../constants/events';
import { useAuthContext } from '../contexts/AuthContext';

export function useActionTelemetry(actionId: string, module: string) {
  const { tenantId, user } = useAuthContext();
  return useCallback(
    (extra?: Record<string, unknown>) => {
      metricsService.increment(OBSERVABILITY_EVENTS.actionClick, { actionId, module });
      loggingService.debug('Action triggered', {
        actionId,
        module,
        tenantId,
        user: user?.id,
        ...extra
      });
    },
    [actionId, module, tenantId, user]
  );
}
