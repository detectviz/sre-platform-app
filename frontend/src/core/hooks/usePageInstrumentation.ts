import { useEffect } from 'react';
import { metricsService } from '../services/metrics';
import { loggingService } from '../services/logging';
import { OBSERVABILITY_EVENTS } from '../constants/events';
import { useAuthContext } from '../contexts/AuthContext';

export function usePageInstrumentation(pageId: string, metadata?: Record<string, unknown>) {
  const { tenantId, user } = useAuthContext();
  useEffect(() => {
    metricsService.increment(OBSERVABILITY_EVENTS.pageView, { pageId, tenantId });
    loggingService.info('Page viewed', { pageId, tenantId, user: user?.id, ...metadata });
  }, [pageId, tenantId, user, JSON.stringify(metadata ?? {})]);
}
