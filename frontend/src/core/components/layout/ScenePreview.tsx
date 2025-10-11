import { Card, Spinner } from '@grafana/ui';
import { SceneObjectBase, SceneObjectState } from '@grafana/scenes';
import { useEffect, useState } from 'react';
import { useI18n } from '@core/i18n';
import { logging } from '@core/services/logging';

interface ScenePreviewProps<TState extends SceneObjectState> {
  scene: SceneObjectBase<TState>;
}

export function ScenePreview<TState extends SceneObjectState>({ scene }: ScenePreviewProps<TState>) {
  const { t } = useI18n();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    scene.activate?.();
    logging.info('scene:activate', {
      module: 'core.scene',
      scope: scene.state?.title ?? 'scene',
    });
    setIsActive(true);
    return () => {
      scene.deactivate?.();
    };
  }, [scene]);

  return (
    <Card heading={scene.state?.title ?? 'Scene'}>
      {isActive ? <pre>{JSON.stringify(scene.state, null, 2)}</pre> : <Spinner label={t('scenes.loading')} />}
    </Card>
  );
}
