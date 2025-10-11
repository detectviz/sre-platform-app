import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface IncidentRulesSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class IncidentRulesScene extends SceneObjectBase<IncidentRulesSceneState> {
  constructor() {
    super({ title: 'Alert rule burn rate', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createIncidentRulesScene() {
  return new IncidentRulesScene();
}
