import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import type { Hospital } from '../../types/public';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface ChatBotProps {
  hospitals: Hospital[];
}

// Maps a free-text symptom/emergency description to the hospital resources
// that matter most. Anything not matched falls back to "nearest overall".
function inferResources(query: string): (keyof Hospital['resources'])[] {
  const q = query.toLowerCase();
  const resources = new Set<keyof Hospital['resources']>();

  if (/(heart|cardiac|chest pain|stroke|brain)/.test(q)) {
    resources.add('icu');
    resources.add('emergencyDepartment');
  }
  if (/(burn|fire|acid)/.test(q)) {
    resources.add('emergencyDepartment');
  }
  if (/(breath|asthma|lung|covid|oxygen|respiratory)/.test(q)) {
    resources.add('ventilator');
    resources.add("ventilator");
  }
  if (/(accident|trauma|crash|injury|bleed)/.test(q)) {
    resources.add('emergencyDepartment');
  }
  if (/(icu|intensive)/.test(q)) resources.add('icu');
  if (/(ct|scan|radiology)/.test(q)) resources.add('ctScan');
  if (/(blood|transfusion)/.test(q)) resources.add('blood');

  return Array.from(resources);
}

function findBestHospital(hospitals: Hospital[], query: string): Hospital | null {
  const needed = inferResources(query);
  const candidates = hospitals.filter((h) => {
    if (needed.length === 0) return true;
    const r = h.resources ?? {};
    return needed.every((resource) => r[resource] === 'available');
  });

  const pool = candidates.length > 0 ? candidates : hospitals;
  const sorted = [...pool].sort((a, b) => {
    const da = typeof a.distanceKm === 'number' ? a.distanceKm : Number.POSITIVE_INFINITY;
    const db = typeof b.distanceKm === 'number' ? b.distanceKm : Number.POSITIVE_INFINITY;
    return da - db;
  });

  return sorted[0] ?? null;
}

export function ChatBot({ hospitals }: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        'Hi! Tell me the emergency or symptom (for example "chest pain", "burns", "breathing trouble") and I will suggest the nearest suitable hospital.',
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const hospital = findBestHospital(hospitals, trimmed);
    let reply: string;

    if (!hospital) {
      reply = 'I could not find a hospital right now. Please call emergency services immediately.';
    } else {
      const distance =
        typeof hospital.distanceKm === 'number'
          ? `${hospital.distanceKm.toFixed(1)} km away`
          : 'distance unavailable';
      reply = `Nearest suitable hospital: ${hospital.name} (${distance}). Address: ${hospital.address}. Contact: ${
        hospital.contact?.emergencyPhone || hospital.contact?.phone || hospital.phone1 || 'check details'
      }.`;
    }

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', text: reply },
      ]);
    }, 300);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: '#052F4B' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#19D5E5]" />
              <span className="font-bold text-sm">MediTrack Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="h-72 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[90%] rounded-xl px-3 py-2 ${
                  msg.role === 'user'
                    ? 'ml-auto bg-[#073B55] text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 p-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage(input);
              }}
              placeholder="Describe emergency or symptom..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#087D91]"
            />
            <button
              onClick={() => sendMessage(input)}
              className="rounded-lg bg-[#073B55] text-white p-2 cursor-pointer"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="px-3 pb-3 text-[10px] text-slate-400">
            Not medical advice. For life-threatening emergencies call emergency services immediately.
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-[#073B55] text-white p-4 shadow-xl hover:bg-[#052F4B] transition-colors cursor-pointer"
        aria-label="Open MediTrack assistant"
      >
        <MessageCircle size={22} />
      </button>
    </div>
  );
}
