import { SceneFlexItem, SceneFlexLayout, VizPanel } from '@grafana/scenes';
import { useEffect } from 'react';
import { css } from '@emotion/css';
import { useI18n } from '../../core/i18n';
import { loggingService } from '../../core/services/logging';
import { metricsService } from '../../core/services/metrics';
import { SCENE_EVENTS } from '../../core/constants/events';

export function LogExplorerScene() {
  const { t } = useI18n();

  useEffect(() => {
    const layout = new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({
          body: new VizPanel({
            title: t('page.insight.log.title'),
            pluginId: 'logs',
            options: {}
          })
        })
      ]
    });
    loggingService.info('Log scene initialized', { event: SCENE_EVENTS.variablesChanged });
    metricsService.increment('scene.insight.initialized');
    return () => {
      layout.destroy?.();
      loggingService.debug('Log scene disposed', { event: SCENE_EVENTS.panelRenderError });
    };
  }, [t]);

  return (
    <div
      className={css`
        min-height: 240px;
      `}
    >
      {t('page.insight.log.description')}
    </div>
  );
}
