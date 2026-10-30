import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <Inbox className="w-10 h-10 text-neutral-300 mb-3" />
      <p className="text-sm font-medium text-navy-600">{title}</p>
      {description && <p className="text-xs text-navy-400 mt-1 max-w-xs">{description}</p>}
    </div>
  );
}
