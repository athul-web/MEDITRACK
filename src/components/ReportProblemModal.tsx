import React, { useState, useEffect } from 'react';
import { Equipment, Department, TicketSeverity, ProblemReport, UserRole } from '../types';
import { AlertOctagon, X, AlertTriangle, Building2, MapPin, User, CheckCircle2 } from 'lucide-react';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentList: Equipment[];
  preselectedEquipment?: Equipment | null;
  onSubmitReport: (report: Omit<ProblemReport, 'id' | 'reportedAt' | 'status'>) => void;
  currentRole: UserRole;
}

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({
  isOpen,
  onClose,
  equipmentList,
  preselectedEquipment,
  onSubmitReport,
  currentRole,
}) => {
  const [selectedEqId, setSelectedEqId] = useState<string>('');
  const [severity, setSeverity] = useState<TicketSeverity>('High');
  const [issueDescription, setIssueDescription] = useState('');
  const [reportedBy, setReportedBy] = useState(
    currentRole === 'Staff' ? 'Staff Nurse Sarah Chen, RN' : 'Marcus Vance, CBET'
  );
  const [reportedRole, setReportedRole] = useState(
    currentRole === 'Staff' ? 'Clinical Ward Staff' : 'Biomedical Engineering'
  );
  const [roomOverride, setRoomOverride] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedEquipment) {
      setSelectedEqId(preselectedEquipment.id);
      setRoomOverride(preselectedEquipment.room);
    } else if (equipmentList.length > 0 && !selectedEqId) {
      setSelectedEqId(equipmentList[0].id);
      setRoomOverride(equipmentList[0].room);
    }
  }, [preselectedEquipment, equipmentList, isOpen]);

  if (!isOpen) return null;

  const currentSelectedEquipment = equipmentList.find(e => e.id === selectedEqId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqId) {
      setError('Please select the equipment experiencing issues.');
      return;
    }
    if (!issueDescription.trim() || issueDescription.trim().length < 10) {
      setError('Please provide a descriptive explanation of the malfunction (at least 10 characters).');
      return;
    }
    if (!reportedBy.trim()) {
      setError('Please provide your name for biomedical dispatch follow-up.');
      return;
    }

    if (!currentSelectedEquipment) return;

    onSubmitReport({
      equipmentId: currentSelectedEquipment.id,
      equipmentName: currentSelectedEquipment.name,
      department: currentSelectedEquipment.department,
      room: roomOverride || currentSelectedEquipment.room,
      severity,
      reportedBy,
      reportedRole,
      issueDescription: issueDescription.trim(),
    });

    // Reset fields
    setIssueDescription('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-200/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-600 text-white shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Report Equipment Breakdown or Problem
              </h3>
              <p className="text-xs text-rose-700">
                Log medical device malfunction for immediate Biomedical Engineering dispatch
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
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Equipment selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Affected Medical Equipment *
            </label>
            <select
              id="report-equipment-select"
              value={selectedEqId}
              onChange={e => {
                const eq = equipmentList.find(item => item.id === e.target.value);
                setSelectedEqId(e.target.value);
                if (eq) setRoomOverride(eq.room);
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
            >
              {equipmentList.map(item => (
                <option key={item.id} value={item.id}>
                  [{item.id}] {item.name} — {item.department} ({item.room})
                </option>
              ))}
            </select>
            {currentSelectedEquipment && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <span><strong>Model:</strong> {currentSelectedEquipment.model}</span>
                <span><strong>S/N:</strong> {currentSelectedEquipment.serialNumber}</span>
                <span><strong>Criticality:</strong> {currentSelectedEquipment.criticality}</span>
              </div>
            )}
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Urgency & Clinical Impact *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 'Critical', label: 'Critical', desc: 'Life-support or emergency stop' },
                { value: 'High', label: 'High', desc: 'Immediate clinical delay' },
                { value: 'Medium', label: 'Medium', desc: 'Intermittent or degraded' },
                { value: 'Low', label: 'Low', desc: 'Minor / cosmetic / supply' },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setSeverity(opt.value as TicketSeverity)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    severity === opt.value
                      ? opt.value === 'Critical'
                        ? 'border-red-500 bg-red-50 ring-2 ring-red-400/40 text-red-900'
                        : opt.value === 'High'
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/40 text-amber-900'
                        : opt.value === 'Medium'
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400/40 text-blue-900'
                        : 'border-slate-500 bg-slate-50 ring-2 ring-slate-400/40 text-slate-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs">{opt.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{currentSelectedEquipment?.department || 'Department'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Exact Room / Bed Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={roomOverride}
                  onChange={e => setRoomOverride(e.target.value)}
                  placeholder="e.g. ICU Bed 12 or Trauma Bay 2"
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Issue Symptoms & Error Codes *
            </label>
            <textarea
              id="report-issue-description"
              rows={3}
              value={issueDescription}
              onChange={e => setIssueDescription(e.target.value)}
              placeholder="Describe what occurred: error codes displayed on screen, unusual sounds, visual alarm warnings, physical damage, or power issues..."
              className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder:text-slate-400"
              required
            />
          </div>

          {/* Reporter details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reported By (Staff Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={reportedBy}
                  onChange={e => setReportedBy(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={reportedRole}
                onChange={e => setReportedRole(e.target.value)}
                placeholder="e.g. Charge Nurse, Radiology Lead"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
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
              id="submit-problem-report-btn"
              type="submit"
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Submit Problem Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
