import React, { useState } from 'react';
import { Equipment, Technician, ProblemReport } from '../types';
import { Wrench, X, UserCheck, AlertCircle, Clock } from 'lucide-react';

interface AssignTechModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment;
  activeTicket?: ProblemReport;
  technicians: Technician[];
  onAssignTechnician: (equipmentId: string, technician: Technician, note: string) => void;
}

export const AssignTechModal: React.FC<AssignTechModalProps> = ({
  isOpen,
  onClose,
  equipment,
  activeTicket,
  technicians,
  onAssignTechnician,
}) => {
  const [selectedTechId, setSelectedTechId] = useState<string>(
    equipment.assignedTechnicianId || technicians[0]?.id || ''
  );
  const [dispatchNote, setDispatchNote] = useState('');

  if (!isOpen) return null;

  const selectedTech = technicians.find(t => t.id === selectedTechId) || technicians[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech) return;
    onAssignTechnician(
      equipment.id,
      selectedTech,
      dispatchNote.trim() || `Dispatched to ${equipment.name} in ${equipment.room}.`
    );
    setDispatchNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-600 text-white shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Assign Technician
              </h3>
              <p className="text-xs text-amber-800">
                Dispatch engineer and transition equipment into Maintenance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Equipment Summary */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">{equipment.name}</span>
              <span className="font-mono text-slate-500">{equipment.id}</span>
            </div>
            <p className="text-slate-600 mt-0.5">{equipment.department} • {equipment.room}</p>
            {activeTicket && (
              <div className="mt-2 pt-2 border-t border-slate-200/80">
                <span className="font-semibold text-rose-700">Reported Issue: </span>
                <span className="text-slate-700">{activeTicket.issueDescription}</span>
              </div>
            )}
          </div>

          {/* Technician Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Engineer / Technician *
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {technicians.map(tech => (
                <label
                  key={tech.id}
                  className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTechId === tech.id
                      ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      id={`tech-${tech.id}`}
                      type="radio"
                      name="technician"
                      value={tech.id}
                      checked={selectedTechId === tech.id}
                      onChange={() => setSelectedTechId(tech.id)}
                      className="mt-1 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{tech.name}</p>
                      <p className="text-xs text-slate-500">{tech.title}</p>
                      <p className="text-[11px] text-amber-800 mt-1 font-medium">
                        Specialty: {tech.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      tech.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                      tech.status === 'Assigned' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {tech.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {tech.activeTicketsCount} active tickets
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Dispatch Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Initial Work Order / Dispatch Notes
            </label>
            <textarea
              id="assign-dispatch-note"
              name="dispatch-note"
              rows={2}
              value={dispatchNote}
              onChange={e => setDispatchNote(e.target.value)}
              placeholder="e.g. Bring spare pressure transducer kit; coordinate with ICU charge nurse prior to shutdown..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-assign-tech-btn"
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Assign & Transition to Maintenance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
