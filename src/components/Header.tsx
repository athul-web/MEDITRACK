import React, { useState } from 'react';
import { UserRole, NotificationItem, FacilitySettings } from '../types';
import {
  Activity,
  Bell,
  ShieldCheck,
  User,
  Settings as SettingsIcon,
  AlertTriangle,
  Check,
  PlusCircle,
  Stethoscope,
  Wrench,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onNotificationClick: (notifId: string, equipmentId?: string) => void;
  onOpenReportModal: () => void;
  onOpenSettingsModal: () => void;
  onLogout: () => void;
  facilitySettings: FacilitySettings;
  fleetUptime: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  notifications,
  onMarkAllNotificationsRead,
  onNotificationClick,
  onOpenReportModal,
  onOpenSettingsModal,
  onLogout,
  facilitySettings,
  fleetUptime,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and Facility Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 tracking-tight text-base sm:text-lg">
                  Equipment Uptime
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {fleetUptime.toFixed(1)}% Fleet Uptime
                </span>
              </div>
              <p id="header-facility-name" className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                {facilitySettings?.hospitalName || 'Medical Center'} • Clinical Engineering
              </p>
            </div>
          </div>

          {/* Center/Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Report Button */}
            <button
              id="header-report-btn"
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
              title="Report equipment breakdown or malfunction"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden xs:inline">Report Problem</span>
            </button>

            {/* Notification Popover Button */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white p-4 shadow-lg border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">Equipment Alerts</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-700">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No equipment notifications
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          id={`notification-item-${notif.id}`}
                          onClick={() => {
                            onNotificationClick(notif.id, notif.equipmentId);
                            setShowNotifications(false);
                          }}
                          className={`py-2.5 px-2.5 rounded-lg cursor-pointer transition-colors ${
                            notif.read ? 'hover:bg-slate-50 opacity-75' : 'bg-slate-50 hover:bg-slate-100 font-medium border border-slate-100'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                              notif.type === 'alert' ? 'bg-rose-500' :
                              notif.type === 'warning' ? 'bg-amber-500' :
                              notif.type === 'success' ? 'bg-emerald-500' : 'bg-sky-500'
                            }`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-900 truncate">{notif.title}</p>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                                {!notif.read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onNotificationClick(notif.id, undefined);
                                    }}
                                    className="text-[10px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
                                    title="Mark this alert as read"
                                  >
                                    <Check className="w-3 h-3" /> Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Facility Settings Button */}
            {currentRole === 'Admin' && (
              <button
                id="facility-settings-btn"
                onClick={onOpenSettingsModal}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Facility Configuration & Team"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            )}

            {/* Logout Button */}
            <button
              id="header-logout-btn"
              onClick={onLogout}
              className="p-2 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
              title="Sign out of session"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
