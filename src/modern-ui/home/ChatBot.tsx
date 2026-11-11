import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import type { Hospital } from '../../types/public';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  hospital?: Hospital;
}

interface ChatBotProps {
  hospitals: Hospital[];
  /** True while the initial hospital list is still being fetched */
  isLoading?: boolean;
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

export function ChatBot({ hospitals, isLoading = false }: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showTeaser, setShowTeaser] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        "Hi, I'm Sreekutty. Ask me about symptoms, emergencies, or where to go, and I'll suggest the nearest suitable hospital.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setShowTeaser(false);
      return;
    }
    let showTimer: number | undefined;
    let hideTimer: number | undefined;
    const schedule = () => {
      const delay = 15000 + Math.random() * 25000;
      showTimer = window.setTimeout(() => {
        setShowTeaser(true);
        hideTimer = window.setTimeout(() => setShowTeaser(false), 4000);
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      if (showTimer) window.clearTimeout(showTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [open]);

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

    if (isLoading && hospitals.length === 0) {
      reply =
        'Hospital data is still loading — please try again in a moment. For life-threatening emergencies call 112 immediately.';
    } else if (!hospital) {
      reply = 'I could not find a matching hospital right now. Please call emergency services (112) immediately.';
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
        { id: `a-${Date.now()}`, role: 'assistant', text: reply, hospital: hospital ?? undefined },
      ]);
    }, 300);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-5 sm:right-5">
      {open && (
        <div className="mb-3 w-[min(92vw,22rem)] sm:w-96 max-h-[75vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: '#052F4B' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#19D5E5]" />
              <span className="font-bold text-sm">Sreekutty</span>
              {isLoading && (
                <span className="text-[10px] text-[#19D5E5] animate-pulse ml-1">loading hospitals…</span>
              )}
              {!isLoading && hospitals.length > 0 && (
                <span className="text-[10px] text-slate-400 ml-1">{hospitals.length} hospitals</span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="cursor-pointer p-1 -m-1">
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="min-h-0 h-56 sm:h-72 overflow-y-auto p-3 sm:p-4 space-y-3 text-sm overscroll-contain">
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
                {msg.hospital && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${msg.hospital.coordinates?.latitude ?? ''},${msg.hospital.coordinates?.longitude ?? ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#073B55] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Get Directions
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 p-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage(input);
              }}
              placeholder="Describe emergency or symptom..."
              className="flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#087D91]"
            />
            <button
              onClick={() => sendMessage(input)}
              className="rounded-lg bg-[#073B55] text-white p-3 sm:p-2 cursor-pointer touch-manipulation"
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

      {showTeaser && !open && (
        <div className="mb-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#073B55] shadow-lg">
          Chat with Sreekutty
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
