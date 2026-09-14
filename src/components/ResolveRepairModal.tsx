import React, { useState } from 'react';
import { Equipment, ProblemReport } from '../types';
import { CheckCircle2, X, Wrench, Clock, ShieldCheck, DollarSign } from 'lucide-react';

interface ResolveRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment;
  activeTicket?: ProblemReport;
  onResolveRepair: (data: {
    equipmentId: string;
    resolutionSummary: string;
    partsReplaced: string[];
    downtimeHours: number;
    cost: number;
    technicianName: string;
  }) => void;
}

export const ResolveRepairModal: React.FC<ResolveRepairModalProps> = ({
  isOpen,
  onClose,
  equipment,
  activeTicket,
  onResolveRepair,
}) => {
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [partsInput, setPartsInput] = useState('');
  const [downtimeHours, setDowntimeHours] = useState<number>(
    activeTicket?.downtimeHours || 3.5
  );
  const [cost, setCost] = useState<number>(180);
  const [technicianName, setTechnicianName] = useState(
    equipment.assignedTechnicianName || 'Marcus Vance, CBET'
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionSummary.trim() || resolutionSummary.trim().length < 10) {
      setError('Please provide a descriptive resolution summary (at least 10 characters).');
      return;
    }

    const parts = partsInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    onResolveRepair({
      equipmentId: equipment.id,
      resolutionSummary: resolutionSummary.trim(),
      partsReplaced: parts,
      downtimeHours: Number(downtimeHours) || 1,
      cost: Number(cost) || 0,
      technicianName: technicianName.trim() || 'Biomedical Engineering Staff',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-50 border-b border-emerald-200/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sign-Off & Return to Operational Service
              </h3>
              <p className="text-xs text-emerald-800">
                Certify repair completion and log maintenance history record
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
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Equipment reference */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">{equipment.name}</span>
              <span className="font-mono text-slate-500">{equipment.id}</span>
            </div>
            <p className="text-slate-600 mt-0.5">{equipment.department} • {equipment.room}</p>
            {activeTicket && (
              <p className="mt-1 text-slate-500 italic">
                Resolving Ticket: {activeTicket.id}
              </p>
            )}
          </div>

          {/* Resolution Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Corrective Action Taken & Verification *
            </label>
            <textarea
              id="resolve-summary-input"
              rows={3}
              value={resolutionSummary}
              onChange={e => setResolutionSummary(e.target.value)}
              placeholder="e.g. Replaced proximal transducer sensor, cleaned intake port, ran full pre-use pneumatic calibration test. All alarms and waveforms verified within NFPA 99 tolerance..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Parts Replaced */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Parts Replaced (comma-separated)
            </label>
            <input
              type="text"
              value={partsInput}
              onChange={e => setPartsInput(e.target.value)}
              placeholder="e.g. Diaphragm seal #2, Transducer cable, O-ring gasket"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Metrics row: Downtime & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Total Downtime (Hours) *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={downtimeHours}
                  onChange={e => setDowntimeHours(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Total Parts & Labor Cost ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  value={cost}
                  onChange={e => setCost(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Technician Sign-Off */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Certifying Technician / Engineer *
            </label>
            <input
              type="text"
              value={technicianName}
              onChange={e => setTechnicianName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
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
              id="confirm-resolve-repair-btn"
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Certify & Return to Service</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
