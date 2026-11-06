import React, { useEffect, useMemo, useState } from 'react';
import { Wrench, Filter, Calendar, User, Clock, ExternalLink } from 'lucide-react';
import { mapDbToFrontend, supabase } from '../../lib/supabase';
import { Equipment, MaintenanceRecord } from '../../types';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface LoadState {
  equipment: boolean;
  maintenance: boolean;
}

export function Maintenance() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [partialErrors, setPartialErrors] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<LoadState>({ equipment: false, maintenance: false });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      setIsLoading(true);
      setLoadError(null);
      setPartialErrors([]);

      try {
        const results = await Promise.allSettled([
          supabase.from('equipment').select('*'),
          supabase.from('maintenance_records').select('*'),
        ]);

        const nextLoaded: LoadState = { equipment: false, maintenance: false };
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

        const maintenanceResult = results[1];
        if (maintenanceResult.status === 'fulfilled' && !maintenanceResult.value.error) {
          if (isActive) {
            setMaintenanceRecords(mapDbToFrontend<MaintenanceRecord[]>(maintenanceResult.value.data ?? []));
            nextLoaded.maintenance = true;
          }
        } else {
          warnings.push('maintenance records');
        }

        if (isActive) {
          setLoaded(nextLoaded);
          setPartialErrors(warnings);
        }
      } catch (err: any) {
        if (isActive) setLoadError(err?.message || 'Unable to load maintenance data.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadData();
    return () => {
      isActive = false;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    return [...maintenanceRecords].filter((record) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        record.id.toLowerCase().includes(query) ||
        record.equipmentName.toLowerCase().includes(query) ||
        record.equipmentId.toLowerCase().includes(query) ||
        record.technicianName.toLowerCase().includes(query) ||
        record.description.toLowerCase().includes(query);

      const matchesType = filterType === 'all' || record.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [maintenanceRecords, searchTerm, filterType]);

  const totalDowntime = useMemo(() => {
    return filteredRecords.reduce((total, record) => total + (record.downtimeHours || 0), 0);
  }, [filteredRecords]);

  const totalCost = useMemo(() => {
    return filteredRecords.reduce((total, record) => total + (record.cost || 0), 0);
  }, [filteredRecords]);

  if (isLoading) {
    return <div className="py-12 text-center text-navy-500 text-sm">Loading maintenance records…</div>;
  }

  if (loadError) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">{loadError}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Biomedical Maintenance History</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Completed maintenance, calibration, inspection, and repair records from MediTrack.
          </p>
        </div>
      </div>

      {partialErrors.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          Some supporting data could not be loaded: {partialErrors.join(', ')}.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-neutral-200 rounded p-3">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Records</span>
          <div className="text-lg font-bold text-navy-900 mt-0.5">{loaded.maintenance ? filteredRecords.length : 'Unavailable'}</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded p-3">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Logged Downtime</span>
          <div className="text-lg font-bold text-amber-600 mt-0.5">
            {loaded.maintenance ? `${totalDowntime.toFixed(1)} hrs` : 'Unavailable'}
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded p-3">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Servicing Cost</span>
          <div className="text-lg font-bold text-teal-700 mt-0.5">
            {loaded.maintenance ? `$${totalCost.toLocaleString()}` : 'Unavailable'}
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-md p-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search maintenance logs by record, device, technician…"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Type"
            value={filterType}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'Corrective Repair', label: 'Corrective' },
              { value: 'Preventive Maintenance', label: 'Preventive' },
              { value: 'Calibration', label: 'Calibration' },
              { value: 'Inspection', label: 'Inspection' },
            ]}
            onChange={setFilterType}
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
        {!loaded.maintenance ? (
          <EmptyState title="Maintenance data unavailable" description="Completed maintenance records could not be loaded." />
        ) : filteredRecords.length === 0 ? (
          <EmptyState title="No maintenance records match the criteria" description="Completed service and repair records will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-navy-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Record ID</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Target Asset</th>
                  <th className="px-3 py-3">Technician</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Downtime</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-navy-900 font-mono text-[11px]">{record.id}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded border text-[11px] font-medium ${
                          record.type === 'Corrective Repair'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : record.type === 'Preventive Maintenance'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : record.type === 'Calibration'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        {record.type}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-navy-900">{record.equipmentName}</div>
                      <div className="font-mono text-neutral-400 text-[11px]">{record.equipmentId}</div>
                    </td>
                    <td className="px-3 py-3 text-navy-700">{record.technicianName || 'Unavailable'}</td>
                    <td className="px-3 py-3 font-mono text-navy-600">
                      {record.resolvedDate ? formatSafeDate(record.resolvedDate) : formatSafeDate(record.date)}
                    </td>
                    <td className="px-3 py-3 text-navy-700">{record.downtimeHours ?? 0} hrs</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedRecord(record);
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

      {selectedRecord && (
        <Modal
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Maintenance Record — ${selectedRecord.id}`}
          width="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Equipment</span>
                <span className="font-semibold text-navy-900">{selectedRecord.equipmentName}</span>
                <span className="text-neutral-400 block font-mono text-[11px]">{selectedRecord.equipmentId}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Type</span>
                <span className="font-medium text-navy-800">{selectedRecord.type}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Technician</span>
                <span className="font-medium text-navy-800">{selectedRecord.technicianName || 'Unavailable'}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Service Date</span>
                <span className="font-mono text-navy-800">{formatSafeDate(selectedRecord.date)}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Resolved Date</span>
                <span className="font-mono text-navy-800">{formatSafeDate(selectedRecord.resolvedDate)}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Downtime</span>
                <span className="font-medium text-navy-800">{selectedRecord.downtimeHours ?? 0} hrs</span>
              </div>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">Description</span>
              <p className="p-2.5 bg-white border border-neutral-200 rounded text-navy-800 leading-relaxed">
                {selectedRecord.description}
              </p>
            </div>

            {selectedRecord.partsReplaced && selectedRecord.partsReplaced.length > 0 && (
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">Parts Replaced</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecord.partsReplaced.map((part, index) => (
                    <span key={`${part}-${index}`} className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[11px]">
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedRecord.notes && (
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">Notes</span>
                <p className="p-2.5 bg-neutral-50 border border-neutral-200 rounded text-navy-700">{selectedRecord.notes}</p>
              </div>
            )}

            {typeof selectedRecord.cost === 'number' && (
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">Cost</span>
                <p className="text-navy-900 font-semibold">${selectedRecord.cost.toLocaleString()}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
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
