import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Search, MapPin, ShieldCheck, Phone, Zap } from 'lucide-react';
import { SearchConsole } from '../../../components/hero/SearchConsole';
import { EmergencyPresets } from '../../../components/hero/EmergencyPresets';
import { emergencyPresets } from '../../../data/mock/emergencyTypes';
import { HospitalSearchFilters } from '../../../types/public';
import { HospitalCard as HospitalCardUI } from '../../../components/hospitals/HospitalCard';

/**
 * Home Page implementation
 */
export function HomePage() {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState<HospitalSearchFilters>({
    requiredResources: [],
  });
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetClick = (presetId: string) => {
    const preset = emergencyPresets.find(p => p.id === presetId);
    if (!preset) return;

    if (selectedPreset === presetId) {
      setSelectedPreset(null);
      setSearchFilters(prev => ({ ...prev, requiredResources: [] }));
    } else {
      setSelectedPreset(presetId);
      setSearchFilters(prev => ({ ...prev, requiredResources: preset.resources }));
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchFilters.emergencyType) {
      params.append('emergencyType', searchFilters.emergencyType);
    }
    if (searchFilters.requiredResources.length > 0) {
      params.append('resources', searchFilters.requiredResources.join(','));
    }
    if (searchFilters.location?.label) {
      params.append('location', searchFilters.location.label);
    }

    navigate(`/hospitals?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <div className="relative bg-gradient-to-r from-cyan-900 via-sky-800 to-slate-900 text-white overflow-hidden pb-16">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1600')" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Find Nearby Hospitals. <br />
                <span className="text-cyan-300">Get Real-Time Resource Availability.</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                MediTrack helps you quickly locate hospitals with verified emergency resources like ICU, ventilators, CT scans and more — when every second counts.
              </p>
            </div>

            <div className="hidden lg:block -rotate-3 text-right">
              <p className="font-serif italic text-2xl text-cyan-200/90 leading-tight">
                Right hospital.<br />
                Right resources.<br />
                <span className="underline decoration-cyan-400">Faster care.</span>
              </p>
            </div>
          </div>

          {/* Search Box Card */}
          <div className="mt-10 bg-white rounded-2xl p-3 sm:p-4 shadow-2xl text-slate-800 border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-12">
                <SearchConsole
                  filters={searchFilters}
                  onChange={setSearchFilters}
                />
              </div>
              <div className="md:col-span-12 flex justify-end mt-1">
                <button
                  onClick={handleSearch}
                  className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tag Pills */}
          <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
            <EmergencyPresets
              presets={emergencyPresets}
              selectedId={selectedPreset}
              onSelect={handlePresetClick}
            />
          </div>
        </div>
      </div>

      {/* 2. Feature Highlights Grid */}
      <section className="bg-slate-100/70 border-b border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureItem icon={Zap} title="Real-Time Availability" description="See live resource status with freshness timestamps." />
            <FeatureItem icon={MapPin} title="Nearby Hospitals" description="Find the closest verified hospitals in your area." />
            <FeatureItem icon={ShieldCheck} title="Verified & Reliable" description="Only trusted hospitals with real-time data." />
            <FeatureItem icon={Phone} title="Direct Contact" description="Get call details and directions instantly." />
          </div>
        </div>
      </section>

      {/* 3. Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Hospital Cards Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-600" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Nearby Hospitals</h2>
                  <p className="text-xs text-slate-500">Showing hospitals near your location with available resources</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Sort by:</span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700">
                  <span>Nearest</span>
                  <span className="text-slate-400">⚙️</span>
                </div>
              </div>
            </div>

            {/* Card 1 */}
            <HospitalCardUI
              name="City General Hospital"
              distance="2.8 km away"
              address="MG Road, Kochi, Kerala"
              updated="2 mins ago"
              image="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400"
              resources={[
                { name: 'Emergency Dept', available: true },
                { name: 'ICU', available: true },
                { name: 'Ventilator', available: true },
                { name: 'Doctor', available: true },
                { name: 'CT Scan', available: true },
              ]}
            />

            {/* Card 2 */}
            <HospitalCardUI
              name="Metro Medical Center"
              distance="4.1 km away"
              address="NH Bypass, Kochi, Kerala"
              updated="12 mins ago"
              image="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400"
              resources={[
                { name: 'Emergency Dept', available: true },
                { name: 'ICU', available: true },
                { name: 'CT Scan', available: true },
                { name: 'Doctor', available: true },
                { name: 'Ventilator', available: false },
              ]}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-sky-100 to-cyan-50 border border-sky-200 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="bg-cyan-600 text-white p-3 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  24/7 Hotline
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-4">Emergency?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Need immediate help? Call 108 or visit the nearest emergency department directly.
              </p>
              <button className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <span>Emergency Contacts</span>
                <span className="text-xs">→</</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">For Hospitals</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-[180px]">
                  Access your dashboard, manage resources and connect IoT devices.
                </p>
                <a href="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800 mt-3">
                  <span>Staff Login</span>
                  <span className="text-xs">→</</span>
                </a>
              </div>
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200" alt="Staff" className="w-20 h-20 rounded-xl object-cover shrink-0" />
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5">
              <span className="text-4xl text-cyan-600 font-serif font-bold leading-none">“</span>
              <p className="text-xs text-slate-600 italic -mt-2 leading-relaxed">
                Better information. <br />
                Better decisions. <br />
                <span className="font-bold text-slate-800">More lives saved.</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-cyan-500/10 text-cyan-700 p-3 rounded-xl shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
