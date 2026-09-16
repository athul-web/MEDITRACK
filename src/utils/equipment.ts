import { Equipment } from '../types';

/**
 * Calculates the total operational uptime in hours since the equipment was installed.
 * Formula: (Current Time - Installation Date) - Total Downtime Hours
 */
export const calculateUptimeHours = (equipment: Equipment): number => {
  const installed = new Date(equipment.installDate);
  const now = new Date();

  if (isNaN(installed.getTime())) {
    return 0;
  }

  const totalHoursSinceInstall = (now.getTime() - installed.getTime()) / (1000 * 60 * 60);
  const uptimeHours = totalHoursSinceInstall - equipment.totalDowntimeHours;

  return Math.max(0, Math.floor(uptimeHours));
};
