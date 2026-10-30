import React from 'react';
import { useLocation } from 'react-router-dom';
import { Building2, Calendar, Radio } from 'lucide-react';
import { useClock } from '../../hooks/useClock';
/* simulation store removed for Stage 1; real telemetry integration pending */
import { format } from 'date-fns';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/equipment': 'Equipment Inventory',
  '/dashboard/monitoring': 'Live Monitoring',
  '/dashboard/maintenance': 'Maintenance',
  '/dashboard/alerts': 'Alerts & Events',
  '/dashboard/resources': 'Resource Status',
  '/dashboard/settings': 'Settings',
};

interface TopBarProps {
  sidebarCollapsed: boolean;
}

export function TopBar({ sidebarCollapsed }: TopBarProps) {
  const location = useLocation();
  const now = useClock();
  const isRunning = false;

  const pageTitle = pageTitles[location.pathname] || 'MediTrack';

  return (
    <header
      className={`
        fixed top-0 right-0 z-20 h-14 bg-white border-b border-neutral-200
        flex items-center justify-between px-4 lg:px-6
        transition-[left] duration-200
        ${sidebarCollapsed ? 'left-16' : 'left-56'}
      `}
    >
      {/* Left: Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-base font-semibold text-navy-900 truncate">{pageTitle}</h1>
      </div>

      {/* Right: Hospital selector, date, simulation indicator */}
      <div className="flex items-center gap-4 text-sm shrink-0">
        {/* Hospital selector (demo) */}
        <div className="hidden md:flex items-center gap-1.5 text-navy-600">
          <Building2 className="w-4 h-4 text-navy-400" />
          <span className="font-medium">MediTrack Clinical Operations</span>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-5 bg-neutral-200" />

        {/* Date/time */}
        <div className="hidden sm:flex items-center gap-1.5 text-navy-500">
          <Calendar className="w-3.5 h-3.5" />
          <time dateTime={now.toISOString()} className="tabular-nums">
            {format(now, 'dd MMM yyyy · HH:mm:ss')}
          </time>
        </div>

        {/* Simulation indicator */}
        <div
          className={`
            flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium
            ${isRunning
              ? 'bg-teal-50 text-teal-700'
              : 'bg-neutral-100 text-neutral-500'
            }
          `}
        >
          <Radio className={`w-3 h-3 ${isRunning ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">{isRunning ? 'Sim Active' : 'Telemetry pending (not live)'}</span>
        </div>
      </div>
    </header>
  );
}
