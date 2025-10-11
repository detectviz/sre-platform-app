export const OBSERVABILITY_EVENTS = {
  pageView: 'metrics.page_view',
  actionClick: 'metrics.action_click',
  apiLatency: 'metrics.api_latency',
  audit: 'audit.event',
  notification: 'notify.event'
} as const;

export type ObservabilityEvent = (typeof OBSERVABILITY_EVENTS)[keyof typeof OBSERVABILITY_EVENTS];

export const SCENE_EVENTS = {
  timeRangeChanged: 'scene:time_range_changed',
  variablesChanged: 'scene:variables_changed',
  panelRenderError: 'scene:panel_render_error'
} as const;
