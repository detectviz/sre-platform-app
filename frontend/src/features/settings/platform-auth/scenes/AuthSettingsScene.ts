import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface AuthSettingsSceneModelState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class AuthSettingsSceneModel extends SceneObjectBase<AuthSettingsSceneModelState> {
  constructor() {
    super({ title: 'Auth provider compliance', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createAuthSettingsScene() {
  return new AuthSettingsSceneModel();
}
