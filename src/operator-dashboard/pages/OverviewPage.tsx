import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ArrowRight,
  Clock,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { supabase, mapDbToFrontend, getCurrentUserHospitalId } from '../../lib/supabase';
import { Equipment, ProblemReport, MaintenanceRecord, NotificationItem, FacilitySettings } from '../../types';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';

interface LoadState {
  equipment: boolean;
  reports: boolean;
  maintenance: boolean;
  notifications: boolean;
  settings: boolean;
}

export function Overview() {
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [problemReports, setProblemReports] = useState<ProblemReport[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hospitalName, setHospitalName] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [partialErrors, setPartialErrors] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<LoadState>({
    equipment: false,
    reports: false,
    maintenance: false,
    notifications: false,
    settings: false,
  });

  useEffect(() => {
    let isActive = true;

    async function loadOverviewData() {
      setIsLoading(true);
      setLoadError(null);
      setPartialErrors([]);
      const nextLoaded: LoadState = {
        equipment: false,
        reports: false,
        maintenance: false,
        notifications: false,
        settings: false,
      };

      try {
        const currentHospitalId = await getCurrentUserHospitalId();

        const results = await Promise.allSettled([
          supabase.from('equipment').select('*'),
          supabase.from('problem_reports').select('*'),
          supabase.from('maintenance_records').select('*'),
          supabase.from('notifications').select('*'),
          supabase
            .from('facility_settings')
            .select('*')
            .eq('hospital_id', currentHospitalId)
            .maybeSingle(),
        ]);

        const optionalWarnings: string[] = [];

        const equipmentResult = results[0];
        if (equipmentResult.status === 'rejected') {
          throw equipmentResult.reason;
        }
        if (equipmentResult.value.error) {
          throw equipmentResult.value.error;
        }
        if (isActive) {
          setEquipment(mapDbToFrontend<Equipment[]>(equipmentResult.value.data ?? []));
          nextLoaded.equipment = true;
        }

        const reportResult = results[1];
        if (reportResult.status === 'fulfilled' && !reportResult.value.error) {
          if (isActive) {
            setProblemReports(mapDbToFrontend<ProblemReport[]>(reportResult.value.data ?? []));
            nextLoaded.reports = true;
          }
        } else {
          optionalWarnings.push('problem reports');
        }

        const maintenanceResult = results[2];
        if (maintenanceResult.status === 'fulfilled' && !maintenanceResult.value.error) {
          if (isActive) {
            setMaintenanceRecords(mapDbToFrontend<MaintenanceRecord[]>(maintenanceResult.value.data ?? []));
            nextLoaded.maintenance = true;
          }
        } else {
          optionalWarnings.push('maintenance records');
        }

        const notificationResult = results[3];
        if (notificationResult.status === 'fulfilled' && !notificationResult.value.error) {
          if (isActive) {
            setNotifications(mapDbToFrontend<NotificationItem[]>(notificationResult.value.data ?? []));
            nextLoaded.notifications = true;
          }
        } else {
          optionalWarnings.push('notifications');
        }

        const settingsResult = results[4];
        if (settingsResult.status === 'fulfilled' && !settingsResult.value.error) {
          if (isActive) {
            const settings = settingsResult.value.data
              ? mapDbToFrontend<FacilitySettings>(settingsResult.value.data)
              : null;
            setHospitalName(settings?.hospitalName ?? null);
            nextLoaded.settings = true;
          }
        } else {
          optionalWarnings.push('facility settings');
        }

        if (isActive) {
          setLoaded(nextLoaded);
          setPartialErrors(optionalWarnings);
        }
      } catch (err: any) {
        if (isActive) {
          setLoadError(err?.message || 'Unable to load overview data.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadOverviewData();

    return () => {
      isActive = false;
    };
  }, []);

  const totalEquipment = equipment.length;
  const workingCount = equipment.filter((item) => item.status === 'Working').length;
  const needsAttentionCount = equipment.filter((item) => item.status === 'Needs Attention').length;
  const downCount = equipment.filter((item) => item.status === 'Down').length;
  const underMaintenanceCount = equipment.filter((item) => item.status === 'Under Maintenance').length;
  const lifeSupportCount = equipment.filter((item) => item.criticality === 'Life Support').length;

  const openProblemReports = problemReports.filter((report) => report.status !== 'Resolved').length;
  const criticalOpenReports = problemReports.filter(
    (report) => report.status !== 'Resolved' && report.severity === 'Critical'
  ).length;
  const unreadNotifications = notifications.filter((item) => !item.read).length;

  const recentReports = useMemo(() => {
    return [...problemReports]
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
      .slice(0, 5);
  }, [problemReports]);

  const recentNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [notifications]);

  const recentMaintenance = useMemo(() => {
    return [...maintenanceRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [maintenanceRecords]);

  const attentionEquipment = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.getTime();
    return equipment
      .filter((item) => {
        if (item.status !== 'Working') return true;
        if (!item.nextScheduledMaintenance) return false;
        const nextDate = Date.parse(item.nextScheduledMaintenance);
        return Number.isFinite(nextDate) && nextDate < startOfToday;
      })
      .slice(0, 6);
  }, [equipment]);

  if (isLoading) {
    return <div className="py-12 text-center text-navy-500 text-sm">Loading overview data…</div>;
  }

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Operations Overview</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Equipment readiness, problem reports, maintenance activity
            {hospitalName ? ` for ${hospitalName}` : ''}
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/equipment"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 hover:border-navy-300 text-navy-700 text-xs font-medium rounded transition-colors"
          >
            <Monitor className="w-3.5 h-3.5 text-teal-600" />
            Equipment Inventory
          </Link>
        </div>
      </div>

      {partialErrors.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          Some supporting data could not be loaded: {partialErrors.join(', ')}.
        </div>
      )}

      {/* Operational Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          label="Registered Equipment"
          value={loaded.equipment ? totalEquipment : 'Unavailable'}
          icon={Monitor}
          iconColor="text-navy-500"
          subtitle="All inventoried units"
          onClick={() => navigate('/dashboard/equipment')}
        />
        <MetricCard
          label="Working"
          value={loaded.equipment ? workingCount : 'Unavailable'}
          icon={CheckCircle2}
          iconColor="text-teal-600"
          subtitle="Reporting normally"
          onClick={() => navigate('/dashboard/equipment')}
        />
        <MetricCard
          label="Needs Attention"
          value={loaded.equipment ? needsAttentionCount : 'Unavailable'}
          icon={AlertTriangle}
          iconColor={needsAttentionCount > 0 ? 'text-amber-600' : 'text-neutral-400'}
          subtitle="Abnormal status"
          onClick={() => navigate('/dashboard/equipment')}
        />
        <MetricCard
          label="Open Problem Reports"
          value={loaded.reports ? openProblemReports : 'Unavailable'}
          icon={Wrench}
          iconColor={openProblemReports > 0 ? 'text-red-600' : 'text-neutral-400'}
          subtitle={
            loaded.reports
              ? criticalOpenReports > 0
                ? `${criticalOpenReports} critical`
                : 'All reported issues'
              : 'Unavailable'
          }
        />
        <MetricCard
          label="Unread Notifications"
          value={loaded.notifications ? unreadNotifications : 'Unavailable'}
          icon={Activity}
          iconColor={unreadNotifications > 0 ? 'text-blue-600' : 'text-neutral-400'}
          subtitle="Unread alerts"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Equipment Requiring Attention */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
            <div>
              <h2 className="text-sm font-semibold text-navy-900">Equipment Requiring Attention</h2>
              <p className="text-xs text-navy-500">
                Units with abnormal status or overdue scheduled maintenance.
              </p>
            </div>
            <Link
              to="/dashboard/equipment"
              className="text-xs text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1"
            >
              View inventory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {!loaded.equipment ? (
              <div className="py-8 text-center text-xs text-neutral-500">Equipment data unavailable.</div>
            ) : attentionEquipment.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                All tracked equipment units are currently operating within normal parameters.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-navy-600 font-medium">
                  <tr>
                    <th className="px-4 py-2">ID &amp; Name</th>
                    <th className="px-3 py-2">Department / Room</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Criticality</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {attentionEquipment.map((eq) => (
                    <tr key={eq.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-navy-900">{eq.id}</div>
                        <div className="text-neutral-500 text-[11px]">{eq.name}</div>
                      </td>
                      <td className="px-3 py-2.5 text-navy-700">
                        <div>{eq.department}</div>
                        <div className="text-neutral-400 text-[11px]">{eq.room}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge
                          variant={
                            eq.status === 'Working'
                              ? 'success'
                              : eq.status === 'Needs Attention'
                              ? 'warning'
                              : eq.status === 'Down'
                              ? 'error'
                              : 'purple'
                          }
                        >
                          {eq.status}
                        </StatusBadge>
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge
                          variant={
                            eq.criticality === 'Life Support'
                              ? 'error'
                              : eq.criticality === 'Critical Diagnostic'
                              ? 'warning'
                              : eq.criticality === 'Patient Monitoring'
                              ? 'info'
                              : 'neutral'
                          }
                        >
                          {eq.criticality}
                        </StatusBadge>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Link
                          to={`/dashboard/equipment?id=${eq.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-800 hover:underline"
                        >
                          Inspect <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Summary + Recent Activity */}
        <div className="space-y-6">
          {/* Equipment status distribution */}
          <div className="bg-white border border-neutral-200 rounded-md p-4">
            <h2 className="text-sm font-semibold text-navy-900 mb-1">Equipment Status Summary</h2>
            <p className="text-xs text-navy-500 mb-3">
              {loaded.equipment ? `Health distribution across ${totalEquipment} inventoried units.` : 'Equipment data unavailable.'}
            </p>

            <div className="space-y-2.5">
              {[
                { label: 'Working', value: workingCount, color: 'bg-teal-500', textColor: 'text-teal-700' },
                { label: 'Needs Attention', value: needsAttentionCount, color: 'bg-amber-500', textColor: 'text-amber-700' },
                { label: 'Down', value: downCount, color: 'bg-red-500', textColor: 'text-red-700' },
                { label: 'Under Maintenance', value: underMaintenanceCount, color: 'bg-purple-500', textColor: 'text-purple-700' },
              ].map((item) => {
                const percent = totalEquipment > 0 ? Math.round((item.value / totalEquipment) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className={`${item.textColor} flex items-center gap-1.5`}>
                        <span className={`w-2 h-2 rounded-full ${item.color}`} /> {item.label}
                      </span>
                      <span className="text-navy-900 font-semibold tabular-nums">
                        {loaded.equipment ? `${item.value} (${percent}%)` : 'Unavailable'}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`${item.color} h-1.5 rounded-full`} style={{ width: loaded.equipment ? `${percent}%` : '0%' }} />
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 text-xs text-navy-500">
                {loaded.equipment ? `Life-support units: ${lifeSupportCount}` : 'Life-support units: Unavailable'}
              </div>
            </div>
          </div>

          {/* Recent notifications */}
          <div className="bg-white border border-neutral-200 rounded-md p-4">
            <h3 className="text-xs font-semibold text-navy-900 mb-1">Recent Notifications</h3>
            <p className="text-[11px] text-navy-400 mb-2">Newest operational notifications.</p>
            {!loaded.notifications ? (
              <div className="text-xs text-neutral-500 py-3">Notification data unavailable.</div>
            ) : recentNotifications.length === 0 ? (
              <div className="text-xs text-neutral-500 py-3">No notifications recorded.</div>
            ) : (
              <div className="space-y-2">
                {recentNotifications.map((item) => (
                  <div key={item.id} className="text-xs border-t border-neutral-100 pt-2 first:border-t-0 first:pt-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge variant={item.type === 'alert' ? 'error' : item.type === 'warning' ? 'warning' : item.type === 'success' ? 'success' : 'info'}>
                        {item.type}
                      </StatusBadge>
                      <span className="font-medium text-navy-900 truncate">{item.title}</span>
                    </div>
                    <p className="text-navy-600 mt-0.5 line-clamp-2">{item.message}</p>
                    <p className="text-neutral-400 mt-0.5">
                      {Number.isFinite(Date.parse(item.timestamp))
                        ? formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })
                        : item.timestamp}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Problem Reports / Maintenance */}
      <div className="bg-white border border-neutral-200 rounded-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <div>
            <h2 className="text-sm font-semibold text-navy-900">Recent Problem Reports</h2>
            <p className="text-xs text-navy-500">
              Latest {loaded.reports ? recentReports.length : 0} reported equipment issues.
            </p>
          </div>
        </div>

        <div className="divide-y divide-neutral-200 text-xs">
          {!loaded.reports ? (
            <div className="py-6 text-center text-xs text-neutral-500">Problem report data unavailable.</div>
          ) : recentReports.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-500">No problem reports recorded.</div>
          ) : (
            recentReports.map((report) => (
              <div key={report.id} className="p-3 px-4 flex items-start justify-between gap-4 hover:bg-neutral-50/70">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge
                      variant={
                        report.severity === 'Critical'
                          ? 'error'
                          : report.severity === 'High'
                          ? 'warning'
                          : report.severity === 'Medium'
                          ? 'info'
                          : 'neutral'
                      }
                    >
                      {report.severity}
                    </StatusBadge>
                    <span className="font-semibold text-navy-900">{report.equipmentName || report.equipmentId}</span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-navy-500 font-medium">{report.department}</span>
                  </div>
                  <p className="text-navy-600 text-xs line-clamp-2">{report.issueDescription}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <StatusBadge
                    variant={
                      report.status === 'Resolved'
                        ? 'success'
                        : report.status === 'In Repair'
                        ? 'info'
                        : report.status === 'Assigned'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {report.status}
                  </StatusBadge>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 tabular-nums">
                    <Clock className="w-3 h-3" />
                    {Number.isFinite(Date.parse(report.reportedAt))
                      ? formatDistanceToNow(parseISO(report.reportedAt), { addSuffix: true })
                      : report.reportedAt}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {loaded.maintenance && recentMaintenance.length > 0 && (
          <div className="border-t border-neutral-200 px-4 py-3">
            <h3 className="text-xs font-semibold text-navy-900 mb-2">Recent Maintenance Records</h3>
            <div className="space-y-2">
              {recentMaintenance.map((record) => (
                <div key={record.id} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-navy-900">{record.equipmentName || record.equipmentId}</span>
                  <span className="text-navy-500">{record.type}</span>
                  <span className="text-neutral-400 tabular-nums">
                    {Number.isFinite(Date.parse(record.date))
                      ? formatDistanceToNow(parseISO(record.date), { addSuffix: true })
                      : record.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}