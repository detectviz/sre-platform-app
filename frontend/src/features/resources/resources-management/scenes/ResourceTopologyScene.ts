import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface ResourceTopologySceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class ResourceTopologyScene extends SceneObjectBase<ResourceTopologySceneState> {
  constructor() {
    super({ title: 'Resource health topology', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createResourceTopologyScene() {
  return new ResourceTopologyScene();
}
