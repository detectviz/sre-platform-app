import { SceneFlexItem, SceneFlexLayout, VizPanel } from '@grafana/scenes';
import { useEffect } from 'react';
import { css } from '@emotion/css';
import { useI18n } from '../../core/i18n';
import { loggingService } from '../../core/services/logging';
import { metricsService } from '../../core/services/metrics';
import { SCENE_EVENTS } from '../../core/constants/events';

export function DashboardOverviewScene() {
  const { t } = useI18n();

  useEffect(() => {
    const layout = new SceneFlexLayout({
      direction: 'row',
      children: [
        new SceneFlexItem({
          body: new VizPanel({
            title: t('scene.dashboards.overview'),
            pluginId: 'bargauge',
            options: {}
          })
        })
      ]
    });
    loggingService.info('Dashboard scene initialized', { event: SCENE_EVENTS.variablesChanged });
    metricsService.increment('scene.dashboards.initialized');
    return () => {
      layout.destroy?.();
      loggingService.debug('Dashboard scene disposed', { event: SCENE_EVENTS.panelRenderError });
    };
  }, [t]);

  return (
    <div
      className={css`
        min-height: 240px;
      `}
    >
      {t('scene.dashboards.overview')}
    </div>
  );
}
