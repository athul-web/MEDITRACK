import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  onClick?: () => void;
}

export function MetricCard({ label, value, icon: Icon, iconColor = 'text-navy-400', subtitle, onClick }: MetricCardProps) {
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={`
        bg-white border border-neutral-200 rounded-md px-4 py-3
        flex items-start gap-3 text-left
        ${onClick ? 'cursor-pointer hover:border-navy-300 transition-colors' : ''}
      `}
    >
      {Icon && (
        <div className={`mt-0.5 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-navy-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl font-semibold text-navy-900 tabular-nums mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-navy-400 mt-0.5">{subtitle}</p>}
      </div>
    </Wrapper>
  );
}
