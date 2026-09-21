import React, { useState } from 'react';
import { Equipment } from '../types';
import { EquipmentStatusBadge, CriticalityBadge } from './StatusBadge';
import { Eye, AlertTriangle, ArrowUpDown, MapPin, Wrench } from 'lucide-react';

interface EquipmentTableProps {
  equipment: Equipment[];
  onSelect: (equipment: Equipment) => void;
  onReportProblem: (equipment: Equipment) => void;
  onQuickStatusChange?: (equipment: Equipment, status: Equipment['status']) => void;
}

export const EquipmentTable: React.FC<EquipmentTableProps> = ({
  equipment,
  onSelect,
  onReportProblem,
}) => {
  const [sortField, setSortField] = useState<keyof Equipment>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: keyof Equipment) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedEquipment = [...equipment].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA === undefined || valB === undefined) return 0;
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
          <tr>
            <th 
              className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
              onClick={() => handleSort('id')}
            >
              <div className="flex items-center gap-1">
                <span>Equipment</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th 
              className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none hidden md:table-cell"
              onClick={() => handleSort('department')}
            >
              <div className="flex items-center gap-1">
                <span>Department / Location</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th 
              className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-1">
                <span>Status</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3 px-4 hidden lg:table-cell">Criticality</th>
            <th className="py-3 px-4 hidden sm:table-cell">Assigned Technician</th>
            <th 
              className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none hidden xl:table-cell"
              onClick={() => handleSort('uptimePercentage')}
            >
              <div className="flex items-center gap-1">
                <span>Uptime</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedEquipment.map(item => (
            <tr 
              key={item.id}
              className="hover:bg-slate-50/75 transition-colors group"
            >
              {/* Name & ID */}
              <td className="py-3.5 px-4">
                <div className="flex flex-col">
                  <span 
                    onClick={() => onSelect(item)}
                    className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer"
                  >
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[11px] text-slate-400">{item.id}</span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">• {item.model}</span>
                  </div>
                </div>
              </td>

              {/* Department & Location */}
              <td className="py-3.5 px-4 hidden md:table-cell">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800">{item.department}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {item.room}
                  </span>
                </div>
              </td>

              {/* Status */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <EquipmentStatusBadge status={item.status} size="sm" />
              </td>

              {/* Criticality */}
              <td className="py-3.5 px-4 hidden lg:table-cell whitespace-nowrap">
                <CriticalityBadge level={item.criticality} />
              </td>

              {/* Assigned Tech */}
              <td className="py-3.5 px-4 hidden sm:table-cell">
                {item.assignedTechnicianName ? (
                  <span className="font-medium text-slate-800 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {item.assignedTechnicianName}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic">None assigned</span>
                )}
              </td>

              {/* Uptime % */}
              <td className="py-3.5 px-4 hidden xl:table-cell whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-700">{item.uptimePercentage}%</span>
                  <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full ${
                        item.uptimePercentage >= 98 ? 'bg-emerald-500' :
                        item.uptimePercentage >= 95 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.uptimePercentage}%` }}
                    />
                  </div>
                </div>
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onSelect(item)}
                    className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-600 transition-colors"
                    title="View details and maintenance history"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onReportProblem(item)}
                    className="p-1.5 rounded-md hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Report breakdown or problem"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
