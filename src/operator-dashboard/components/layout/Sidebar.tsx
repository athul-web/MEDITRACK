import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import {
  LayoutDashboard,
  Monitor,
  Activity,
  Wrench,
  Bell,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/equipment', label: 'Equipment', icon: Monitor },
  { to: '/dashboard/monitoring', label: 'Live Monitoring', icon: Activity },
  { to: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/dashboard/alerts', label: 'Alerts & Events', icon: Bell },
  { to: '/dashboard/resources', label: 'Resource Status', icon: Package },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const activeAlerts = 0; // bound to real alerts later
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <aside
      className={`
        fixed top-0 left-0 z-30 h-screen bg-navy-900 text-white
        flex flex-col transition-[width] duration-200
        ${collapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Brand */}
      <div className="flex items-center h-14 px-4 border-b border-navy-700 shrink-0">
        <Plus className="w-5 h-5 text-teal-400 shrink-0" strokeWidth={3} />
        {!collapsed && (
          <span className="ml-2 font-semibold text-sm tracking-wide whitespace-nowrap">
            MediTrack
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors
                   ${isActive
                      ? 'bg-navy-700 text-white'
                      : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                   }`
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                {!collapsed && label === 'Alerts & Events' && activeAlerts > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                    {activeAlerts}
                  </span>
                )}
                {collapsed && label === 'Alerts & Events' && activeAlerts > 0 && (
                  <span className="absolute left-10 top-1 bg-red-500 rounded-full w-2 h-2" />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign out */}
      <button
        onClick={async () => {
          setIsSigningOut(true);
          try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/login', { replace: true });
          } catch (error) {
            console.error('Sign out failed:', error);
            setIsSigningOut(false);
          }
        }}
        disabled={isSigningOut}
        className="flex items-center gap-3 px-3 py-2 mx-2 mb-1 rounded text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors disabled:opacity-60"
        title={collapsed ? (isSigningOut ? 'Signing out…' : 'Sign out') : undefined}
      >
        <LogOut className="w-[18px] h-[18px] shrink-0" />
        {!collapsed && <span className="whitespace-nowrap">{isSigningOut ? 'Signing out…' : 'Sign out'}</span>}
      </button>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-navy-700 text-navy-400 hover:text-white transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
