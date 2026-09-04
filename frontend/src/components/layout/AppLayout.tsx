// ============================================================
// App Layout — Main Layout Shell
// ============================================================
// Wraps authenticated pages with the sidebar and top bar.
// Uses React Router's <Outlet /> to render child routes.
// ============================================================

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
