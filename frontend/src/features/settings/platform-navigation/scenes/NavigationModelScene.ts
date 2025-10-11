import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface NavigationModelSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class NavigationModelScene extends SceneObjectBase<NavigationModelSceneState> {
  constructor() {
    super({ title: 'Navigation topology heatmap', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createNavigationModelScene() {
  return new NavigationModelScene();
}
