import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Building } from 'lucide-react';
import { Authority } from '../../types/rti';
import { useLanguage } from '../../lib/context/LanguageContext';

interface SearchableSelectProps {
  id: string;
  authorities: Authority[];
  selectedAuthority?: Authority | null;
  onSelect: (authority: Authority) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  authorities,
  selectedAuthority,
  onSelect,
  error,
  placeholder = 'Search by ministry name, authority, or code (e.g. Health, RAILW, MeitY)...',
  className = '',
}) => {
  const { currentLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = `${id}-listbox`;

  const getLocalizedName = (auth: Authority): string => {
    if (currentLocale === 'hi' && auth.name_hi) return auth.name_hi;
    if (currentLocale === 'bn' && auth.name_bn) return auth.name_bn;
    if (currentLocale === 'mr' && auth.name_mr) return auth.name_mr;
    if (currentLocale === 'te' && auth.name_te) return auth.name_te;
    if (currentLocale === 'ta' && auth.name_ta) return auth.name_ta;
    return auth.name_en || auth.name;
  };

  const getLocalizedMinistry = (auth: Authority): string => {
    if (currentLocale === 'hi' && auth.ministry_hi) return auth.ministry_hi;
    if (currentLocale === 'bn' && auth.ministry_bn) return auth.ministry_bn;
    if (currentLocale === 'mr' && auth.ministry_mr) return auth.ministry_mr;
    if (currentLocale === 'te' && auth.ministry_te) return auth.ministry_te;
    if (currentLocale === 'ta' && auth.ministry_ta) return auth.ministry_ta;
    return auth.ministry_en || auth.ministry;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = authorities.filter((a) => {
    const q = searchTerm.toLowerCase();
    const locName = getLocalizedName(a).toLowerCase();
    const locMinistry = getLocalizedMinistry(a).toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      locName.includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.ministry.toLowerCase().includes(q) ||
      locMinistry.includes(q) ||
      (a.name_hi && a.name_hi.toLowerCase().includes(q)) ||
      (a.name_bn && a.name_bn.toLowerCase().includes(q)) ||
      (a.name_mr && a.name_mr.toLowerCase().includes(q)) ||
      (a.name_te && a.name_te.toLowerCase().includes(q)) ||
      (a.name_ta && a.name_ta.toLowerCase().includes(q)) ||
      (a.department && a.department.toLowerCase().includes(q))
    );
  });

  const handleSelect = (auth: Authority) => {
    onSelect(auth);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-[640px] min-w-0 ${className}`}>
      {/* Trigger button / Input display */}
      <button
        type="button"
        id={id}
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : `${id}-helper`}
        className={`w-full min-h-[48px] px-3.5 py-2.5 text-left bg-white rounded-lg border flex items-center justify-between transition-all ${
          error
            ? 'border-2 border-[#C23B22] ring-2 ring-[#C23B22]/15 focus:border-[#C23B22]'
            : isOpen
            ? 'border-[#1B4B8F] ring-2 ring-[#1B4B8F]/20'
            : 'border-[#E2DDD5] hover:border-gray-400 focus:border-[#1B4B8F]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <Building className="w-5 h-5 text-[#1B4B8F] shrink-0" aria-hidden="true" />
          {selectedAuthority ? (
            <div className="truncate">
              <span className="font-semibold text-sm text-[#1B1E22] block truncate">
                {getLocalizedName(selectedAuthority)}
              </span>
              <span className="text-xs text-[#575D65] block truncate">
                {getLocalizedMinistry(selectedAuthority)} ({selectedAuthority.code})
              </span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm truncate">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Public authorities list"
          className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-[#E2DDD5] z-50 overflow-hidden max-h-80 flex flex-col"
        >
          {/* Search Box inside dropdown */}
          <div className="p-2.5 border-b border-gray-100 bg-[#F6F4EF]/60">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to filter authorities..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E2DDD5] rounded-md focus:outline-none focus:border-[#1B4B8F] focus:ring-2 focus:ring-[#1B4B8F]/20"
                aria-label="Filter authorities"
              />
            </div>
          </div>

          {/* List of Authorities */}
          <div className="overflow-y-auto divide-y divide-gray-100 flex-1">
            {filtered.length > 0 ? (
              filtered.map((auth) => {
                const isSelected = selectedAuthority?.id === auth.id;
                const locName = getLocalizedName(auth);
                const locMinistry = getLocalizedMinistry(auth);

                return (
                  <button
                    key={auth.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    id={`${id}-option-${auth.id}`}
                    onClick={() => handleSelect(auth)}
                    className={`w-full text-left px-4 py-3 hover:bg-[#EEF3FA] transition-colors flex items-start justify-between gap-3 ${
                      isSelected ? 'bg-[#EEF3FA]/70' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono-code font-bold px-1.5 py-0.5 rounded bg-gray-100 text-[#1B4B8F]">
                          {auth.code}
                        </span>
                        <span className="text-sm font-semibold text-[#1B1E22] truncate">{locName}</span>
                      </div>
                      <div className="text-xs text-[#575D65] mt-1">{locMinistry}</div>
                      <div className="text-[11px] text-[#1E7A46] mt-0.5 font-medium">
                        Avg. Response: {auth.avgTurnaroundDays} days · CPIO: {auth.cpioName}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#1B4B8F] shrink-0 mt-1" aria-hidden="true" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-gray-500">
                No matching Public Authority found. Try searching by Ministry (e.g. Health, Finance, Railways).
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


