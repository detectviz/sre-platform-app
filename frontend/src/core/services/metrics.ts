export type MetricLabels = Record<string, string | number>;

type HistogramRecord = {
  labels: MetricLabels;
  value: number;
};

const counters: Record<string, number> = {};
const histograms: Record<string, HistogramRecord[]> = {};

function incrementCounter(name: string, labels: MetricLabels = {}) {
  const key = `${name}:${JSON.stringify(labels)}`;
  counters[key] = (counters[key] ?? 0) + 1;
  console.log('[Metrics] counter', name, labels, counters[key]);
}

function observeHistogram(name: string, value: number, labels: MetricLabels = {}) {
  histograms[name] = histograms[name] ?? [];
  histograms[name].push({ labels, value });
  console.log('[Metrics] histogram', name, labels, value);
}

export const metrics = {
  pageView(pageId: string, labels: MetricLabels = {}) {
    incrementCounter('page_view', { pageId, ...labels });
  },
  actionClick(actionId: string, labels: MetricLabels = {}) {
    incrementCounter('action_click', { actionId, ...labels });
  },
  apiLatency(api: string, ms: number, labels: MetricLabels = {}) {
    observeHistogram('api_latency', ms, { api, ...labels });
  },
};
