import { SceneFlexItem, SceneFlexLayout, VizPanel } from '@grafana/scenes';
import { useEffect } from 'react';
import { css } from '@emotion/css';
import { useI18n } from '../../core/i18n';
import { loggingService } from '../../core/services/logging';
import { metricsService } from '../../core/services/metrics';
import { SCENE_EVENTS } from '../../core/constants/events';

export function ResourceOverviewScene() {
  const { t } = useI18n();

  useEffect(() => {
    const layout = new SceneFlexLayout({
      direction: 'row',
      children: [
        new SceneFlexItem({
          body: new VizPanel({
            title: t('scene.resources.overview'),
            pluginId: 'timeseries',
            options: {}
          })
        })
      ]
    });
    loggingService.info('Resource scene initialized', { event: SCENE_EVENTS.variablesChanged });
    metricsService.increment('scene.resources.initialized');
    return () => {
      layout.destroy?.();
      loggingService.debug('Resource scene disposed', { event: SCENE_EVENTS.panelRenderError });
    };
  }, [t]);

  return (
    <div
      className={css`
        min-height: 240px;
      `}
    >
      {t('scene.resources.overview')}
    </div>
  );
}
