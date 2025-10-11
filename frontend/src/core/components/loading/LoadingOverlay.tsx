import { css } from '@emotion/css';
import { Spinner, useTheme2 } from '@grafana/ui';

export function LoadingOverlay() {
  const theme = useTheme2();
  return (
    <div
      className={css`
        align-items: center;
        display: flex;
        height: 100%;
        justify-content: center;
        width: 100%;
        background: ${theme.colors.background.canvas};
      `}
    >
      <Spinner />
    </div>
  );
}
