import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export function StaffPanel() {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-[22px] border border-[#D9E6EE] p-5 sm:p-6 relative overflow-hidden card-lift"
      style={{
        boxShadow: '0 2px 14px rgba(18,43,67,0.04)',
      }}
    >
      {/* Decorative medical cross outline in background */}
      <div className="absolute right-3 bottom-3 opacity-15 pointer-events-none">
        <svg viewBox="0 0 60 60" width="60" height="60" fill="none">
          <rect x="23" y="5" width="14" height="50" rx="4" fill="#087D91" />
          <rect x="5" y="23" width="50" height="14" rx="4" fill="#087D91" />
        </svg>
      </div>

      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#122B43] mb-1">
            For Hospitals
          </h3>
          <p className="text-xs text-[#60778C] leading-relaxed max-w-[200px]">
            Access your dashboard, manage resources and connect IoT devices.
          </p>
        </div>

        {/* Doctor photos avatar cluster */}
        <div className="flex -space-x-3 shrink-0">
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=faces"
            alt="Doctor"
            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs z-10"
          />
          <img
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=faces"
            alt="Healthcare Specialist"
            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
          />
        </div>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-[#073B55] bg-[#E4F6FA] border border-[#BDEFF5] hover:bg-[#073B55] hover:text-white transition-all cursor-pointer shadow-xs"
      >
        <LogIn size={14} />
        <span>Staff Login →</span>
      </button>
    </div>
  );
}
