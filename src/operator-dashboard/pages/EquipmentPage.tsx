import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toEquipmentRow } from '../../lib/supabase';
import {
  ArrowUpDown,
  ShieldAlert,
  Activity,
  X,
} from 'lucide-react';
import {
  supabase,
  mapDbToFrontend,
  getCurrentUserHospitalId,
} from '../../lib/supabase';
import { Equipment as MediTrackEquipment } from '../../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';

const DEPARTMENTS: import('../../types').Department[] = [
  'Intensive Care Unit (ICU)',
  'Emergency Department (ED)',
  'Radiology & Imaging',
  'Cardiology',
  'Operating Rooms (OR)',
  'Central Sterile Supply (CSSD)',
  'Clinical Laboratory',
  'Oncology & Infusion',
  'Neonatal ICU (NICU)',
];

type SortField = 'id' | 'name' | 'department' | 'criticality' | 'status' | 'installDate';

function equipmentStatusBadge(status: string) {
  switch (status) {
    case 'Working':
      return <StatusBadge variant="success" dot>Working</StatusBadge>;
    case 'Down':
      return <StatusBadge variant="error" dot>Down</StatusBadge>;
    case 'Under Maintenance':
      return <StatusBadge variant="purple" dot>Maintenance</StatusBadge>;
    case 'Needs Attention':
      return <StatusBadge variant="warning" dot>Attention</StatusBadge>;
    default:
      return <StatusBadge variant="neutral">{status}</StatusBadge>;
  }
}

function criticalityBadge(criticality: string) {
  switch (criticality) {
    case 'Life Support':
      return <StatusBadge variant="error">Life Support</StatusBadge>;
    case 'Critical Diagnostic':
      return <StatusBadge variant="error">Critical Diagnostic</StatusBadge>;
    case 'Patient Monitoring':
      return <StatusBadge variant="info">Patient Monitoring</StatusBadge>;
    default:
      return <StatusBadge variant="neutral">{criticality}</StatusBadge>;
  }
}

