import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}

export function FilterDropdown({ label, value, options, onChange, className = '' }: FilterDropdownProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <label className="text-xs text-navy-500 font-medium whitespace-nowrap">{label}:</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            appearance-none bg-white border border-neutral-200 rounded
            pl-2.5 pr-7 py-1.5 text-sm text-navy-800
            focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500
            cursor-pointer
          "
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
      </div>
    </div>
  );
}
