import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-teal-50 text-teal-700 border-teal-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ variant, children, dot = false, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium
        ${variantStyles[variant]} ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-teal-500'
              : variant === 'warning'
              ? 'bg-amber-500'
              : variant === 'error'
              ? 'bg-red-500'
              : variant === 'info'
              ? 'bg-blue-500'
              : 'bg-neutral-400'
          }`}
        />
      )}
      {children}
    </span>
  );
}

// Helpers for common status mappings
export function connectivityBadge(status: string) {
  switch (status) {
    case 'online':
      return <StatusBadge variant="success" dot>Online</StatusBadge>;
    case 'offline':
      return <StatusBadge variant="error" dot>Offline</StatusBadge>;
    case 'intermittent':
      return <StatusBadge variant="warning" dot>Intermittent</StatusBadge>;
    default:
      return <StatusBadge variant="neutral">{status}</StatusBadge>;
  }
}

export function operationalBadge(status: string) {
  switch (status) {
    case 'normal':
      return <StatusBadge variant="success">Normal</StatusBadge>;
    case 'warning':
      return <StatusBadge variant="warning">Warning</StatusBadge>;
    case 'critical':
      return <StatusBadge variant="error">Critical</StatusBadge>;
    case 'maintenance':
      return <StatusBadge variant="purple">Maintenance</StatusBadge>;
    case 'decommissioned':
      return <StatusBadge variant="neutral">Decommissioned</StatusBadge>;
    default:
      return <StatusBadge variant="neutral">{status}</StatusBadge>;
  }
}

export function maintenanceFlagBadge(flag: string) {
  switch (flag) {
    case 'up-to-date':
      return <StatusBadge variant="success">Up to date</StatusBadge>;
    case 'due-soon':
      return <StatusBadge variant="warning">Due soon</StatusBadge>;
    case 'overdue':
      return <StatusBadge variant="error">Overdue</StatusBadge>;
    case 'in-progress':
      return <StatusBadge variant="info">In progress</StatusBadge>;
    default:
      return <StatusBadge variant="neutral">{flag}</StatusBadge>;
  }
}

export function severityBadge(severity: string) {
  switch (severity) {
    case 'info':
      return <StatusBadge variant="info">Info</StatusBadge>;
    case 'warning':
      return <StatusBadge variant="warning">Warning</StatusBadge>;
    case 'critical':
      return <StatusBadge variant="error">Critical</StatusBadge>;
    default:
      return <StatusBadge variant="neutral">{severity}</StatusBadge>;
  }
}

export function alertStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <StatusBadge variant="error" dot>Active</StatusBadge>;
    case 'acknowledged':
      return <StatusBadge variant="warning">Acknowledged</StatusBadge>;
    case 'resolved':
      return <StatusBadge variant="success">Resolved</StatusBadge>;
    default:
      return <StatusBadge variant="neutral">{status}</StatusBadge>;
  }
}
