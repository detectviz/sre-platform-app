import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface TagGovernanceSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class TagGovernanceScene extends SceneObjectBase<TagGovernanceSceneState> {
  constructor() {
    super({ title: 'Tag governance maturity', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createTagGovernanceScene() {
  return new TagGovernanceScene();
}
