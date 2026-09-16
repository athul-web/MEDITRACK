import React, { useState } from 'react';
import { Equipment, UserRole, ProblemReport, MaintenanceRecord, Technician } from '../types';
import { calculateUptimeHours } from '../utils/equipment';
import { EquipmentStatusBadge, CriticalityBadge, SeverityBadge, TicketStatusBadge } from './StatusBadge';
import { 
  X, 
  MapPin, 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus, 
  User, 
  ShieldCheck, 
  ChevronRight,
  Info,
  DollarSign
} from 'lucide-react';

interface EquipmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment;
  currentRole: UserRole;
  activeTicket?: ProblemReport;
  maintenanceHistory: MaintenanceRecord[];
  onReportProblem: (equipment: Equipment) => void;
  onOpenAssignModal: (equipment: Equipment) => void;
  onOpenResolveModal: (equipment: Equipment) => void;
  onStartRepair?: (ticketId: string) => void;
  onUpdateStatus: (equipmentId: string, status: Equipment['status']) => void;
  onAddTicketNote: (ticketId: string, note: string) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  isOpen,
  onClose,
  equipment,
  currentRole,
  activeTicket,
  maintenanceHistory,
  onReportProblem,
  onOpenAssignModal,
  onOpenResolveModal,
  onStartRepair,
  onUpdateStatus,
  onAddTicketNote,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ticket' | 'history'>('overview');
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!isOpen) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !activeTicket) return;
    onAddTicketNote(activeTicket.id, newNote.trim());
    setNewNote('');
    setIsAddingNote(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {equipment.id}
                </span>
                <CriticalityBadge level={equipment.criticality} />
                <EquipmentStatusBadge status={equipment.status} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {equipment.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Model: <strong className="text-slate-700">{equipment.model}</strong> • Manufacturer: <strong className="text-slate-700">{equipment.manufacturer}</strong> • Serial: <span className="font-mono">{equipment.serialNumber}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Info bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span><strong>Location:</strong> {equipment.department} — {equipment.room}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span><strong>Installed:</strong> {equipment.installDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span><strong>Next Service:</strong> {equipment.nextScheduledMaintenance}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/70 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview & Specifications
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ticket'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Active Incident / Work Order</span>
            {activeTicket && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Maintenance History</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
              {maintenanceHistory.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Admin Status Quick Action Control */}
              {currentRole === 'Admin' ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Biomedical Engineering Status Control
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Update operational status for clinical availability
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onUpdateStatus(equipment.id, 'Working')}
                        disabled={equipment.status === 'Working'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          equipment.status === 'Working'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 opacity-60 cursor-not-allowed'
                            : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                        }`}
                      >
                        Set Operational
                      </button>
                      <button
                        onClick={() => onUpdateStatus(equipment.id, 'Under Maintenance')}
                        disabled={equipment.status === 'Under Maintenance'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          equipment.status === 'Under Maintenance'
                            ? 'bg-amber-100 text-amber-800 border-amber-300 opacity-60 cursor-not-allowed'
                            : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
                        }`}
                      >
                        In Maintenance
                      </button>
                      <button
                        onClick={() => onUpdateStatus(equipment.id, 'Down')}
                        disabled={equipment.status === 'Down'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          equipment.status === 'Down'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 opacity-60 cursor-not-allowed'
                            : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                        }`}
                      >
                        Mark Down
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Uptime & Reliability Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-xs text-slate-500 font-medium">Total Uptime (Hours)</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {calculateUptimeHours(equipment).toLocaleString()} hrs
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Calculated from installation date</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-xs text-slate-500 font-medium">Total Recorded Downtime</span>
                  <div className="mt-1">
                    <span className="text-2xl font-bold text-slate-900">{equipment.totalDowntimeHours} hrs</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Cumulative since install</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-xs text-slate-500 font-medium">Current Service Lead</span>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {equipment.assignedTechnicianName || 'Unassigned'}
                      </p>
                      <p className="text-[11px] text-slate-500">Biomedical Team</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Technical Specifications & Engineering Parameters
                </h4>
                {equipment.specifications ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(equipment.specifications).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">{key}</span>
                        <span className="text-slate-900 font-semibold text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Standard clinical instrumentation specifications.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE TICKET */}
          {activeTab === 'ticket' && (
            <div className="space-y-4">
              {activeTicket ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {activeTicket.id}
                      </span>
                      <SeverityBadge severity={activeTicket.severity} />
                      <TicketStatusBadge status={activeTicket.status} />
                    </div>
                    <span className="text-xs text-slate-500">
                      Reported: {activeTicket.reportedAt}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Reported Malfunction
                    </h5>
                    <p className="text-sm text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {activeTicket.issueDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-500">Reported By: </span>
                      <strong className="text-slate-800">{activeTicket.reportedBy}</strong> ({activeTicket.reportedRole})
                    </div>
                    <div>
                      <span className="text-slate-500">Assigned Technician: </span>
                      <strong className="text-slate-800">{activeTicket.assignedTechnicianName || 'Unassigned'}</strong>
                    </div>
                  </div>

                  {/* Repair Progress Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Biomedical Service Updates ({activeTicket.repairNotes?.length || 0})
                      </h5>
                      {currentRole === 'Admin' && !isAddingNote && (
                        <button
                          onClick={() => setIsAddingNote(true)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Note
                        </button>
                      )}
                    </div>

                    {isAddingNote && (
                      <form onSubmit={handleAddNote} className="mb-3 space-y-2">
                        <textarea
                          rows={2}
                          value={newNote}
                          onChange={e => setNewNote(e.target.value)}
                          placeholder="Enter timestamped update (e.g. Parts arrived, re-testing circuitry)..."
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-blue-500"
                          required
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingNote(false)}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Save Note
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2">
                      {activeTicket.repairNotes && activeTicket.repairNotes.length > 0 ? (
                        activeTicket.repairNotes.map((note, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                            {note}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No notes recorded yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Actions for this ticket */}
                  {currentRole === 'Admin' && (
                    <div className="pt-3 border-t border-amber-200 flex flex-wrap items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenAssignModal(equipment)}
                        className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>{activeTicket.assignedTechnicianName ? 'Reassign Tech' : 'Assign Tech'}</span>
                      </button>

                      {activeTicket.status === 'Assigned' && onStartRepair && (
                        <button
                          onClick={() => onStartRepair(activeTicket.id)}
                          className="px-3.5 py-1.5 rounded-lg border border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Start Repair (In Repair)</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenResolveModal(equipment)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sign-Off & Return to Service</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Active Incident or Malfunction</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    This unit is operating smoothly without any open breakdown tickets.
                  </p>
                  <button
                    onClick={() => onReportProblem(equipment)}
                    className="mt-4 px-3.5 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report a New Problem</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MAINTENANCE HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Historical Maintenance Log & Calibration Audit Trail
                </h4>
                <span className="text-xs text-slate-500">
                  {maintenanceHistory.length} total events recorded
                </span>
              </div>

              {maintenanceHistory.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No previous maintenance logs recorded for this equipment.
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceHistory.map(record => (
                    <div 
                      key={record.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-500">
                            {record.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {record.type}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">
                            {record.technicianName}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                          {record.date} ({record.resolvedDate})
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {record.description}
                      </p>

                      {record.partsReplaced && record.partsReplaced.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600">
                          <span className="font-medium text-slate-500">Parts Replaced:</span>
                          {record.partsReplaced.map((part, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {part}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Downtime recorded: <strong>{record.downtimeHours} hrs</strong></span>
                        {record.cost ? (
                          <span>Service Cost: <strong>${record.cost}</strong></span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReportProblem(equipment)}
              className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>

            {currentRole === 'Admin' && (
              <>
                <button
                  onClick={() => onOpenAssignModal(equipment)}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{equipment.assignedTechnicianName ? 'Reassign' : 'Assign Tech'}</span>
                </button>

                {activeTicket?.status === 'Assigned' && onStartRepair && (
                  <button
                    onClick={() => onStartRepair(activeTicket.id)}
                    className="px-3 py-1.5 rounded-lg border border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Start Repair</span>
                  </button>
                )}

                {equipment.status !== 'Working' && (
                  <button
                    onClick={() => onOpenResolveModal(equipment)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve & Return to Service</span>
                  </button>
                )}
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
