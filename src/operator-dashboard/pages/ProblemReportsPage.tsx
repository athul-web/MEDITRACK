import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock, ShieldAlert, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, getCurrentUserHospitalId, mapDbToFrontend, toProblemReportRow, toNotificationRow } from '../../lib/supabase';
import { Equipment, ProblemReport } from '../../types';
import { ReportProblemModal } from '../../components/ReportProblemModal';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MetricCard } from '../components/ui/MetricCard';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface LoadState {
  equipment: boolean;
  reports: boolean;
}

const RUNTIME_LABELS: Record<ProblemReport['status'], string> = {
  Reported: 'Reported',
  Assigned: 'Assigned',
  'In Repair': 'In Repair',
  Resolved: 'Resolved',
};

export function ProblemReports() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [problemReports, setProblemReports] = useState<ProblemReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<LoadState>({ equipment: false, reports: false });
  const [partialWarnings, setPartialWarnings] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEquipment, setFilterEquipment] = useState('all');
  const [selectedReport, setSelectedReport] = useState<ProblemReport | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<Equipment | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      setIsLoading(true);
      setLoadError(null);
      setPartialWarnings([]);

      try {
        const results = await Promise.allSettled([
          supabase.from('equipment').select('*'),
          supabase.from('problem_reports').select('*'),
        ]);

        const nextLoaded: LoadState = { equipment: false, reports: false };
        const warnings: string[] = [];

        const equipmentResult = results[0];
        if (equipmentResult.status === 'fulfilled' && !equipmentResult.value.error) {
          if (isActive) {
            setEquipment(mapDbToFrontend<Equipment[]>(equipmentResult.value.data ?? []));
            nextLoaded.equipment = true;
          }
        } else {
          warnings.push('equipment');
        }

        const reportResult = results[1];
        if (reportResult.status === 'fulfilled' && !reportResult.value.error) {
          if (isActive) {
            setProblemReports(mapDbToFrontend<ProblemReport[]>(reportResult.value.data ?? []));
            nextLoaded.reports = true;
          }
        } else {
          warnings.push('problem reports');
        }

        if (isActive) {
          setLoaded(nextLoaded);
          setPartialWarnings(warnings);
        }
      } catch (err: any) {
        if (isActive) setLoadError(err?.message || 'Unable to load problem report data.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadData();
    return () => {
      isActive = false;
    };
  }, []);

  const equipmentOptions = useMemo(() => {
    return ['all', ...Array.from(new Set(problemReports.map((report) => report.equipmentId)))];
  }, [problemReports]);

  const filteredReports = useMemo(() => {
    return [...problemReports].filter((report) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        report.id.toLowerCase().includes(query) ||
        (report.equipmentName || '').toLowerCase().includes(query) ||
        report.equipmentId.toLowerCase().includes(query) ||
        report.issueDescription.toLowerCase().includes(query);

      const matchesSeverity = filterSeverity === 'all' || report.severity === filterSeverity;
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      const matchesEquipment = filterEquipment === 'all' || report.equipmentId === filterEquipment;
      return matchesSearch && matchesSeverity && matchesStatus && matchesEquipment;
    });
  }, [problemReports, searchTerm, filterSeverity, filterStatus, filterEquipment]);

  const openReports = problemReports.filter((report) => report.status !== 'Resolved').length;
  const criticalReports = problemReports.filter(
    (report) => report.severity === 'Critical' && report.status !== 'Resolved'
  ).length;
  const assignedReports = problemReports.filter((report) => report.status === 'Assigned').length;
  const resolvedReports = problemReports.filter((report) => report.status === 'Resolved').length;

  const handleSubmitReport = async (reportData: Omit<ProblemReport, 'id' | 'reportedAt' | 'status'>) => {
    try {
      const ticketId = `TICK-${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      const targetEquipment = equipment.find((item) => item.id === reportData.equipmentId);
      if (!targetEquipment) {
        throw new Error('The selected equipment no longer exists. Refresh and try again.');
      }

      const newTicket: ProblemReport = {
        ...reportData,
        id: ticketId,
        status: 'Reported',
        reportedAt: now,
        equipmentName: targetEquipment.name,
      };

      const hospitalId = await getCurrentUserHospitalId();
      const { error: reportError } = await supabase
        .from('problem_reports')
        .insert({ ...toProblemReportRow(newTicket), hospital_id: hospitalId });
      if (reportError) throw reportError;

      const nextEquipmentStatus = reportData.severity === 'Critical' || reportData.severity === 'High'
        ? 'Down'
        : 'Needs Attention';

      const { error: equipmentError } = await supabase
        .from('equipment')
        .update({ status: nextEquipmentStatus, active_ticket_id: ticketId })
        .eq('id', reportData.equipmentId);
      if (equipmentError) throw equipmentError;

      const notificationDraft = {
        title: `${reportData.severity} Issue: ${newTicket.equipmentName}`,
        message: `${reportData.equipmentId} reported in ${reportData.room}.`,
        type: reportData.severity === 'Critical' ? 'alert' : 'warning',
        timestamp: now,
        equipmentId: reportData.equipmentId,
        read: false,
      } as const;
      const { data: savedNotification, error: notificationError } = await supabase
        .from('notifications')
        .insert(toNotificationRow(notificationDraft))
        .select()
        .single();
      if (notificationError) {
        console.error('Problem report was saved, but its notification could not be created:', notificationError);
      }

      const nextEquipment = equipment.map((item) =>
        item.id === reportData.equipmentId
          ? { ...item, status: nextEquipmentStatus as Equipment['status'], activeTicketId: ticketId }
          : item
      );
      setEquipment(nextEquipment);
      setProblemReports((previous) => [newTicket, ...previous]);
      if (savedNotification) {
        // Keep the saved object's raw shape; notification loading in other pages normalizes rows.
      }

      setIsReportOpen(false);
      setReportTarget(null);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      window.alert(err?.message || 'Unable to create problem report.');
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-navy-500 text-sm">Loading problem reports…</div>;
  }

  if (loadError) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">{loadError}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Problem Reports</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Equipment-issue reporting and report lifecycle tracking from MediTrack.
          </p>
        </div>
        <button
          onClick={() => {
            setReportTarget(equipment.length ? equipment[0] : null);
            setIsReportOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-medium rounded transition-colors"
        >
          <Wrench className="w-3.5 h-3.5 text-teal-400" />
          Report Problem
        </button>
      </div>

      {partialWarnings.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          Some supporting data could not be loaded: {partialWarnings.join(', ')}.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200 rounded p-3">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Open</span>
          <div className="text-lg font-bold text-red-600 mt-0.5">{loaded.reports ? openReports : 'Unavailable'}</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded p-3">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Critical Open</span>
          <div className="text-lg font-bold text-red-700 mt-0.5">{loaded.reports ? criticalReports : 'Unavailable'}</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded p-3">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Assigned</span>
          <div className="text-lg font-bold text-amber-600 mt-0.5">{loaded.reports ? assignedReports : 'Unavailable'}</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded p-3">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Resolved</span>
          <div className="text-lg font-bold text-teal-700 mt-0.5">{loaded.reports ? resolvedReports : 'Unavailable'}</div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-md p-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 max-w-sm">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search reports by ID, equipment, issue…" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Severity"
            value={filterSeverity}
            options={[
              { value: 'all', label: 'All Severities' },
              { value: 'Critical', label: 'Critical' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
            ]}
            onChange={setFilterSeverity}
          />
          <FilterDropdown
            label="Status"
            value={filterStatus}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Reported', label: 'Reported' },
              { value: 'Assigned', label: 'Assigned' },
              { value: 'In Repair', label: 'In Repair' },
              { value: 'Resolved', label: 'Resolved' },
            ]}
            onChange={setFilterStatus}
          />
          <FilterDropdown
            label="Device"
            value={filterEquipment}
            options={equipmentOptions.map((id) => ({
              value: id,
              label: id === 'all' ? 'All Devices' : id,
            }))}
            onChange={setFilterEquipment}
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
        {!loaded.reports ? (
          <EmptyState title="Problem report data unavailable" description="Problem reports could not be loaded." />
        ) : filteredReports.length === 0 ? (
          <EmptyState title="No problem reports match the criteria" description="Submitted equipment issues will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-navy-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-3 py-3">Report ID & Issue</th>
                  <th className="px-3 py-3">Source Equipment</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Reported</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-navy-900">{report.id}</div>
                      <div className="text-neutral-500 text-[11px] max-w-md truncate">{report.issueDescription}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-navy-900">{report.equipmentName || report.equipmentId}</div>
                      <div className="font-mono text-neutral-400 text-[11px]">{report.equipmentId}</div>
                    </td>
                    <td className="px-3 py-3">{RUNTIME_LABELS[report.status]}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-navy-600">
                      {report.reportedAt ? formatSafeDate(report.reportedAt) : 'Unavailable'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedReport(report);
                        }}
                        className="text-teal-700 hover:text-teal-800 font-medium text-[11px] hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedReport && (
        <Modal
          open={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Incident Audit Log — ${selectedReport.id}`}
          width="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
              <div className="flex items-center justify-between gap-3">
                <StatusBadge
                  variant={
                    selectedReport.severity === 'Critical'
                      ? 'error'
                      : selectedReport.severity === 'High'
                      ? 'warning'
                      : selectedReport.severity === 'Medium'
                      ? 'info'
                      : 'neutral'
                  }
                >
                  {selectedReport.severity}
                </StatusBadge>
                <StatusBadge
                  variant={
                    selectedReport.status === 'Resolved'
                      ? 'success'
                      : selectedReport.status === 'In Repair'
                      ? 'info'
                      : selectedReport.status === 'Assigned'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {selectedReport.status}
                </StatusBadge>
              </div>
              <p className="text-navy-700 leading-relaxed">{selectedReport.issueDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 border border-neutral-200 rounded">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Source Device</span>
                <span className="font-semibold text-navy-900">{selectedReport.equipmentName || 'Unavailable'}</span>
                <span className="text-neutral-500 block font-mono text-[11px]">ID: {selectedReport.equipmentId}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Department / Room</span>
                <span className="text-navy-800">{selectedReport.department}</span>
                <span className="text-neutral-500 block text-[11px]">{selectedReport.room}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Reported By</span>
                <span className="text-navy-800">{selectedReport.reportedBy}</span>
                <span className="text-neutral-500 block text-[11px]">{selectedReport.reportedRole}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Lifecycle</span>
                <span className="text-navy-800">
                  {selectedReport.reportedAt ? formatSafeDate(selectedReport.reportedAt) : 'Unavailable'}
                </span>
              </div>
            </div>

            {selectedReport.assignedTechnicianName && (
              <div className="p-2.5 border border-neutral-200 rounded text-navy-700">
                Assigned technician: <strong>{selectedReport.assignedTechnicianName}</strong>
                {selectedReport.assignedAt ? ` on ${formatSafeDate(selectedReport.assignedAt)}` : ''}
              </div>
            )}

            {selectedReport.resolutionSummary && (
              <div className="p-2.5 border border-neutral-200 rounded text-navy-700">
                Resolution: {selectedReport.resolutionSummary}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setReportTarget(selectedReport ? equipment.find((item) => item.id === selectedReport.equipmentId) ?? null : null);
                  setIsReportOpen(true);
                }}
                className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-medium rounded"
              >
                Report Follow-Up Issue
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ReportProblemModal
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setReportTarget(null);
        }}
        equipmentList={equipment}
        preselectedEquipment={reportTarget}
        onSubmitReport={(report) => {
          void handleSubmitReport(report);
        }}
      />
    </div>
  );
}

function formatSafeDate(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return value || 'Unavailable';
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return value;
  }
}
