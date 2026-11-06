/**
 * Emergency Presets Component
 * Per MediTrack UI Spec §6
 * Pill chips with specific sizing and selected state
 */

import { EmergencyType } from '../../types/public';
import React from 'react';
import { Car, Heart, Wind, Flame } from 'lucide-react';

interface EmergencyPresetsProps {
  presets: EmergencyType[];
  selectedId: string | null;
  onSelect: (presetId: string) => void;
}

const presetIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  car: Car,
  heart: Heart,
  lungs: Wind,
  flame: Flame,
};

export function EmergencyPresets({ presets, selectedId, onSelect }: EmergencyPresetsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-3" role="group" aria-label="Emergency type presets">
      {presets.map(preset => {
        const Icon = presetIcons[preset.icon] || Heart;
        const isSelected = selectedId === preset.id;

        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset.id)}
            className={`badge-preset ${isSelected ? 'badge-preset-active' : 'badge-preset-inactive'}`}
            aria-pressed={isSelected}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{preset.label}</span>
          </button>
        );
      })}
    </div>
  );
}