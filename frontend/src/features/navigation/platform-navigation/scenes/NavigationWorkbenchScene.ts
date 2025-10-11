import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface NavigationWorkbenchSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class NavigationWorkbenchScene extends SceneObjectBase<NavigationWorkbenchSceneState> {
  constructor() {
    super({ title: 'Navigation experiment stream', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createNavigationWorkbenchScene() {
  return new NavigationWorkbenchScene();
}
