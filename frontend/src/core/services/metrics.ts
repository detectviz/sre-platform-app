import { loggingService } from './logging';
import { OBSERVABILITY_EVENTS } from '../constants/events';

type MetricType = 'counter' | 'histogram';

interface MetricRecord {
  name: string;
  type: MetricType;
  labels?: Record<string, string>;
  value?: number;
}

const recordMetric = (metric: MetricRecord) => {
  loggingService.debug('Metric recorded', { event: metric.name ?? OBSERVABILITY_EVENTS.actionClick, ...metric });
};

export const metricsService = {
  increment: (name: string, labels?: Record<string, string>) =>
    recordMetric({ name, type: 'counter', value: 1, labels }),
  observe: (name: string, value: number, labels?: Record<string, string>) =>
    recordMetric({ name, type: 'histogram', value, labels })
};
