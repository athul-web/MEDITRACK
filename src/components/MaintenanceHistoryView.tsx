import React, { useState } from 'react';
import { MaintenanceRecord, Equipment } from '../types';
import { Download, FileText, Filter, Calendar, Wrench, DollarSign, Clock, Search } from 'lucide-react';

interface MaintenanceHistoryViewProps {
  records: MaintenanceRecord[];
  equipmentList: Equipment[];
  onSelectEquipmentById: (id: string) => void;
}

export const MaintenanceHistoryView: React.FC<MaintenanceHistoryViewProps> = ({
  records,
  equipmentList,
  onSelectEquipmentById,
}) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = records.filter(rec => {
    if (selectedType !== 'All' && rec.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (rec.id ?? '').toLowerCase().includes(q) ||
        (rec.equipmentName ?? '').toLowerCase().includes(q) ||
        (rec.equipmentId ?? '').toLowerCase().includes(q) ||
        (rec.technicianName ?? '').toLowerCase().includes(q) ||
        (rec.description ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalDowntime = filteredRecords.reduce((acc, r) => acc + (r.downtimeHours || 0), 0);
  const totalCost = filteredRecords.reduce((acc, r) => acc + (r.cost || 0), 0);

  const handleExportCSV = () => {
    const headers = [
      'Log ID',
      'Equipment ID',
      'Equipment Name',
      'Date',
      'Resolved Date',
      'Type',
      'Technician',
      'Downtime Hours',
      'Cost ($)',
      'Parts Replaced',
      'Description',
      'Notes',
    ];

    const rows = filteredRecords.map(r => [
      `"${(r.id || '').replace(/"/g, '""')}"`,
      `"${(r.equipmentId || '').replace(/"/g, '""')}"`,
      `"${(r.equipmentName || '').replace(/"/g, '""')}"`,
      `"${(r.date || '').replace(/"/g, '""')}"`,
      `"${(r.resolvedDate || '').replace(/"/g, '""')}"`,
      `"${(r.type || '').replace(/"/g, '""')}"`,
      `"${(r.technicianName || '').replace(/"/g, '""')}"`,
      r.downtimeHours ?? 0,
      r.cost ?? 0,
      `"${(r.partsReplaced || []).join('; ').replace(/"/g, '""')}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hospital_Maintenance_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Service Events</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{filteredRecords.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Maintenance work orders</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logged Downtime</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalDowntime.toFixed(1)} hrs</p>
          <p className="text-[11px] text-slate-400 mt-1">Mean repair turnaround verified</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Parts & Servicing Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">${totalCost.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">Budget recorded this period</p>
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search maintenance logs by device, ID, tech, or part..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            <option value="All">All Service Types</option>
            <option value="Corrective Repair">Corrective Repair</option>
            <option value="Preventive Maintenance">Preventive Maintenance</option>
            <option value="Calibration">Calibration</option>
            <option value="Inspection">Inspection</option>
          </select>

          <button
            id="export-maintenance-csv-btn"
            onClick={handleExportCSV}
            className="text-xs px-3.5 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            title="Download CSV report of filtered maintenance records"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Maintenance Records Table/Cards */}
      <div className="space-y-3">
        {filteredRecords.map(record => (
          <div
            key={record.id}
            className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {record.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  record.type === 'Corrective Repair' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  record.type === 'Preventive Maintenance' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  record.type === 'Calibration' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                  'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {record.type}
                </span>
                <button
                  onClick={() => onSelectEquipmentById(record.equipmentId)}
                  className="font-semibold text-sm text-slate-900 hover:text-blue-600 cursor-pointer"
                >
                  {record.equipmentName}
                </button>
                <span className="font-mono text-xs text-slate-400">({record.equipmentId})</span>
              </div>

              <span className="text-xs text-slate-500">
                Completed: <strong>{record.resolvedDate}</strong>
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
              {record.description}
            </p>

            {record.partsReplaced && record.partsReplaced.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                <span className="font-medium text-slate-500">Parts Replaced:</span>
                {record.partsReplaced.map((part, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                    {part}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-4">
                <span>Technician: <strong className="text-slate-800">{record.technicianName}</strong></span>
                <span>Downtime: <strong className="text-slate-800">{record.downtimeHours} hrs</strong></span>
                {record.cost ? (
                  <span>Cost: <strong className="text-slate-800">${record.cost}</strong></span>
                ) : null}
              </div>

              <button
                onClick={() => onSelectEquipmentById(record.equipmentId)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View Equipment Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
