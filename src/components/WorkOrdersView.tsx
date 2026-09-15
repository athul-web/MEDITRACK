import React, { useState } from 'react';
import { ProblemReport, Equipment, UserRole, TicketStatus, TicketSeverity } from '../types';
import { SeverityBadge, TicketStatusBadge } from './StatusBadge';
import { 
  AlertTriangle, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Filter, 
  User, 
  Building2, 
  MapPin, 
  ArrowRight,
  Plus
} from 'lucide-react';

interface WorkOrdersViewProps {
  tickets: ProblemReport[];
  equipmentList: Equipment[];
  currentRole: UserRole;
  onSelectEquipmentById: (id: string) => void;
  onOpenReportModal: () => void;
  onOpenAssignModal: (equipment: Equipment) => void;
  onOpenResolveModal: (equipment: Equipment) => void;
  onStartRepair: (ticketId: string) => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  tickets,
  equipmentList,
  currentRole,
  onSelectEquipmentById,
  onOpenReportModal,
  onOpenAssignModal,
  onOpenResolveModal,
  onStartRepair,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'All' && ticket.status !== statusFilter) return false;
    if (severityFilter !== 'All' && ticket.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (ticket.id ?? '').toLowerCase().includes(q) ||
        (ticket.equipmentName ?? '').toLowerCase().includes(q) ||
        (ticket.equipmentId ?? '').toLowerCase().includes(q) ||
        (ticket.department ?? '').toLowerCase().includes(q) ||
        (ticket.reportedBy ?? '').toLowerCase().includes(q) ||
        (ticket.assignedTechnicianName && ticket.assignedTechnicianName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const reportedCount = tickets.filter(t => t.status === 'Reported').length;
  const assignedCount = tickets.filter(t => t.status === 'Assigned').length;
  const repairCount = tickets.filter(t => t.status === 'In Repair').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Workflow Stage Summary Bar with interactive filter cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          id="status-card-reported"
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter(statusFilter === 'Reported' ? 'All' : 'Reported')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setStatusFilter(statusFilter === 'Reported' ? 'All' : 'Reported'); }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Reported' 
              ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-300 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-800">1. Reported</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{reportedCount}</p>
          <p className="text-[11px] text-slate-500">Awaiting dispatch</p>
        </div>

        <div 
          id="status-card-assigned"
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter(statusFilter === 'Assigned' ? 'All' : 'Assigned')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setStatusFilter(statusFilter === 'Assigned' ? 'All' : 'Assigned'); }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Assigned' 
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">2. Assigned</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{assignedCount}</p>
          <p className="text-[11px] text-slate-500">Tech dispatched</p>
        </div>

        <div 
          id="status-card-in-repair"
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter(statusFilter === 'In Repair' ? 'All' : 'In Repair')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setStatusFilter(statusFilter === 'In Repair' ? 'All' : 'In Repair'); }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'In Repair' 
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">3. In Repair</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{repairCount}</p>
          <p className="text-[11px] text-slate-500">Under maintenance</p>
        </div>

        <div 
          id="status-card-resolved"
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter(statusFilter === 'Resolved' ? 'All' : 'Resolved')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setStatusFilter(statusFilter === 'Resolved' ? 'All' : 'Resolved'); }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Resolved' 
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">4. Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{resolvedCount}</p>
          <p className="text-[11px] text-slate-500">Restored to service</p>
        </div>
      </div>

      {/* Filter and Search Bar with "All" Filter Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tickets by ID, equipment, reporter, technician..."
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="status-card-all"
            onClick={() => setStatusFilter('All')}
            className={`text-xs px-3 py-2 rounded-lg border font-semibold transition-all ${
              statusFilter === 'All'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            All Work Orders ({tickets.length})
          </button>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Assigned">Assigned</option>
            <option value="In Repair">In Repair</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            id="new-ticket-btn"
            onClick={onOpenReportModal}
            className="text-xs px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Active Filter indicator */}
      {statusFilter !== 'All' && (
        <div className="flex items-center justify-between text-xs bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700">
          <span>
            Filtering by status: <strong className="text-slate-900">{statusFilter}</strong> ({filteredTickets.length} matching)
          </span>
          <button
            onClick={() => setStatusFilter('All')}
            className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
          >
            Clear filter (Show all)
          </button>
        </div>
      )}
      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-white border border-slate-200 text-slate-400 text-xs">
            No work orders match the selected filters.
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const eq = equipmentList.find(e => e.id === ticket.equipmentId);

            return (
              <div
                key={ticket.id}
                id={`work-order-row-${ticket.id}`}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all space-y-3"
              >
                {/* Header line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {ticket.id}
                    </span>
                    <SeverityBadge severity={ticket.severity} />
                    <TicketStatusBadge status={ticket.status} />
                    <span className="font-semibold text-sm text-slate-900">
                      {ticket.equipmentName}
                    </span>
                    <span className="font-mono text-xs text-slate-400">({ticket.equipmentId})</span>
                  </div>

                  <span className="text-xs text-slate-500">
                    Reported: {ticket.reportedAt}
                  </span>
                </div>

                {/* Location & Issue description */}
                <div className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{ticket.department} — {ticket.room}</span>
                    <span>•</span>
                    <User className="w-3.5 h-3.5" />
                    <span>Reported by: <strong>{ticket.reportedBy}</strong> ({ticket.reportedRole})</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed mt-1">
                    {ticket.issueDescription}
                  </p>
                </div>

                {/* Technician & Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Assigned Technician:</span>
                    {ticket.assignedTechnicianName ? (
                      <span className="font-medium text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {ticket.assignedTechnicianName}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id={`view-details-${ticket.id}`}
                      onClick={() => onSelectEquipmentById(ticket.equipmentId)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      View Equipment Details
                    </button>

                    {currentRole === 'Admin' && eq && ticket.status !== 'Resolved' && (
                      <>
                        {ticket.status === 'Reported' && (
                          <button
                            id={`assign-tech-${ticket.id}`}
                            onClick={() => onOpenAssignModal(eq)}
                            className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold flex items-center gap-1 shadow-xs"
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>Assign Tech</span>
                          </button>
                        )}

                        {ticket.status === 'Assigned' && (
                          <>
                            <button
                              id={`reassign-tech-${ticket.id}`}
                              onClick={() => onOpenAssignModal(eq)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs"
                            >
                              Reassign
                            </button>
                            <button
                              id={`start-repair-${ticket.id}`}
                              onClick={() => onStartRepair(ticket.id)}
                              className="px-3 py-1.5 rounded-lg border border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold flex items-center gap-1 shadow-xs"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Start Repair</span>
                            </button>
                          </>
                        )}

                        {ticket.status === 'In Repair' && (
                          <>
                            <button
                              id={`reassign-tech-${ticket.id}`}
                              onClick={() => onOpenAssignModal(eq)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs"
                            >
                              Reassign
                            </button>
                            <button
                              id={`resolve-repair-${ticket.id}`}
                              onClick={() => onOpenResolveModal(eq)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Resolve Repair</span>
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {ticket.status === 'Resolved' && (
                      <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