export function Equipment() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [equipment, setEquipment] = useState<MediTrackEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectedIdFromUrl = searchParams.get('id');
  const [selectedEquipment, setSelectedEquipment] = useState<MediTrackEquipment | null>(null);

  const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<MediTrackEquipment | null>(null);
  const [isSavingEquipment, setIsSavingEquipment] = useState(false);
  const [equipmentFormError, setEquipmentFormError] = useState<string | null>(null);

  const emptyEquipmentForm = () => ({
    name: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    department: DEPARTMENTS[0],
    room: '',
    criticality: 'Critical Diagnostic' as import('../../types').CriticalityLevel,
    status: 'Working' as MediTrackEquipment['status'],
    installDate: new Date().toISOString().slice(0, 10),
  });

  const [equipmentForm, setEquipmentForm] = useState(emptyEquipmentForm());

  useEffect(() => {
    if (!isEquipmentFormOpen) return;
    if (editingEquipment) {
      setEquipmentForm({
        name: editingEquipment.name,
        model: editingEquipment.model,
        manufacturer: editingEquipment.manufacturer,
        serialNumber: editingEquipment.serialNumber,
        department: editingEquipment.department,
        room: editingEquipment.room,
        criticality: editingEquipment.criticality,
        status: editingEquipment.status,
        installDate: editingEquipment.installDate,
      });
    } else {
      setEquipmentForm(emptyEquipmentForm());
    }
    setEquipmentFormError(null);
  }, [isEquipmentFormOpen, editingEquipment]);

  const openAddEquipment = () => {
    setEditingEquipment(null);
    setIsEquipmentFormOpen(true);
  };

  const openEditEquipment = (equipmentRecord: MediTrackEquipment) => {
    setEditingEquipment(equipmentRecord);
    setSelectedEquipment(null);
    setSearchParams({});
    setIsEquipmentFormOpen(true);
  };


  useEffect(() => {
    if (!selectedIdFromUrl || equipment.length === 0) return;
    const match = equipment.find((eq) => eq.id === selectedIdFromUrl);
    if (match) setSelectedEquipment(match);
  }, [selectedIdFromUrl, equipment]);

  useEffect(() => {
    let isActive = true;

    async function loadEquipment() {
      try {
        setIsLoading(true);
        setLoadError(null);
        await getCurrentUserHospitalId();
        const { data, error } = await supabase.from('equipment').select('*');
        if (error) throw error;
        if (!isActive) return;
        setEquipment((data ?? []).map((row) => mapDbToFrontend<MediTrackEquipment>(row)));
      } catch (err: any) {
        if (isActive) {
          setLoadError(err?.message || 'Unable to load equipment records.');
          setEquipment([]);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadEquipment();
    return () => {
      isActive = false;
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCriticality, setSelectedCriticality] = useState('all');

  const [sortField, setSortField] = useState<SortField>('id');
  const [sortAsc, setSortAsc] = useState(true);

  const departmentsList = useMemo(() => {
    return ['all', ...Array.from(new Set(equipment.map((eq) => eq.department))).sort()];
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    return equipment
      .filter((eq) => {
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch =
          query === '' ||
          eq.id.toLowerCase().includes(query) ||
          eq.name.toLowerCase().includes(query) ||
          eq.model.toLowerCase().includes(query) ||
          eq.serialNumber.toLowerCase().includes(query) ||
          eq.room.toLowerCase().includes(query) ||
          eq.manufacturer.toLowerCase().includes(query);

        const matchesDepartment = selectedDepartment === 'all' || eq.department === selectedDepartment;
        const matchesStatus = selectedStatus === 'all' || eq.status === selectedStatus;
        const matchesCriticality =
          selectedCriticality === 'all' || eq.criticality === selectedCriticality;

        return matchesSearch && matchesDepartment && matchesStatus && matchesCriticality;
      })
      .sort((a, b) => {
        let valueA: string | number = a[sortField];
        let valueB: string | number = b[sortField];

        if (sortField === 'installDate') {
          valueA = new Date(a.installDate).getTime();
          valueB = new Date(b.installDate).getTime();
        }

        if (valueA < valueB) return sortAsc ? -1 : 1;
        if (valueA > valueB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [
    equipment,
    searchTerm,
    selectedDepartment,
    selectedStatus,
    selectedCriticality,
    sortField,
    sortAsc,
  ]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc((value) => !value);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleOpenDetail = (eq: MediTrackEquipment) => {
    setSelectedEquipment(eq);
    setSearchParams({ id: eq.id });
  };

  const handleCloseDetail = () => {
    setSelectedEquipment(null);
    setSearchParams({});
  };

  const handleSaveEquipmentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !equipmentForm.name.trim() ||
      !equipmentForm.model.trim() ||
      !equipmentForm.manufacturer.trim() ||
      !equipmentForm.serialNumber.trim() ||
      !equipmentForm.room.trim()
    ) {
      setEquipmentFormError('Please fill out all required fields.');
      return;
    }

    setIsSavingEquipment(true);
    setEquipmentFormError(null);

    try {
      const hospitalId = await getCurrentUserHospitalId();
      const newEquipment: MediTrackEquipment = {
        id: editingEquipment ? editingEquipment.id : `EQ-${equipmentForm.department.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        name: equipmentForm.name.trim(),
        model: equipmentForm.model.trim(),
        manufacturer: equipmentForm.manufacturer.trim(),
        serialNumber: equipmentForm.serialNumber.trim(),
        department: equipmentForm.department,
        room: equipmentForm.room.trim(),
        criticality: equipmentForm.criticality,
        status: equipmentForm.status,
        installDate: equipmentForm.installDate,
        lastMaintenanceDate: editingEquipment ? editingEquipment.lastMaintenanceDate : equipmentForm.installDate,
        nextScheduledMaintenance: editingEquipment
          ? editingEquipment.nextScheduledMaintenance
          : new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString().slice(0, 10),
        uptimePercentage: editingEquipment ? editingEquipment.uptimePercentage : 100,
        totalDowntimeHours: editingEquipment ? editingEquipment.totalDowntimeHours : 0,
        assignedTechnicianId: editingEquipment?.assignedTechnicianId,
        assignedTechnicianName: editingEquipment?.assignedTechnicianName,
        specifications: editingEquipment?.specifications || {},
      };

      const { error } = await supabase
        .from('equipment')
        .upsert({
          ...toEquipmentRow(newEquipment),
          hospital_id: hospitalId,
        });

      if (error) throw error;

      setEquipment((previous) => {
        const exists = previous.some((item) => item.id === newEquipment.id);
        return exists
          ? previous.map((item) => (item.id === newEquipment.id ? newEquipment : item))
          : [newEquipment, ...previous];
      });

      setIsEquipmentFormOpen(false);
      setEditingEquipment(null);
    } catch (err: any) {
      setEquipmentFormError(err?.message || 'Unable to save equipment.');
    } finally {
      setIsSavingEquipment(false);
    }
  };

  const handleStatusUpdate = async (equipmentId: string, newStatus: MediTrackEquipment['status']) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .update({ status: newStatus })
        .eq('id', equipmentId);

      if (error) throw error;

      setEquipment((previous) =>
        previous.map((item) =>
          item.id === equipmentId ? { ...item, status: newStatus } : item
        )
      );

      setSelectedEquipment((previous) =>
        previous && previous.id === equipmentId ? { ...previous, status: newStatus } : previous
      );
    } catch (err: any) {
      setLoadError(err?.message || 'Unable to update equipment status.');
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-navy-500 text-sm">Loading equipment records…</div>;
  }

  if (loadError) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">{loadError}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Equipment Inventory</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Operational registry of biomedical devices and maintenance schedules.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddEquipment}
          className="inline-flex items-center gap-1.5 bg-navy-900 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-navy-800"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Equipment
        </button>
        <div className="text-xs text-navy-600 bg-white border border-neutral-200 px-3 py-1.5 rounded font-medium">
          Showing <span className="font-bold text-navy-900">{filteredEquipment.length}</span> of{' '}
          {equipment.length} assets
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-md p-3 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by ID, name, model, serial number, room, or manufacturer…"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Department"
              value={selectedDepartment}
              options={departmentsList.map((department) => ({
                value: department,
                label: department === 'all' ? 'All Departments' : department,
              }))}
              onChange={setSelectedDepartment}
            />

            <FilterDropdown
              label="Status"
              value={selectedStatus}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Working', label: 'Working' },
                { value: 'Needs Attention', label: 'Needs Attention' },
                { value: 'Under Maintenance', label: 'Under Maintenance' },
                { value: 'Down', label: 'Down' },
              ]}
              onChange={setSelectedStatus}
            />

            <FilterDropdown
              label="Criticality"
              value={selectedCriticality}
              options={[
                { value: 'all', label: 'All Criticalities' },
                { value: 'Life Support', label: 'Life Support' },
                { value: 'Critical Diagnostic', label: 'Critical Diagnostic' },
                { value: 'Patient Monitoring', label: 'Patient Monitoring' },
                { value: 'General Clinical', label: 'General Clinical' },
              ]}
              onChange={setSelectedCriticality}
            />

            {(searchTerm ||
              selectedDepartment !== 'all' ||
              selectedStatus !== 'all' ||
              selectedCriticality !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDepartment('all');
                  setSelectedStatus('all');
                  setSelectedCriticality('all');
                }}
                className="text-xs text-neutral-500 hover:text-navy-900 px-2 py-1 underline font-medium"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
        {filteredEquipment.length === 0 ? (
          <EmptyState
            title="No matching equipment found"
            description="Try adjusting your search terms or filter selections."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-navy-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 cursor-pointer hover:bg-neutral-100/70" onClick={() => toggleSort('id')}>
                    <div className="flex items-center gap-1">
                      Equipment ID <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer hover:bg-neutral-100/70" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-1">
                      Device & Model <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer hover:bg-neutral-100/70" onClick={() => toggleSort('department')}>
                    <div className="flex items-center gap-1">
                      Department / Room <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer hover:bg-neutral-100/70" onClick={() => toggleSort('status')}>
                    <div className="flex items-center gap-1">
                      Operational State <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer hover:bg-neutral-100/70" onClick={() => toggleSort('criticality')}>
                    <div className="flex items-center gap-1">
                      Criticality <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer hover:bg-neutral-100/70" onClick={() => toggleSort('installDate')}>
                    <div className="flex items-center gap-1">
                      Installed / Maintenance <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredEquipment.map((eq) => (
                  <tr
                    key={eq.id}
                    onClick={() => handleOpenDetail(eq)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-navy-900">{eq.id}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-navy-800">{eq.name}</div>
                      <div className="text-neutral-500 text-[11px]">{eq.model} • SN: {eq.serialNumber}</div>
                    </td>
                    <td className="px-3 py-3 text-navy-700">
                      <div>{eq.department}</div>
                      <div className="text-neutral-400 text-[11px]">{eq.room}</div>
                    </td>
                    <td className="px-3 py-3">{equipmentStatusBadge(eq.status)}</td>
                    <td className="px-3 py-3">{criticalityBadge(eq.criticality)}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-navy-600">
                      <div>Installed: {eq.installDate || '—'}</div>
                      <div>Due: {eq.nextScheduledMaintenance || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpenDetail(eq);
                        }}
                        className="text-teal-700 hover:text-teal-800 font-medium text-[11px] hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEquipment && (
        <Modal
          open={!!selectedEquipment}
          onClose={handleCloseDetail}
          title={`Equipment Record — ${selectedEquipment.id} (${selectedEquipment.name})`}
          width="max-w-2xl"
        >
          <div className="space-y-5 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Operator Notice:</span> Technical link status and remote
                connectivity data are not yet available from MediTrack. Do not assume clinical safety from
                this record alone.
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Model</span>
                <span className="font-medium text-navy-900">{selectedEquipment.model}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Serial Number</span>
                <span className="font-mono text-navy-900">{selectedEquipment.serialNumber}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Criticality</span>
                <span className="font-medium text-navy-900">{selectedEquipment.criticality}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Assigned Dept</span>
                <span className="font-medium text-navy-900">{selectedEquipment.department}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Room / Location</span>
                <span className="font-medium text-navy-900">{selectedEquipment.room}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Manufacturer</span>
                <span className="font-medium text-navy-900">{selectedEquipment.manufacturer}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border border-neutral-200 rounded p-3">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">Operational State</span>
                {equipmentStatusBadge(selectedEquipment.status)}
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">Uptime %</span>
                <span className="font-medium text-navy-900">{selectedEquipment.uptimePercentage}%</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">Last Maintenance</span>
                <span className="font-mono text-navy-900">{selectedEquipment.lastMaintenanceDate}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">Next Maintenance</span>
                <span className="font-mono text-navy-900">{selectedEquipment.nextScheduledMaintenance}</span>
              </div>
            </div>

            {selectedEquipment.assignedTechnicianName && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-navy-800">
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">
                  Assigned Technician
                </span>
                <span className="font-medium">{selectedEquipment.assignedTechnicianName}</span>
              </div>
            )}

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-2">
                Operational Status Update
              </span>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <select
                  value={selectedEquipment.status}
                  onChange={(event) => {
                    void handleStatusUpdate(
                      selectedEquipment.id,
                      event.target.value as MediTrackEquipment['status']
                    );
                  }}
                  className="flex-1 bg-white border border-neutral-200 rounded pl-2.5 pr-7 py-1.5 text-sm text-navy-800"
                >
                  <option value="Working">Working</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Down">Down</option>
                </select>
                <button
                  type="button"
                  onClick={() => openEditEquipment(selectedEquipment)}
                  className="px-3 py-1.5 rounded bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700"
                >
                  Edit Equipment
                </button>
              </div>
            </div>

            {selectedEquipment.activeTicketId && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-navy-800">
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">
                  Active Work Order
                </span>
                <span className="font-medium">{selectedEquipment.activeTicketId}</span>
              </div>
            )}

            {selectedEquipment.specifications && Object.keys(selectedEquipment.specifications).length > 0 && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">
                  Specifications
                </span>
                <div className="space-y-1">
                  {Object.entries(selectedEquipment.specifications).map(([key, value]) => (
                    <div className="flex justify-between" key={key}>
                      <span>{key}</span>
                      <span className="font-mono text-navy-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
      {isEquipmentFormOpen && (
        <Modal
          open={isEquipmentFormOpen}
          onClose={() => {
            if (isSavingEquipment) return;
            setIsEquipmentFormOpen(false);
            setEditingEquipment(null);
          }}
          title={editingEquipment ? 'Edit Medical Device Specs' : 'Register New Medical Equipment'}
          width="max-w-xl"
        >
          <form onSubmit={handleSaveEquipmentSubmit} className="space-y-4 text-xs">
            {equipmentFormError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 font-medium">
                {equipmentFormError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] font-semibold text-navy-600 uppercase tracking-wider">Equipment Common Name *</span>
                <input
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-navy-600 uppercase tracking-wider">Model Designation *</span>
                <input
                  value={equipmentForm.model}
                  onChange={(e) => setEquipmentForm((p) => ({ ...p, model: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] font-semibold text-navy-600 uppercase tracking-wider">Manufacturer / OEM *</span>
                <input
                  value={equipmentForm.manufacturer}
                  onChange={(e) => setEquipmentForm((p) => ({ ...p, manufacturer: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-navy-600 uppercase tracking-wider">Serial Number *</span>
                <input
                  value={equipmentForm.serialNumber}
                  onChange={(e) => setEquipmentForm((p) => ({ ...p, serialNumber: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] font-semibold text-navy-600 uppercase tracking-wider">Hospital Department *</span>
                <select
                  value={equipmentForm.department}
                  onChange={(e) => setEquipmentForm((p) => ({ ...p, department: e.target.value as import('../../types').Department }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-navy-600 uppercase tracking-wider">Room / Clinical Bay *</span>
                <input
                  value={equipmentForm.room}
                  onChange={(e) => setEquipmentForm((p) => ({ ...p, room: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] font-semibold text-navy-600 uppercase tracking-wider">Criticality</span>
                <select
                  value={equipmentForm.criticality}
                  onChange={(e) => setEquipmentForm((p) => ({ ...p, criticality: e.target.value as import('../../types').CriticalityLevel }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option>Life Support</option>
                  <option>Critical Diagnostic</option>
                  <option>Patient Monitoring</option>
                  <option>General Clinical</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-navy-600 uppercase tracking-wider">Clinical Status</span>
                <select
                  value={equipmentForm.status}
                  onChange={(e) => setEquipmentForm((p) => ({ ...p, status: e.target.value as MediTrackEquipment['status'] }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Working">Working</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Down">Down</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-[11px] font-semibold text-navy-600 uppercase tracking-wider">Install Date *</span>
              <input
                type="date"
                value={equipmentForm.installDate}
                onChange={(e) => setEquipmentForm((p) => ({ ...p, installDate: e.target.value }))}
                className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              />
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => {
                  if (isSavingEquipment) return;
                  setIsEquipmentFormOpen(false);
                  setEditingEquipment(null);
                }}
                className="px-3 py-1.5 rounded border border-neutral-200 text-xs font-medium text-navy-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEquipment}
                className="px-3 py-1.5 rounded bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 disabled:opacity-60"
              >
                {isSavingEquipment
                  ? 'Saving...'
                  : editingEquipment
                  ? 'Save Changes'
                  : 'Register Equipment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}