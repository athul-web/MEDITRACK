import React, { useState } from 'react';
import { Phone, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { ResourceStatus } from '../../types/public';
import { hospitalRepository } from '../../data/repositories/hospitalRepository';

interface ReportResourceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalId: string;
  currentResources: Record<string, ResourceStatus>;
  onSuccess: () => Promise<void>;
}

export function ReportResourceUpdateModal({
  isOpen,
  onClose,
  hospitalId,
  currentResources,
  onSuccess,
}: ReportResourceUpdateModalProps) {
  const [updatedResources, setUpdatedResources] = useState<Record<string, ResourceStatus>>(currentResources);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStatusChange = (resource: string, status: ResourceStatus) => {
    setUpdatedResources(prev => ({ ...prev, [resource]: status }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await hospitalRepository.updateResources(hospitalId, updatedResources);
      await onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to update resource status. Please try again.');
      console.error('Resource update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Update Resource Status</h3>
            <p className="text-xs text-slate-500">Help the network by updating live availability.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            {Object.entries(currentResources).map(([resource, status]) => (
              <div key={resource} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:border-cyan-200">
                <span className="text-sm font-semibold text-slate-700 capitalize">
                  {resource.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <select
                  value={updatedResources[resource]}
                  onChange={(e) => handleStatusChange(resource, e.target.value as ResourceStatus)}
                  className="text-xs font-bold p-2 rounded-lg border border-slate-200 bg-white text-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="unknown">Unknown</option>
                  <option value="stale">Stale</option>
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-200'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Update
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
