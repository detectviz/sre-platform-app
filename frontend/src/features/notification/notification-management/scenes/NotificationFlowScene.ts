import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface NotificationFlowSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class NotificationFlowScene extends SceneObjectBase<NotificationFlowSceneState> {
  constructor() {
    super({ title: 'Notification delivery flow', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createNotificationFlowScene() {
  return new NotificationFlowScene();
}
