/**
 * Resource Status Grid Component
 * Per MediTrack UI Spec §11
 * 2-column grid, each row: status icon + resource name | status label
 */

import { HospitalResources } from '../../types/public';
import { ResourceStatus } from './ResourceStatus';

const resourceLabels: Record<keyof HospitalResources, string> = {
  emergencyDepartment: 'Emergency Dept',
  icu: 'ICU',
  ventilator: 'Ventilator',
  ctScan: 'CT Scan',
  blood: 'Blood',
};

const resourceKeys: (keyof HospitalResources)[] = ['emergencyDepartment', 'icu', 'ventilator', 'ctScan', 'blood'];

interface ResourceStatusGridProps {
  resources: HospitalResources;
  size?: 'sm' | 'md' | 'lg';
}

export function ResourceStatusGrid({ resources, size = 'sm' }: ResourceStatusGridProps) {
  if (!resources || Object.keys(resources).length === 0) {
    return (
      <div className="py-2 text-center text-[var(--text-meta)] text-[var(--color-text-muted)] italic">
        No resource data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-y-2 gap-x-6 pt-2" role="list" aria-label="Hospital resource availability">
      {resourceKeys.map(key => (
        <ResourceStatus
          key={key}
          label={resourceLabels[key]}
          status={resources[key]}
          size={size}
        />
      ))}
    </div>
  );
}