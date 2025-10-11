import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface SreDashboardSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class SreDashboardScene extends SceneObjectBase<SreDashboardSceneState> {
  constructor() {
    super({ title: 'SRE dashboard adoption', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createSreDashboardScene() {
  return new SreDashboardScene();
}
