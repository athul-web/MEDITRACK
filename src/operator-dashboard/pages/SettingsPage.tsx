import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Shield, AlertTriangle } from 'lucide-react';
import { mapDbToFrontend, mapFrontendToDb, supabase, getCurrentUserHospitalId } from '../../lib/supabase';
import { FacilitySettings } from '../../types';
import { EmptyState } from '../components/ui/EmptyState';

const EMPTY_SETTINGS: FacilitySettings = {
  hospitalName: '',
  facilityCode: '',
  slaCriticalHours: 0,
  slaHighHours: 0,
  primaryContactPhone: '',
  maintenanceEmail: '',
};

export function Settings() {
  const [settings, setSettings] = useState<FacilitySettings>(EMPTY_SETTINGS);
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadSettings() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const currentHospitalId = await getCurrentUserHospitalId();
        if (!isActive) return;
        setHospitalId(currentHospitalId);

        const { data, error } = await supabase
          .from('facility_settings')
          .select('*')
          .eq('hospital_id', currentHospitalId);

        if (error) throw error;

        const rows = (data ?? []) as { id: number | null }[];
        if (rows.length > 1) {
          if (isActive) {
            setSettings(EMPTY_SETTINGS);
            setSettingsId(null);
            setLoadError(
              'Multiple facility_settings rows exist for this hospital. The system cannot safely choose one. Resolve this with a one-row-per-hospital schema migration before editing settings.'
            );
          }
          return;
        }

        if (rows.length === 1 && isActive) {
          setSettingsId(rows[0].id ?? null);
          setSettings(mapDbToFrontend<FacilitySettings>(rows[0]));
        } else if (isActive) {
          setSettings(EMPTY_SETTINGS);
          setSettingsId(null);
        }
      } catch (err: any) {
        if (isActive) {
          setLoadError(err?.message || 'Unable to load facility settings.');
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadSettings();
    return () => {
      isActive = false;
    };
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);
    setSaveError(null);
    setSuccessMessage(null);

    if (!hospitalId) {
      setValidationError('Your account is not associated with a hospital.');
      return;
    }

    if (settings.slaCriticalHours < 0 || settings.slaHighHours < 0) {
      setValidationError('SLA hour targets cannot be negative.');
      return;
    }

    if (settingsId === null) {
      setValidationError(
        'No single facility-settings record exists for this hospital. Creating one safely requires a uniqueness constraint and a generated ID mechanism; no unsafe ID generation was performed.'
      );
      return;
    }

    setIsSaving(true);

    try {
      const writePayload = {
        ...mapFrontendToDb(settings),
        id: settingsId,
        hospital_id: hospitalId,
      };

      const { data, error } = await supabase
        .from('facility_settings')
        .upsert(writePayload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSettingsId(data.id ?? settingsId);
        setSettings(mapDbToFrontend<FacilitySettings>(data));
        setSuccessMessage('Facility settings saved.');
      } else {
        setSuccessMessage('Facility settings saved.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Unable to save facility settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-navy-500 text-sm">Loading settings…</div>;
  }

  if (loadError) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">{loadError}</div>;
  }

  if (!settingsId && (!hospitalId || !hospitalId)) {
    return <EmptyState title="Settings unavailable" description="This account is not associated with a hospital." />;
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="border-b border-neutral-200 pb-3">
        <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Facility Settings</h1>
        <p className="text-xs text-navy-500 mt-0.5">
          Hospital name, facility code, contact information, and alert SLA targets stored in MediTrack.
        </p>
      </div>

      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Prototype Settings Not Available</span>
        </div>
        <p className="text-amber-800 leading-relaxed text-[11px]">
          The original settings page controlled telemetry simulation, alert stores, and maintenance-store resets. Those
          features do not exist in MediTrack and are not shown here. The form below edits only the database-backed
          facility-settings record for the signed-in user's hospital.
        </p>
      </div>

      <div className="p-3 border border-neutral-200 rounded-md bg-white text-xs text-navy-600">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>
            Facility-settings update permission depends on the current Supabase RLS policies. If the signed-in role cannot
            update this record, save will fail and the error will be shown here.
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-neutral-200 rounded-md p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
          <SettingsIcon className="w-5 h-5 text-navy-500" />
          <h2 className="text-sm font-semibold text-navy-900">Facility Information</h2>
        </div>

        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">{validationError}</div>
        )}
        {saveError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">{saveError}</div>
        )}
        {successMessage && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded text-xs text-teal-700">{successMessage}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <label className="block space-y-1">
            <span className="font-medium text-navy-700">Hospital Name</span>
            <input
              value={settings.hospitalName}
              onChange={(event) => setSettings((previous) => ({ ...previous, hospitalName: event.target.value }))}
              className="w-full bg-white border border-neutral-200 rounded p-2 text-xs focus:ring-1 focus:ring-teal-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="font-medium text-navy-700">Facility Code</span>
            <input
              value={settings.facilityCode}
              onChange={(event) => setSettings((previous) => ({ ...previous, facilityCode: event.target.value }))}
              className="w-full bg-white border border-neutral-200 rounded p-2 text-xs focus:ring-1 focus:ring-teal-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="font-medium text-navy-700">Critical SLA Hours</span>
            <input
              type="number"
              min={0}
              value={settings.slaCriticalHours}
              onChange={(event) =>
                setSettings((previous) => ({ ...previous, slaCriticalHours: Number(event.target.value) || 0 }))
              }
              className="w-full bg-white border border-neutral-200 rounded p-2 text-xs focus:ring-1 focus:ring-teal-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="font-medium text-navy-700">High SLA Hours</span>
            <input
              type="number"
              min={0}
              value={settings.slaHighHours}
              onChange={(event) =>
                setSettings((previous) => ({ ...previous, slaHighHours: Number(event.target.value) || 0 }))
              }
              className="w-full bg-white border border-neutral-200 rounded p-2 text-xs focus:ring-1 focus:ring-teal-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="font-medium text-navy-700">Primary Contact Phone</span>
            <input
              value={settings.primaryContactPhone}
              onChange={(event) => setSettings((previous) => ({ ...previous, primaryContactPhone: event.target.value }))}
              className="w-full bg-white border border-neutral-200 rounded p-2 text-xs focus:ring-1 focus:ring-teal-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="font-medium text-navy-700">Maintenance Email</span>
            <input
              type="email"
              value={settings.maintenanceEmail}
              onChange={(event) => setSettings((previous) => ({ ...previous, maintenanceEmail: event.target.value }))}
              className="w-full bg-white border border-neutral-200 rounded p-2 text-xs focus:ring-1 focus:ring-teal-500"
            />
          </label>
        </div>

        <div className="flex justify-end pt-3 border-t border-neutral-200">
          <button
            type="submit"
            disabled={isSaving || settingsId === null}
            className="px-3 py-1.5 bg-navy-900 text-white rounded hover:bg-navy-800 text-xs font-medium disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
