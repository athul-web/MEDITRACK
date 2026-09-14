import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Equipment, 
  Technician, 
  ProblemReport, 
  MaintenanceRecord, 
  UserRole, 
  NotificationItem, 
  FacilitySettings,
  Department,
  EquipmentStatus,
  CriticalityLevel
} from './types';
import { 
  INITIAL_EQUIPMENT, 
  INITIAL_TECHNICIANS, 
  INITIAL_PROBLEM_REPORTS, 
  INITIAL_MAINTENANCE_RECORDS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_FACILITY_SETTINGS 
} from './data/mockData';
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
  Filter, 
  Plus, 
  AlertTriangle, 
  Wrench, 
  FileText, 
  Users, 
  CheckCircle2, 
  Activity,
  Layers,
  X,
  Sparkles
} from 'lucide-react';

interface ToastState {
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'alert';
}

export default function App() {
  // Core Application State
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [technicians, setTechnicians] = useState<Technician[]>(INITIAL_TECHNICIANS);
  const [problemReports, setProblemReports] = useState<ProblemReport[]>(INITIAL_PROBLEM_REPORTS);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE_RECORDS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [facilitySettings, setFacilitySettings] = useState<FacilitySettings>(INITIAL_FACILITY_SETTINGS);

  // Role and Navigation State
  const [currentRole, setCurrentRole] = useState<UserRole>('Staff');
  const [activeNav, setActiveNav] = useState<'equipment' | 'workorders' | 'history' | 'technicians'>('equipment');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('All');

  // Modal Dialog States
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

  // Toast feedback state
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'alert' = 'success') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ title, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // If role is changed to Staff while on technicians tab, automatically redirect to equipment
  useEffect(() => {
    if (currentRole === 'Staff' && activeNav === 'technicians') {
      setActiveNav('equipment');
    }
  }, [currentRole, activeNav]);

  // Fleet uptime calculation
  const fleetUptime = useMemo(() => {
    if (equipmentList.length === 0) return 100;
    const workingCount = equipmentList.filter(e => e.status === 'Working').length;
    const maintenanceCount = equipmentList.filter(e => e.status === 'Under Maintenance').length;
    return ((workingCount + maintenanceCount * 0.5) / equipmentList.length) * 100;
  }, [equipmentList]);

  // Filtered equipment list
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

  // List of unique departments
  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    equipmentList.forEach(e => set.add(e.department));
    return Array.from(set);
  }, [equipmentList]);

  // ==========================================
  // CORE WORKFLOW HANDLERS
  // ==========================================

  // 1. Report a Problem
  const handleOpenReportModal = (equipment?: Equipment | null) => {
    setReportTargetEquipment(equipment || null);
    setIsReportModalOpen(true);
  };

  const handleSubmitProblemReport = (reportData: Omit<ProblemReport, 'id' | 'reportedAt' | 'status'>) => {
    const ticketId = `WO-${Math.floor(1040 + Math.random() * 8960)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newTicket: ProblemReport = {
      ...reportData,
      id: ticketId,
      status: 'Reported',
      reportedAt: nowStr,
    };

    // Update equipment status based on urgency
    const newStatus: EquipmentStatus = 
      reportData.severity === 'Critical' || reportData.severity === 'High' 
        ? 'Down' 
        : 'Needs Attention';

    setEquipmentList(prev =>
      prev.map(eq => {
        if (eq.id === reportData.equipmentId) {
          return {
            ...eq,
            status: newStatus,
            activeTicketId: ticketId,
          };
        }
        return eq;
      })
    );

    setProblemReports(prev => [newTicket, ...prev]);

    // Push real-time notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `${reportData.severity} Issue Reported: ${reportData.equipmentName}`,
      message: `${reportData.equipmentId} reported in ${reportData.room} by ${reportData.reportedBy}.`,
      type: reportData.severity === 'Critical' ? 'alert' : 'warning',
      timestamp: 'Just now',
      equipmentId: reportData.equipmentId,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast(
      'Equipment breakdown reported',
      `Work order #${ticketId} created and routed to Lead Biomedical Engineer.`,
      'success'
    );

    // If modal is open for this equipment, update selected
    if (selectedEquipment && selectedEquipment.id === reportData.equipmentId) {
      setSelectedEquipment(prev => prev ? { ...prev, status: newStatus, activeTicketId: ticketId } : null);
    }
  };

  // 2. Assign Technician (Admin only)
  const handleOpenAssignModal = (equipment: Equipment) => {
    if (currentRole !== 'Admin') return;
    setAssignTargetEquipment(equipment);
    setIsAssignModalOpen(true);
  };

  const handleAssignTechnician = (equipmentId: string, tech: Technician, note: string) => {
    if (currentRole !== 'Admin') return;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Find previous technician if reassigning
    const existingTicket = problemReports.find(
      ticket => ticket.equipmentId === equipmentId && ticket.status !== 'Resolved'
    );
    const previousTechId = existingTicket?.assignedTechnicianId;

    // Update Equipment: status remains current (or Under Maintenance) with technician assigned
    setEquipmentList(prev =>
      prev.map(eq => {
        if (eq.id === equipmentId) {
          return {
            ...eq,
            assignedTechnicianId: tech.id,
            assignedTechnicianName: tech.name,
          };
        }
        return eq;
      })
    );

    // Update Ticket: set status to 'Assigned'
    setProblemReports(prev =>
      prev.map(ticket => {
        if (ticket.equipmentId === equipmentId && ticket.status !== 'Resolved') {
          const notes = ticket.repairNotes || [];
          return {
            ...ticket,
            status: 'Assigned',
            assignedTechnicianId: tech.id,
            assignedTechnicianName: tech.name,
            assignedAt: nowStr,
            repairNotes: [`${nowStr} - Technician ${tech.name} assigned: ${note}`, ...notes],
          };
        }
        return ticket;
      })
    );

    // Update Technician workloads
    setTechnicians(prev =>
      prev.map(t => {
        if (t.id === tech.id) {
          const increment = previousTechId === tech.id ? 0 : 1;
          return {
            ...t,
            status: 'Assigned',
            activeTicketsCount: t.activeTicketsCount + increment,
          };
        }
        if (previousTechId && t.id === previousTechId && previousTechId !== tech.id) {
          const nextCount = Math.max(0, t.activeTicketsCount - 1);
          return {
            ...t,
            activeTicketsCount: nextCount,
            status: nextCount === 0 ? 'Available' : 'Assigned',
          };
        }
        return t;
      })
    );

    // Add Notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Technician Assigned: ${tech.name}`,
        message: `Assigned to work order for ${equipmentId}. Status transitioned to Assigned.`,
        type: 'info',
        timestamp: 'Just now',
        equipmentId,
        read: false,
      },
      ...prev,
    ]);

    showToast(
      'Technician assigned',
      `${tech.name} assigned to ${equipmentId}. Work order status updated to Assigned.`,
      'success'
    );

    if (selectedEquipment && selectedEquipment.id === equipmentId) {
      setSelectedEquipment(prev => prev ? { 
        ...prev, 
        assignedTechnicianId: tech.id, 
        assignedTechnicianName: tech.name 
      } : null);
    }
  };

  // 2b. Start Repair (Admin only - transitions from Assigned to In Repair)
  const handleStartRepair = (ticketId: string) => {
    if (currentRole !== 'Admin') return;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let targetEquipmentId = '';
    let targetEqName = '';
    let techName = '';

    setProblemReports(prev =>
      prev.map(ticket => {
        if (ticket.id === ticketId) {
          targetEquipmentId = ticket.equipmentId;
          targetEqName = ticket.equipmentName;
          techName = ticket.assignedTechnicianName || 'Biomedical Technician';
          const notes = ticket.repairNotes || [];
          return {
            ...ticket,
            status: 'In Repair',
            repairNotes: [`${nowStr} - Physical repair commenced by ${techName}`, ...notes],
          };
        }
        return ticket;
      })
    );

    if (targetEquipmentId) {
      setEquipmentList(prev =>
        prev.map(eq =>
          eq.id === targetEquipmentId
            ? { ...eq, status: 'Under Maintenance' }
            : eq
        )
      );

      if (selectedEquipment && selectedEquipment.id === targetEquipmentId) {
        setSelectedEquipment(prev => prev ? { ...prev, status: 'Under Maintenance' } : null);
      }

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: `Repair Commenced: ${targetEqName || targetEquipmentId}`,
          message: `${techName} started repair work on ticket #${ticketId}. Unit status updated to Under Maintenance.`,
          type: 'info',
          timestamp: 'Just now',
          equipmentId: targetEquipmentId,
          read: false,
        },
        ...prev,
      ]);

      showToast(
        'Repair commenced',
        `Work order #${ticketId} is now In Repair. Equipment marked Under Maintenance.`,
        'info'
      );
    }
  };

  // 3. Resolve Repair & Return to Operational (Admin only)
  const handleOpenResolveModal = (equipment: Equipment) => {
    if (currentRole !== 'Admin') return;
    setResolveTargetEquipment(equipment);
    setIsResolveModalOpen(true);
  };

  const handleResolveRepair = (data: {
    equipmentId: string;
    resolutionSummary: string;
    partsReplaced: string[];
    downtimeHours: number;
    cost: number;
    technicianName: string;
  }) => {
    if (currentRole !== 'Admin') return;
    const recordId = `MAINT-${Math.floor(8000 + Math.random() * 2000)}`;
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowTimeStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const targetEq = equipmentList.find(e => e.id === data.equipmentId);

    // 1. Create MaintenanceRecord
    const newRecord: MaintenanceRecord = {
      id: recordId,
      equipmentId: data.equipmentId,
      equipmentName: targetEq?.name || 'Medical Equipment',
      date: todayStr,
      resolvedDate: nowTimeStr,
      type: 'Corrective Repair',
      technicianName: data.technicianName,
      description: data.resolutionSummary,
      partsReplaced: data.partsReplaced,
      downtimeHours: data.downtimeHours,
      cost: data.cost,
      notes: 'Certified compliant with clinical engineering safety guidelines.',
    };

    setMaintenanceRecords(prev => [newRecord, ...prev]);

    // 2. Mark active ticket resolved
    let resolvedTechId: string | undefined;
    setProblemReports(prev =>
      prev.map(ticket => {
        if (ticket.equipmentId === data.equipmentId && ticket.status !== 'Resolved') {
          resolvedTechId = ticket.assignedTechnicianId;
          return {
            ...ticket,
            status: 'Resolved',
            resolvedAt: nowTimeStr,
            resolutionSummary: data.resolutionSummary,
            partsUsed: data.partsReplaced,
            downtimeHours: data.downtimeHours,
          };
        }
        return ticket;
      })
    );

    // 3. Decrement technician active workload
    const techToFree = resolvedTechId || targetEq?.assignedTechnicianId;
    if (techToFree) {
      setTechnicians(prev =>
        prev.map(t => {
          if (t.id === techToFree) {
            const nextCount = Math.max(0, t.activeTicketsCount - 1);
            return {
              ...t,
              activeTicketsCount: nextCount,
              status: nextCount === 0 ? 'Available' : 'Assigned',
            };
          }
          return t;
        })
      );
    }

    // 4. Update Equipment to Working
    setEquipmentList(prev =>
      prev.map(eq => {
        if (eq.id === data.equipmentId) {
          return {
            ...eq,
            status: 'Working',
            activeTicketId: undefined,
            assignedTechnicianId: undefined,
            assignedTechnicianName: undefined,
            lastMaintenanceDate: todayStr,
            totalDowntimeHours: (eq.totalDowntimeHours || 0) + data.downtimeHours,
          };
        }
        return eq;
      })
    );

    // 5. Update Notifications
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Repair Certified: ${targetEq?.name || data.equipmentId}`,
        message: `Returned to Operational status by ${data.technicianName}. Safety sign-off recorded.`,
        type: 'success',
        timestamp: 'Just now',
        equipmentId: data.equipmentId,
        read: false,
      },
      ...prev,
    ]);

    showToast(
      'Repair verified & certified',
      `${data.equipmentId} returned to Operational status. Service history recorded.`,
      'success'
    );

    if (selectedEquipment && selectedEquipment.id === data.equipmentId) {
      setSelectedEquipment(prev => prev ? { 
        ...prev, 
        status: 'Working', 
        activeTicketId: undefined,
        assignedTechnicianId: undefined,
        assignedTechnicianName: undefined,
      } : null);
    }
  };

  // 4. Direct Status Change (Biomed Admin only)
  const handleUpdateStatus = (equipmentId: string, newStatus: EquipmentStatus) => {
    if (currentRole !== 'Admin') return;
    setEquipmentList(prev =>
      prev.map(eq => (eq.id === equipmentId ? { ...eq, status: newStatus } : eq))
    );

    if (selectedEquipment && selectedEquipment.id === equipmentId) {
      setSelectedEquipment(prev => prev ? { ...prev, status: newStatus } : null);
    }

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Equipment Status Changed`,
        message: `${equipmentId} transitioned to ${newStatus}.`,
        type: newStatus === 'Working' ? 'success' : newStatus === 'Down' ? 'alert' : 'warning',
        timestamp: 'Just now',
        equipmentId,
        read: false,
      },
      ...prev,
    ]);

    showToast(
      'Status updated',
      `${equipmentId} transitioned to ${newStatus}.`,
      'info'
    );
  };

  // 5. Add note to active ticket
  const handleAddTicketNote = (ticketId: string, noteText: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const author = currentRole === 'Admin' ? 'Lead Biomedical Engineer' : 'Clinical Staff';
    const formattedNote = `${timestamp} [${author}] - ${noteText}`;

    setProblemReports(prev =>
      prev.map(ticket => {
        if (ticket.id === ticketId) {
          const notes = ticket.repairNotes || [];
          return {
            ...ticket,
            repairNotes: [formattedNote, ...notes],
          };
        }
        return ticket;
      })
    );

    showToast('Service note added', 'Note recorded to work order history.');
  };

  // 6. Add or Edit Equipment (Admin only)
  const handleSaveEquipment = (eq: Equipment) => {
    if (currentRole !== 'Admin') return;
    setEquipmentList(prev => {
      const exists = prev.some(item => item.id === eq.id);
      if (exists) {
        return prev.map(item => (item.id === eq.id ? eq : item));
      } else {
        return [eq, ...prev];
      }
    });

    showToast('Equipment registry updated', `Equipment ${eq.id} saved successfully.`);
  };

  // 7. Select equipment by ID (from notification, table, or work order)
  const handleSelectEquipmentById = (id?: string) => {
    if (!id) return;
    const eq = equipmentList.find(e => e.id === id);
    if (eq) {
      setSelectedEquipment(eq);
      setIsDetailOpen(true);
    }
  };

  // 7b. Click notification: mark as read immediately and jump to equipment if attached
  const handleNotificationClick = (notifId: string, equipmentId?: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n))
    );
    if (equipmentId) {
      handleSelectEquipmentById(equipmentId);
    }
  };

  // 8. Reset to default demo data
  const handleResetData = () => {
    setEquipmentList(INITIAL_EQUIPMENT);
    setTechnicians(INITIAL_TECHNICIANS);
    setProblemReports(INITIAL_PROBLEM_REPORTS);
    setMaintenanceRecords(INITIAL_MAINTENANCE_RECORDS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setFacilitySettings(INITIAL_FACILITY_SETTINGS);
    setStatusFilter('All');
    setDepartmentFilter('All');
    setCriticalityFilter('All');
    setSearchQuery('');
    showToast('Demo data reset', 'Reset all records to initial hospital state.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50/75 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification Banner */}
      {toast && (
        <div 
          id="toast-notification-banner"
          role="status"
          className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs shadow-2xl flex items-start gap-3 border border-slate-700 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'alert' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-xs leading-snug">
              {toast.title.startsWith('✓') ? toast.title : `✓ ${toast.title}`}
            </p>
            {toast.message && (
              <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{toast.message}</p>
            )}
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white transition-colors ml-1 p-0.5 rounded cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={notifications}
        onMarkAllNotificationsRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          showToast('Notifications updated', 'All notifications marked as read.', 'info');
        }}
        onNotificationClick={handleNotificationClick}
        onOpenReportModal={() => handleOpenReportModal(null)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        facilitySettings={facilitySettings}
        fleetUptime={fleetUptime}
      />

      {/* Primary Sub-Nav & Role Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
            {/* View Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              <button
                id="nav-equipment-tab"
                onClick={() => setActiveNav('equipment')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeNav === 'equipment'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Equipment Fleet ({equipmentList.length})</span>
              </button>

              <button
                id="nav-workorders-tab"
                onClick={() => setActiveNav('workorders')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeNav === 'workorders'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Work Orders ({problemReports.filter(t => t.status !== 'Resolved').length})</span>
              </button>

              <button
                id="nav-history-tab"
                onClick={() => setActiveNav('history')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeNav === 'history'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Maintenance History</span>
              </button>

              {currentRole === 'Admin' && (
                <button
                  id="nav-technicians-tab"
                  onClick={() => setActiveNav('technicians')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    activeNav === 'technicians'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Biomedical Team</span>
                </button>
              )}
            </nav>

            {/* Active Role Indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Active Mode:</span>
              <span className={`px-2.5 py-1 rounded-full font-semibold ${
                currentRole === 'Admin'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-sky-100 text-sky-900 border border-sky-300'
              }`}>
                {currentRole === 'Admin' ? 'Lead Biomedical Engineer' : 'Clinical Ward Staff'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* NAV 1: EQUIPMENT DIRECTORY */}
        {activeNav === 'equipment' && (
          <div className="space-y-6">
            {/* Top Metrics Banner */}
            <StatsOverview
              equipment={equipmentList}
              onFilterStatus={setStatusFilter}
              selectedStatusFilter={statusFilter}
              onSelectEquipment={eq => {
                setSelectedEquipment(eq);
                setIsDetailOpen(true);
              }}
            />

            {/* Search, Filter & View Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="equipment-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search equipment by name, ID, model, S/N, room..."
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters and View toggles */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Department select */}
                  <select
                    id="department-filter-select"
                    value={departmentFilter}
                    onChange={e => setDepartmentFilter(e.target.value)}
                    className="text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                  >
                    <option value="All">All Departments</option>
                    {availableDepartments.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>

                  {/* Criticality filter */}
                  <select
                    id="criticality-filter-select"
                    value={criticalityFilter}
                    onChange={e => setCriticalityFilter(e.target.value)}
                    className="text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                  >
                    <option value="All">All Criticalities</option>
                    <option value="Life Support">Life Support</option>
                    <option value="Critical Diagnostic">Critical Diagnostic</option>
                    <option value="Patient Monitoring">Patient Monitoring</option>
                    <option value="General Clinical">General Clinical</option>
                  </select>

                  {/* View mode toggle (Cards vs Table) */}
                  <div className="flex items-center p-0.5 rounded-lg border border-slate-300 bg-slate-100">
                    <button
                      id="view-mode-cards-btn"
                      onClick={() => setViewMode('cards')}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === 'cards' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title="Card Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      id="view-mode-table-btn"
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title="Dense Table View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add Equipment button (Admin only) */}
                  {currentRole === 'Admin' && (
                    <button
                      id="add-equipment-btn"
                      onClick={() => {
                        setEditEquipmentTarget(null);
                        setIsAddEditModalOpen(true);
                      }}
                      className="text-xs px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Equipment</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active filter badges if any */}
              {(statusFilter !== 'All' || departmentFilter !== 'All' || criticalityFilter !== 'All' || searchQuery) && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500">Active Filters:</span>
                  {statusFilter !== 'All' && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 flex items-center gap-1">
                      Status: {statusFilter}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter('All')} />
                    </span>
                  )}
                  {departmentFilter !== 'All' && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 flex items-center gap-1">
                      Dept: {departmentFilter}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setDepartmentFilter('All')} />
                    </span>
                  )}
                  {criticalityFilter !== 'All' && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 flex items-center gap-1">
                      Criticality: {criticalityFilter}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setCriticalityFilter('All')} />
                    </span>
                  )}
                  {searchQuery && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 flex items-center gap-1">
                      Query: "{searchQuery}"
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setStatusFilter('All');
                      setDepartmentFilter('All');
                      setCriticalityFilter('All');
                      setSearchQuery('');
                    }}
                    className="text-blue-600 hover:underline ml-2"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Equipment Grid or Table */}
            {filteredEquipment.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 p-8 space-y-3">
                <Activity className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">No Medical Equipment Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No equipment matched your current search filters. Try clearing filters or searching for another term.
                </p>
                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setDepartmentFilter('All');
                    setCriticalityFilter('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipment.map(eq => (
                  <EquipmentCard
                    key={eq.id}
                    equipment={eq}
                    currentRole={currentRole}
                    onSelect={equipment => {
                      setSelectedEquipment(equipment);
                      setIsDetailOpen(true);
                    }}
                    onReportProblem={equipment => handleOpenReportModal(equipment)}
                    onQuickStatusChange={handleUpdateStatus}
                  />
                ))}
              </div>
            ) : (
              <EquipmentTable
                equipment={filteredEquipment}
                currentRole={currentRole}
                onSelect={equipment => {
                  setSelectedEquipment(equipment);
                  setIsDetailOpen(true);
                }}
                onReportProblem={equipment => handleOpenReportModal(equipment)}
                onQuickStatusChange={handleUpdateStatus}
              />
            )}
          </div>
        )}

        {/* NAV 2: WORK ORDERS / PROBLEM REPORTS */}
        {activeNav === 'workorders' && (
          <WorkOrdersView
            tickets={problemReports}
            equipmentList={equipmentList}
            currentRole={currentRole}
            onSelectEquipmentById={handleSelectEquipmentById}
            onOpenReportModal={() => handleOpenReportModal(null)}
            onOpenAssignModal={handleOpenAssignModal}
            onOpenResolveModal={handleOpenResolveModal}
            onStartRepair={handleStartRepair}
          />
        )}

        {/* NAV 3: MAINTENANCE HISTORY */}
        {activeNav === 'history' && (
          <MaintenanceHistoryView
            records={maintenanceRecords}
            equipmentList={equipmentList}
            onSelectEquipmentById={handleSelectEquipmentById}
          />
        )}

        {/* NAV 4: TECHNICIANS TEAM (Biomed Admin only) */}
        {activeNav === 'technicians' && currentRole === 'Admin' && (
          <TechniciansView
            technicians={technicians}
            equipmentList={equipmentList}
            tickets={problemReports}
            currentRole={currentRole}
            onFilterEquipmentByTech={techName => {
              setSearchQuery(techName);
              setActiveNav('equipment');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {facilitySettings.hospitalName} • Medical Equipment Uptime & Maintenance System
          </span>
          <span>
            Emergency Dispatch: <strong>{facilitySettings.primaryContactPhone}</strong>
          </span>
        </div>
      </footer>

      {/* MODALS */}

      {/* 1. Equipment Detail Drawer / Modal */}
      {selectedEquipment && (
        <EquipmentDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          equipment={selectedEquipment}
          currentRole={currentRole}
          activeTicket={problemReports.find(
            t => t.equipmentId === selectedEquipment.id && t.status !== 'Resolved'
          )}
          maintenanceHistory={maintenanceRecords.filter(
            r => r.equipmentId === selectedEquipment.id
          )}
          onReportProblem={eq => {
            setIsDetailOpen(false);
            handleOpenReportModal(eq);
          }}
          onOpenAssignModal={eq => {
            setIsDetailOpen(false);
            handleOpenAssignModal(eq);
          }}
          onOpenResolveModal={eq => {
            setIsDetailOpen(false);
            handleOpenResolveModal(eq);
          }}
          onStartRepair={handleStartRepair}
          onUpdateStatus={handleUpdateStatus}
          onAddTicketNote={handleAddTicketNote}
        />
      )}

      {/* 2. Report Problem Modal */}
      <ReportProblemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        equipmentList={equipmentList}
        preselectedEquipment={reportTargetEquipment}
        onSubmitReport={handleSubmitProblemReport}
        currentRole={currentRole}
      />

      {/* 3. Assign Technician Modal */}
      {assignTargetEquipment && (
        <AssignTechModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          equipment={assignTargetEquipment}
          activeTicket={problemReports.find(
            t => t.equipmentId === assignTargetEquipment.id && t.status !== 'Resolved'
          )}
          technicians={technicians}
          onAssignTechnician={handleAssignTechnician}
        />
      )}

      {/* 4. Resolve Repair Modal */}
      {resolveTargetEquipment && (
        <ResolveRepairModal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          equipment={resolveTargetEquipment}
          activeTicket={problemReports.find(
            t => t.equipmentId === resolveTargetEquipment.id && t.status !== 'Resolved'
          )}
          onResolveRepair={handleResolveRepair}
        />
      )}

      {/* 5. Add / Edit Equipment Modal */}
      <AddEditEquipmentModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        equipmentToEdit={editEquipmentTarget}
        onSaveEquipment={handleSaveEquipment}
      />

      {/* 6. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={facilitySettings}
        onSaveSettings={setFacilitySettings}
        onResetData={handleResetData}
      />
    </div>
  );
}
