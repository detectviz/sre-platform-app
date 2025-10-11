import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface LogInsightSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class LogInsightScene extends SceneObjectBase<LogInsightSceneState> {
  constructor() {
    super({ title: 'Log anomaly density', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createLogInsightScene() {
  return new LogInsightScene();
}
