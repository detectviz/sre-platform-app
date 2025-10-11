import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface AutomationRunbookSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class AutomationRunbookScene extends SceneObjectBase<AutomationRunbookSceneState> {
  constructor() {
    super({ title: 'Automation reliability score', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createAutomationRunbookScene() {
  return new AutomationRunbookScene();
}
