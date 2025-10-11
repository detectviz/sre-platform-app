import { SceneFlexItem, SceneFlexLayout, VizPanel } from '@grafana/scenes';
import { useEffect } from 'react';
import { css } from '@emotion/css';
import { useI18n } from '../../core/i18n';
import { loggingService } from '../../core/services/logging';
import { metricsService } from '../../core/services/metrics';
import { SCENE_EVENTS } from '../../core/constants/events';

export function IncidentTimelineScene() {
  const { t } = useI18n();

  useEffect(() => {
    const layout = new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({
          body: new VizPanel({
            title: t('scene.incidents.timeline'),
            pluginId: 'stat',
            options: {}
          })
        })
      ]
    });
    loggingService.info('Incident scene initialized', { event: SCENE_EVENTS.timeRangeChanged });
    metricsService.increment('scene.incidents.initialized');
    return () => {
      layout.destroy?.();
      loggingService.debug('Incident scene disposed', { event: SCENE_EVENTS.panelRenderError });
    };
  }, [t]);

  return (
    <div
      className={css`
        min-height: 240px;
      `}
    >
      {t('scene.incidents.timeline')}
    </div>
  );
}
