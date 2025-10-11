import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface MailPipelineSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class MailPipelineScene extends SceneObjectBase<MailPipelineSceneState> {
  constructor() {
    super({ title: 'Mail delivery telemetry', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createMailPipelineScene() {
  return new MailPipelineScene();
}
