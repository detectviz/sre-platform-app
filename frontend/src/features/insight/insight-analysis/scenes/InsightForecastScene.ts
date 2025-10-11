import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface InsightForecastSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class InsightForecastScene extends SceneObjectBase<InsightForecastSceneState> {
  constructor() {
    super({ title: 'Forecast variance monitor', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createInsightForecastScene() {
  return new InsightForecastScene();
}
