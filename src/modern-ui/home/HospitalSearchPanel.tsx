import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Navigation,
  ChevronDown,
  SlidersHorizontal,
  Wind,
  Droplets,
  Building2,
  Plus,
} from 'lucide-react';
import type { QuickAccessTag } from '../types/hospital';

interface HospitalSearchPanelProps {
  onSearch: (query: string, tag: QuickAccessTag | null) => void;
}

const LOCATIONS = [
  'Ernakulam, Kerala',
  'Thiruvananthapuram, Kerala',
  'Kozhikode, Kerala',
  'Thrissur, Kerala',
  'Kottayam, Kerala',
];

const QUICK_TAGS: { label: QuickAccessTag; icon: React.ReactNode }[] = [
  {
    label: 'ICU',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Ventilator',
    icon: <Wind size={13} />,
  },
  {
    label: 'Oxygen',
    icon: <Droplets size={13} />,
  },
  {
    label: '24/7 Trauma',
    icon: <Plus size={13} />,
  },
  {
    label: 'Burn Unit',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
];

export function HospitalSearchPanel({ onSearch }: HospitalSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<QuickAccessTag>('ICU');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleFindMe = () => {
    setLocating(true);
    setTimeout(() => {
      setLocation('Current Location');
      setLocating(false);
    }, 1500);
  };

  const handleSearch = () => {
    onSearch(query, activeTag);
  };

  const handleTagClick = (tag: QuickAccessTag) => {
    setActiveTag(tag);
    onSearch(query, tag);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div
      className="w-full max-w-3xl rounded-[28px] p-5 flex flex-col gap-4"
      style={{
        background: 'rgba(190,234,242,0.18)',
        border: '1px solid rgba(255,255,255,0.35)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Top row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search input */}
        <div className="flex items-center gap-2 flex-1 rounded-full px-4 py-2.5 search-input-wrapper">
          <Search size={16} style={{ color: '#60778C' }} className="shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search hospital name, address, or resource…"
            className="flex-1 outline-none text-sm bg-transparent placeholder:text-gray-400"
            style={{ color: '#122B43' }}
          />
        </div>

        {/* Location selector */}
        <div className="relative">
          <button
            onClick={() => setLocationOpen(!locationOpen)}
            className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap cursor-pointer location-selector-btn"
          >
            <MapPin size={14} className="loc-icon shrink-0" />
            <span className="max-w-[140px] truncate">{location}</span>
            <ChevronDown size={14} style={{ color: '#60778C' }} className="shrink-0" />
          </button>
          {locationOpen && (
            <div
              className="absolute top-full mt-1 left-0 z-50 bg-white rounded-2xl shadow-xl overflow-hidden min-w-[200px]"
              style={{ border: '1px solid #D9E6EE' }}
            >
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocation(loc);
                    setLocationOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer"
                  style={{
                    color: location === loc ? '#063B56' : '#122B43',
                    background: location === loc ? '#E4F6FA' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (location !== loc) (e.currentTarget as HTMLButtonElement).style.background = '#F3F8FC';
                  }}
                  onMouseLeave={(e) => {
                    if (location !== loc) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Find Me button */}
        <button
          onClick={handleFindMe}
          disabled={locating}
          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white shrink-0 cursor-pointer search-action-btn find-me-btn"
          style={{ opacity: locating ? 0.7 : 1 }}
          title="Detect my location"
        >
          {locating ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          ) : (
            <Navigation size={14} className="btn-icon" />
          )}
          {locating ? 'Locating…' : 'Find Me'}
        </button>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shrink-0 cursor-pointer search-action-btn search-submit-btn"
        >
          <Search size={14} className="btn-icon" />
          Search
        </button>
      </div>

      {/* Quick access row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 shrink-0">
          <SlidersHorizontal size={13} style={{ color: 'rgba(255,255,255,0.75)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Quick Access
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {QUICK_TAGS.map(({ label, icon }) => {
            const isSelected = activeTag === label;
            return (
              <button
                key={label}
                onClick={() => handleTagClick(label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer quick-filter-chip ${
                  isSelected ? 'quick-filter-chip-active' : 'quick-filter-chip-inactive'
                }`}
                style={
                  isSelected
                    ? { background: '#063B56', color: 'white', border: '1px solid #063B56' }
                    : {
                        background: 'rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.9)',
                        border: '1px solid rgba(255,255,255,0.3)',
                      }
                }
              >
                {icon}
                {label}
              </button>
            );
          })}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer quick-filter-chip quick-filter-chip-inactive"
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Building2 size={13} />
            More Resources
          </button>
        </div>
      </div>
    </div>
  );
}
