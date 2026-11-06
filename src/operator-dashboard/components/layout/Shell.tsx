import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function Shell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
      <TopBar sidebarCollapsed={sidebarCollapsed} />

      {/* Main content area */}
      <main
        className={`
          pt-14 min-h-screen transition-[margin-left] duration-200
          ${sidebarCollapsed ? 'ml-16' : 'ml-56'}
        `}
      >
        {/* Demo data banner */}
        <div className="px-4 lg:px-6 pt-3">
          <div className="demo-banner flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full" />
            SIMULATED DATA — NO PHYSICAL DEVICES CONNECTED
          </div>
        </div>

        {/* Page content */}
        <div className="px-4 lg:px-6 py-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
