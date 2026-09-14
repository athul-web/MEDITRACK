import React, { useState, useMemo, useEffect } from 'react';
import {
  Equipment,
  Technician,
  ProblemReport,
  MaintenanceRecord,
  UserRole,
  NotificationItem,
  FacilitySettings,
  EquipmentStatus,
  Department
} from './types';
import { supabase, mapDbToFrontend, mapFrontendToDb } from './lib/supabase';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { EquipmentCard } from './components/EquipmentCard';
import { EquipmentTable } from './components/EquipmentTable';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { ReportProblemModal } from './components/ReportProblemModal';
import { AssignTechModal } from './components/AssignTechModal';
import { ResolveRepairModal } from './components/ResolveRepairModal';
import { WorkOrdersView } from './components/WorkOrdersView';
import { MaintenanceHistoryView } from './components/MaintenanceHistoryView';
import { TechniciansView } from './components/TechniciansView';
import { AddEditEquipmentModal } from './components/AddEditEquipmentModal';
import { SettingsModal } from './components/SettingsModal';
import {
  LayoutGrid,
  List,
  Search,
  Plus,
  Wrench,
  FileText,
  Users,
  CheckCircle2,
  Activity,
  Layers,
  X
} from 'lucide-react';

export default function App() {
  // --- Core State ---
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [problemReports, setProblemReports] = useState<ProblemReport[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [facilitySettings, setFacilitySettings] = useState<FacilitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('Staff');

  // --- Navigation & UI State ---
  const [activeNav, setActiveNav] = useState<'equipment' | 'workorders' | 'history' | 'technicians'>('equipment');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Modal States ---
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetEquipment, setReportTargetEquipment] = useState<Equipment | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTargetEquipment, setAssignTargetEquipment] = useState<Equipment | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveTargetEquipment, setResolveTargetEquipment] = useState<Equipment | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editEquipmentTarget, setEditEquipmentTarget] = useState<Equipment | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // --- Utility Helpers ---
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Data Loading ---
  useEffect(() => {
    async function initApp() {
      setIsLoading(true);
      try {
        const [eqRes, techRes, probRes, mainRes, notifRes, setRes] = await Promise.all([
          supabase.from('equipment').select('*'),
          supabase.from('technicians').select('*'),
          supabase.from('problem_reports').select('*'),
          supabase.from('maintenance_records').select('*'),
          supabase.from('notifications').select('*'),
          supabase.from('facility_settings').select('*').single(),
        ]);

        if (eqRes.data) setEquipmentList(mapDbToFrontend(eqRes.data));
        if (techRes.data) setTechnicians(mapDbToFrontend(techRes.data));
        if (probRes.data) {
          const mappedReports = mapDbToFrontend(probRes.data).map((report: any) => {
            const eq = equipmentList.find(e => e.id === report.equipmentId);
            return {
              ...report,
              equipmentName: eq?.name || 'Unknown Equipment'
            };
          });
          setProblemReports(mappedReports);
        }
        if (mainRes.data) setMaintenanceRecords(mapDbToFrontend(mainRes.data));
        if (notifRes.data) setNotifications(mapDbToFrontend(notifRes.data));
        if (setRes.data) setFacilitySettings(mapDbToFrontend(setRes.data));
      } catch (error) {
        console.error('Failed to initialize application data:', error);
        showToast('Error loading system data from backend.');
      } finally {
        setIsLoading(false);
      }
    }
    initApp();
  }, []);

  // --- Computed State ---
  const fleetUptime = useMemo(() => {
    if (equipmentList.length === 0) return 100;
    const workingCount = equipmentList.filter(e => e.status === 'Working').length;
    const maintenanceCount = equipmentList.filter(e => e.status === 'Under Maintenance').length;
    return ((workingCount + maintenanceCount * 0.5) / equipmentList.length) * 100;
  }, [equipmentList]);

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(item => {
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (departmentFilter !== 'All' && item.department !== departmentFilter) return false;
      if (criticalityFilter !== 'All' && item.criticality !== criticalityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q) ||
          item.manufacturer.toLowerCase().includes(q) ||
          item.serialNumber.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          item.room.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [equipmentList, statusFilter, departmentFilter, criticalityFilter, searchQuery]);

  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    equipmentList.forEach(e => set.add(e.department));
    return Array.from(set);
  }, [equipmentList]);

  // --- Core Handlers (Supabase Integrated) ---

  const handleSubmitProblemReport = async (reportData: any) => {
    try {
      const ticketId = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toISOString();

      const newTicket: ProblemReport = {
        ...reportData,
        id: ticketId,
        status: 'Reported',
        reportedAt: now,
        equipmentName: equipmentList.find(e => e.id === reportData.equipmentId)?.name || 'Unknown',
      };

      // 1. Save Ticket
      const { error: reportError } = await supabase.from('problem_reports').insert([mapFrontendToDb(newTicket)]);
      if (reportError) throw reportError;

      // 2. Update Equipment Status
      const newStatus: EquipmentStatus = (reportData.severity === 'Critical' || reportData.severity === 'High') ? 'Down' : 'Needs Attention';
      const { error: eqError } = await supabase
        .from('equipment')
        .update({ status: newStatus, active_ticket_id: ticketId })
        .eq('id', reportData.equipmentId);
      if (eqError) throw eqError;

      // 3. Create Notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `${reportData.severity} Issue: ${newTicket.equipmentName}`,
        message: `${reportData.equipmentId} reported in ${reportData.room}.`,
        type: reportData.severity === 'Critical' ? 'alert' : 'warning',
        timestamp: 'Just now',
        equipmentId: reportData.equipmentId,
        read: false,
      };
      await supabase.from('notifications').insert([mapFrontendToDb(newNotif)]);

      // Local State Sync
      setEquipmentList(prev => prev.map(eq => eq.id === reportData.equipmentId ? { ...eq, status: newStatus, activeTicketId: ticketId } : eq));
      setProblemReports(prev => [newTicket, ...prev]);
      setNotifications(prev => [newNotif, ...prev]);

      showToast(`Ticket ${ticketId} created. Equipment status: ${newStatus}`);
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Failed to report problem'}`);
    }
  };

  const handleAssignTechnician = async (equipmentId: string, tech: Technician, note: string) => {
    try {
      const now = new Date().toISOString();

      // Update Equipment
      const { error: eqError } = await supabase
        .from('equipment')
        .update({ status: 'Under Maintenance', assigned_technician_id: tech.id })
        .eq('id', equipmentId);
      if (eqError) throw eqError;

      // Update Ticket
      const { error: ticketError } = await supabase
        .from('problem_reports')
        .update({ status: 'In Repair', assigned_technician_id: tech.id, assigned_at: now })
        .eq('equipment_id', equipmentId)
        .neq('status', 'Resolved');
      if (ticketError) throw ticketError;

      // Update Technician
      const { error: techError } = await supabase
        .from('technicians')
        .update({ status: 'Assigned', active_tickets_count: tech.activeTicketsCount + 1 })
        .eq('id', tech.id);
      if (techError) throw techError;

      // Local Sync
      setEquipmentList(prev => prev.map(eq => eq.id === equipmentId ? { ...eq, status: 'Under Maintenance', assignedTechnicianId: tech.id, assignedTechnicianName: tech.name } : eq));
      setTechnicians(prev => prev.map(t => t.id === tech.id ? { ...t, status: 'Assigned', activeTicketsCount: t.activeTicketsCount + 1 } : t));

      showToast(`Technician ${tech.name} assigned to ${equipmentId}`);
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Assignment failed'}`);
    }
  };

  const handleResolveRepair = async (data: any) => {
    try {
      const recordId = `MAINT-${Math.floor(8000 + Math.random() * 2000)}`;
      const now = new Date().toISOString();
      const targetEq = equipmentList.find(e => e.id === data.equipmentId);

      // 1. Maintenance Record
      const { error: maintError } = await supabase.from('maintenance_records').insert([{
        id: recordId,
        equipment_id: data.equipmentId,
        date: now.slice(0, 10),
        resolved_date: now,
        type: 'Corrective Repair',
        description: data.resolutionSummary,
        parts_replaced: data.partsReplaced,
        downtime_hours: data.downtimeHours,
        cost: data.cost,
      }]);
      if (maintError) throw maintError;

      // 2. Resolve Ticket
      const { error: ticketError } = await supabase
        .from('problem_reports')
        .update({ status: 'Resolved', resolved_at: now, resolution_summary: data.resolutionSummary, parts_used: data.partsReplaced, downtime_hours: data.downtimeHours })
        .eq('equipment_id', data.equipmentId)
        .neq('status', 'Resolved');
      if (ticketError) throw ticketError;

      // 3. Restore Equipment
      const { error: eqError } = await supabase
        .from('equipment')
        .update({
          status: 'Working',
          active_ticket_id: null,
          assigned_technician_id: null,
          last_maintenance_date: now.slice(0, 10),
          total_downtime_hours: (targetEq?.totalDowntimeHours || 0) + data.downtimeHours
        })
        .eq('id', data.equipmentId);
      if (eqError) throw eqError;

      // Local Sync
      setEquipmentList(prev => prev.map(eq => eq.id === data.equipmentId ? {
        ...eq, status: 'Working', activeTicketId: undefined, assignedTechnicianId: undefined,
        assignedTechnicianName: undefined, lastMaintenanceDate: now.slice(0, 10),
        totalDowntimeHours: (eq.totalDowntimeHours || 0) + data.downtimeHours
      } : eq));

      showToast(`Repair certified. ${data.equipmentId} is now Operational.`);
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Resolution failed'}`);
    }
  };

  const handleUpdateStatus = async (equipmentId: string, newStatus: EquipmentStatus) => {
    try {
      const { error } = await supabase.from('equipment').update({ status: newStatus }).eq('id', equipmentId);
      if (error) throw error;
      setEquipmentList(prev => prev.map(eq => eq.id === equipmentId ? { ...eq, status: newStatus } : eq));
      showToast(`Status updated to ${newStatus}`);
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Status update failed'}`);
    }
  };

  const handleSaveEquipment = async (eq: Equipment) => {
    try {
      const { error } = await supabase.from('equipment').upsert(mapFrontendToDb(eq));
      if (error) throw error;
      setEquipmentList(prev => {
        const exists = prev.some(item => item.id === eq.id);
        return exists ? prev.map(item => item.id === eq.id ? eq : item) : [eq, ...prev];
      });
      showToast(`Equipment ${eq.id} saved.`);
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Save failed'}`);
    }
  };

  const handleSaveSettings = async (settings: FacilitySettings) => {
    try {
      const { error } = await supabase.from('facility_settings').update(mapFrontendToDb(settings)).eq('id', 1);
      if (error) throw error;
      setFacilitySettings(settings);
      showToast('Facility settings updated.');
    } catch (error: any) {
      showToast(`Error: ${error.message || 'Settings update failed'}`);
    }
  };

  const handleResetData = () => {
    showToast('Reset is now handled via seed.sql in Supabase SQL Editor.');
  };

  // --- UI Helpers ---
  const handleOpenReportModal = (equipment?: Equipment | null) => {
    setReportTargetEquipment(equipment || null);
    setIsReportModalOpen(true);
  };
  const handleOpenAssignModal = (equipment: Equipment) => {
    setAssignTargetEquipment(equipment);
    setIsAssignModalOpen(true);
  };
  const handleOpenResolveModal = (equipment: Equipment) => {
    setResolveTargetEquipment(equipment);
    setIsResolveModalOpen(true);
  };
  const handleSelectEquipmentById = (id?: string) => {
    if (!id) return;
    const eq = equipmentList.find(e => e.id === id);
    if (eq) { setSelectedEquipment(eq); setIsDetailOpen(true); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-medium animate-pulse">Connecting to Biomedical Backend...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/75 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-medium shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={notifications}
        onMarkAllNotificationsRead={async () => {
          const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
          if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            showToast('Notifications updated.');
          }
        }}
        onNotificationClick={handleSelectEquipmentById}
        onOpenReportModal={() => handleOpenReportModal(null)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        facilitySettings={facilitySettings}
        fleetUptime={fleetUptime}
      />

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              <button onClick={() => setActiveNav('equipment')} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeNav === 'equipment' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                <Layers className="w-4 h-4" /> <span>Equipment Fleet ({equipmentList.length})</span>
              </button>
              <button onClick={() => setActiveNav('workorders')} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeNav === 'workorders' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                <Wrench className="w-4 h-4" /> <span>Work Orders ({problemReports.filter(t => t.status !== 'Resolved').length})</span>
              </button>
              <button onClick={() => setActiveNav('history')} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeNav === 'history' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                <FileText className="w-4 h-4" /> <span>Maintenance History</span>
              </button>
              <button onClick={() => setActiveNav('technicians')} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeNav === 'technicians' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                <Users className="w-4 h-4" /> <span>Biomedical Team</span>
              </button>
            </nav>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Active Mode:</span>
              <span className={`px-2.5 py-1 rounded-full font-semibold ${currentRole === 'Admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-sky-100 text-sky-900 border border-sky-300'}`}>
                {currentRole === 'Admin' ? 'Lead Biomedical Engineer' : 'Clinical Ward Staff'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeNav === 'equipment' && (
          <div className="space-y-6">
            <StatsOverview equipment={equipmentList} onFilterStatus={setStatusFilter} selectedStatusFilter={statusFilter} onSelectEquipment={eq => { setSelectedEquipment(eq); setIsDetailOpen(true); }} />
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search equipment..." className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700">
                    <option value="All">All Departments</option>
                    {availableDepartments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                  <select value={criticalityFilter} onChange={e => setCriticalityFilter(e.target.value)} className="text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700">
                    <option value="All">All Criticalities</option>
                    <option value="Life Support">Life Support</option>
                    <option value="Critical Diagnostic">Critical Diagnostic</option>
                    <option value="Patient Monitoring">Patient Monitoring</option>
                    <option value="General Clinical">General Clinical</option>
                  </select>
                  <div className="flex items-center p-0.5 rounded-lg border border-slate-300 bg-slate-100">
                    <button onClick={() => setViewMode('cards')} className={`p-1.5 rounded-md transition-all ${viewMode === 'cards' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}><LayoutGrid className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}><List className="w-4 h-4" /></button>
                  </div>
                  {currentRole === 'Admin' && (
                    <button onClick={() => { setEditEquipmentTarget(null); setIsAddEditModalOpen(true); }} className="text-xs px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shrink-0 shadow-xs">
                      <Plus className="w-3.5 h-3.5" /> <span>Add Equipment</span>
                    </button>
                  )}
                </div>
              </div>
              {(statusFilter !== 'All' || departmentFilter !== 'All' || criticalityFilter !== 'All' || searchQuery) && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500">Active Filters:</span>
                  {statusFilter !== 'All' && <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 flex items-center gap-1">Status: {statusFilter} <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter('All')} /></span>}
                  {departmentFilter !== 'All' && <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 flex items-center gap-1">Dept: {departmentFilter} <X className="w-3 h-3 cursor-pointer" onClick={() => setDepartmentFilter('All')} /></span>}
                  {criticalityFilter !== 'All' && <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 flex items-center gap-1">Crit: {criticalityFilter} <X className="w-3 h-3 cursor-pointer" onClick={() => setCriticalityFilter('All')} /></span>}
                  {searchQuery && <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 flex items-center gap-1">Query: "{searchQuery}" <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} /></span>}
                  <button onClick={() => { setStatusFilter('All'); setDepartmentFilter('All'); setCriticalityFilter('All'); setSearchQuery(''); }} className="text-blue-600 hover:underline ml-2">Clear All</button>
                </div>
              )}
            </div>
            {filteredEquipment.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 p-8 space-y-3">
                <Activity className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">No Medical Equipment Found</h4>
                <button onClick={() => { setStatusFilter('All'); setDepartmentFilter('All'); setCriticalityFilter('All'); setSearchQuery(''); }} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold">Reset Filters</button>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipment.map(eq => <EquipmentCard key={eq.id} equipment={eq} currentRole={currentRole} onSelect={e => { setSelectedEquipment(e); setIsDetailOpen(true); }} onReportProblem={handleOpenReportModal} onQuickStatusChange={handleUpdateStatus} />)}
              </div>
            ) : (
              <EquipmentTable equipment={filteredEquipment} currentRole={currentRole} onSelect={e => { setSelectedEquipment(e); setIsDetailOpen(true); }} onReportProblem={handleOpenReportModal} onQuickStatusChange={handleUpdateStatus} />
            )}
          </div>
        )}

        {activeNav === 'workorders' && (
          <WorkOrdersView tickets={problemReports} equipmentList={equipmentList} currentRole={currentRole} onSelectEquipmentById={handleSelectEquipmentById} onOpenReportModal={() => handleOpenReportModal(null)} onOpenAssignModal={handleOpenAssignModal} onOpenResolveModal={handleOpenResolveModal} />
        )}

        {activeNav === 'history' && (
          <MaintenanceHistoryView records={maintenanceRecords} equipmentList={equipmentList} onSelectEquipmentById={handleSelectEquipmentById} />
        )}

        {activeNav === 'technicians' && (
          <TechniciansView technicians={technicians} equipmentList={equipmentList} tickets={problemReports} currentRole={currentRole} onFilterEquipmentByTech={name => { setSearchQuery(name); setActiveNav('equipment'); }} />
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{facilitySettings?.hospitalName || 'Medical Center'} • Medical Equipment Uptime & Maintenance System</span>
          <span>Emergency Dispatch: <strong>{facilitySettings?.primaryContactPhone || 'N/A'}</strong></span>
        </div>
      </footer>

      {selectedEquipment && (
        <EquipmentDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} equipment={selectedEquipment} currentRole={currentRole} activeTicket={problemReports.find(t => t.equipmentId === selectedEquipment.id && t.status !== 'Resolved')} maintenanceHistory={maintenanceRecords.filter(r => r.equipmentId === selectedEquipment.id)} onReportProblem={eq => { setIsDetailOpen(false); handleOpenReportModal(eq); }} onOpenAssignModal={eq => { setIsDetailOpen(false); handleOpenAssignModal(eq); }} onOpenResolveModal={eq => { setIsDetailOpen(false); handleOpenResolveModal(eq); }} onUpdateStatus={handleUpdateStatus} />
      )}

      <ReportProblemModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} equipmentList={equipmentList} preselectedEquipment={reportTargetEquipment} onSubmitReport={handleSubmitProblemReport} currentRole={currentRole} />

      {assignTargetEquipment && (
        <AssignTechModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} equipment={assignTargetEquipment} activeTicket={problemReports.find(t => t.equipmentId === assignTargetEquipment.id && t.status !== 'Resolved')} technicians={technicians} onAssignTechnician={handleAssignTechnician} />
      )}

      {resolveTargetEquipment && (
        <ResolveRepairModal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} equipment={resolveTargetEquipment} activeTicket={problemReports.find(t => t.equipmentId === resolveTargetEquipment.id && t.status !== 'Resolved')} onResolveRepair={handleResolveRepair} />
      )}

      <AddEditEquipmentModal isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)} equipmentToEdit={editEquipmentTarget} onSaveEquipment={handleSaveEquipment} />

      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} settings={facilitySettings || { hospitalName: 'Loading...', facilityCode: '...', slaCriticalHours: 2, slaHighHours: 8, primaryContactPhone: '...', maintenanceEmail: '...' }} onSaveSettings={handleSaveSettings} onResetData={handleResetData} />
    </div>
  );
}
