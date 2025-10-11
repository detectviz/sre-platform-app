import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface UserPreferenceSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class UserPreferenceScene extends SceneObjectBase<UserPreferenceSceneState> {
  constructor() {
    super({ title: 'Preference adoption rate', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createUserPreferenceScene() {
  return new UserPreferenceScene();
}
