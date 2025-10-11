import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';

interface IncidentTimelineSceneState extends SceneObjectState {
  title: string;
  telemetry: Array<{ metric: string; value: number }>;
}

class IncidentTimelineScene extends SceneObjectBase<IncidentTimelineSceneState> {
  constructor() {
    super({ title: 'Incident response latency', telemetry: [] });
  }

  track(metric: string) {
    const telemetry = this.state.telemetry ?? [];
    this.setState({ telemetry: [...telemetry, { metric, value: Date.now() }] });
  }
}

export function createIncidentTimelineScene() {
  return new IncidentTimelineScene();
}
