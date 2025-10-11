import { css } from '@emotion/css';
import { ReactNode } from 'react';
import { NavHeader } from '../navigation/NavHeader';
import { NavSidebar } from '../navigation/NavSidebar';
import { NavBreadcrumb } from '../navigation/NavBreadcrumb';

export function AppChrome({ children }: { children: ReactNode }) {
  return (
    <div
      className={css`
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto 1fr;
        height: 100vh;
        overflow: hidden;
      `}
    >
      <div
        className={css`
          grid-column: 1 / span 2;
          grid-row: 1;
          position: sticky;
          top: 0;
          z-index: 10;
        `}
      >
        <NavHeader />
      </div>
      <div
        className={css`
          grid-column: 1;
          grid-row: 2 / span 2;
        `}
      >
        <NavSidebar />
      </div>
      <div
        className={css`
          grid-column: 2;
          grid-row: 2;
        `}
      >
        <NavBreadcrumb />
      </div>
      <main
        className={css`
          grid-column: 2;
          grid-row: 3;
          overflow: auto;
        `}
      >
        {children}
      </main>
    </div>
  );
}
