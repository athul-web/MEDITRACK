import React, { useState, useEffect } from 'react';
import { Equipment, Department, CriticalityLevel, EquipmentStatus } from '../types';
import { PlusCircle, X, Check, Activity } from 'lucide-react';

interface AddEditEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentToEdit?: Equipment | null;
  onSaveEquipment: (equipment: Equipment) => void;
}

const DEPARTMENTS: Department[] = [
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

const sixMonthsFromToday = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 6);
  return date.toISOString().slice(0, 10);
};

export const AddEditEquipmentModal: React.FC<AddEditEquipmentModalProps> = ({
  isOpen,
  onClose,
  equipmentToEdit,
  onSaveEquipment,
}) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [department, setDepartment] = useState<Department>(DEPARTMENTS[0]);
  const [room, setRoom] = useState('');
  const [criticality, setCriticality] = useState<CriticalityLevel>('Critical Diagnostic');
  const [status, setStatus] = useState<EquipmentStatus>('Working');
  const [installDate, setInstallDate] = useState('2024-01-15');
  const [error, setError] = useState('');

  useEffect(() => {
    if (equipmentToEdit) {
      setName(equipmentToEdit.name);
      setModel(equipmentToEdit.model);
      setManufacturer(equipmentToEdit.manufacturer);
      setSerialNumber(equipmentToEdit.serialNumber);
      setDepartment(equipmentToEdit.department);
      setRoom(equipmentToEdit.room);
      setCriticality(equipmentToEdit.criticality);
      setStatus(equipmentToEdit.status);
      setInstallDate(equipmentToEdit.installDate);
    } else {
      setName('');
      setModel('');
      setManufacturer('');
      setSerialNumber(`SN-${Math.floor(10000 + Math.random() * 90000)}`);
      setDepartment(DEPARTMENTS[0]);
      setRoom('');
      setCriticality('Critical Diagnostic');
      setStatus('Working');
      setInstallDate(new Date().toISOString().slice(0, 10));
    }
  }, [equipmentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !model.trim() || !manufacturer.trim() || !serialNumber.trim() || !room.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    const newEquipment: Equipment = {
      id: equipmentToEdit ? equipmentToEdit.id : `EQ-${department.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      model: model.trim(),
      manufacturer: manufacturer.trim(),
      serialNumber: serialNumber.trim(),
      department,
      room: room.trim(),
      criticality,
      status,
      installDate,
      lastMaintenanceDate: equipmentToEdit ? equipmentToEdit.lastMaintenanceDate : installDate,
      nextScheduledMaintenance: equipmentToEdit ? equipmentToEdit.nextScheduledMaintenance : sixMonthsFromToday(),
      uptimePercentage: equipmentToEdit ? equipmentToEdit.uptimePercentage : 100,
      totalDowntimeHours: equipmentToEdit ? equipmentToEdit.totalDowntimeHours : 0,
      assignedTechnicianId: equipmentToEdit?.assignedTechnicianId,
      assignedTechnicianName: equipmentToEdit?.assignedTechnicianName,
      specifications: equipmentToEdit?.specifications || {},
    };

    onSaveEquipment(newEquipment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">
              {equipmentToEdit ? 'Edit Medical Device Specs' : 'Register New Medical Equipment'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Equipment Common Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. ICU Mechanical Ventilator"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Model Designation *
              </label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. Hamilton-G5"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Manufacturer / OEM *
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={e => setManufacturer(e.target.value)}
                placeholder="e.g. GE HealthCare, Philips"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Serial Number (S/N) *
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Hospital Department *
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as Department)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900 focus:ring-1 focus:ring-blue-500"
              >
                {DEPARTMENTS.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Room / Clinical Bay *
              </label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. Suite 2B, Trauma Bay 1"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Clinical Criticality Tier *
              </label>
              <select
                value={criticality}
                onChange={e => setCriticality(e.target.value as CriticalityLevel)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Life Support">Life Support (Tier 1)</option>
                <option value="Critical Diagnostic">Critical Diagnostic (Tier 2)</option>
                <option value="Patient Monitoring">Patient Monitoring (Tier 3)</option>
                <option value="General Clinical">General Clinical (Tier 4)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as EquipmentStatus)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Working">Working (Operational)</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Down">Down / Offline</option>
                <option value="Needs Attention">Needs Attention</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              id="save-equipment-btn"
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              {equipmentToEdit ? 'Save Changes' : 'Register Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
