import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface IamOverviewSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class IamOverviewScene extends SceneObjectBase<IamOverviewSceneState> {
  constructor() {
    super({ title: 'RBAC assignment coverage', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createIamOverviewScene() {
  return new IamOverviewScene();
}
