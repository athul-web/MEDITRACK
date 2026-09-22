/**
 * Resource Status Component
 * Per MediTrack UI Spec §11
 * Each row: [status icon 14px] Resource name (13px) | Status label (13px, weight 600, status color)
 * Layout: flex, items-center, justify-content: space-between
 */

import type { ResourceStatus as ResourceStatusType } from '../../types/public';
import { CheckCircle, XCircle, AlertTriangle, Circle } from 'lucide-react';

// Unknown status icon - filled circle with question mark (not outline HelpCircle)
function UnknownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 9v4M12 17h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

interface ResourceStatusProps {
  label: string;
  status: ResourceStatusType;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  available: {
    icon: CheckCircle,
    color: 'text-[var(--color-available)]',
    label: 'Available',
  },
  unavailable: {
    icon: XCircle,
    color: 'text-[var(--color-unavailable)]',
    label: 'Unavailable',
  },
  unknown: {
    icon: UnknownIcon,
    color: 'text-[var(--color-unknown)]',
    label: 'Unknown',
  },
  stale: {
    icon: AlertTriangle,
    color: 'text-[var(--color-stale-text)]',
    label: 'Data may be outdated',
  },
};

const sizeClasses = {
  sm: { icon: 'w-3.5 h-3.5', name: 'text-[13px]', label: 'text-[13px]' },
  md: { icon: 'w-4 h-4', name: 'text-sm', label: 'text-sm' },
  lg: { icon: 'w-5 h-5', name: 'text-base', label: 'text-base' },
};

export function ResourceStatus({ label, status, size = 'sm' }: ResourceStatusProps) {
  const config = statusConfig[status];
  const sizes = sizeClasses[size];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between gap-2 py-1" role="listitem">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className={`${sizes.icon} ${config.color} flex-shrink-0`} aria-hidden="true" />
        <span className={`${sizes.name} text-[var(--color-text-secondary)] truncate`}>{label}</span>
      </div>
      <span className={`${sizes.label} font-semibold ${config.color} whitespace-nowrap flex-shrink-0`}>
        {config.label}
      </span>
    </div>
  );
}