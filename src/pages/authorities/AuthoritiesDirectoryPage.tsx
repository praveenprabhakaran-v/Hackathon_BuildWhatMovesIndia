import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { mockApi } from '../../lib/mockApi';
import { Authority } from '../../types/rti';
import { Search, Building, User, Clock, ArrowRight, MapPin, Filter } from 'lucide-react';

interface AuthoritiesDirectoryPageProps {
  onSelectAuthority: (auth: Authority) => void;
  onFileRtiWithAuthority: (auth: Authority) => void;
}

export const AuthoritiesDirectoryPage: React.FC<AuthoritiesDirectoryPageProps> = ({
  onSelectAuthority,
  onFileRtiWithAuthority,
}) => {
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mockApi.searchAuthorities().then((res) => {
      setAuthorities(res.results);
      setIsLoading(false);
    });
  }, []);

  const ministries = Array.from(new Set(authorities.map((a) => a.ministry))).sort();

  const filtered = authorities.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.cpioName.toLowerCase().includes(search.toLowerCase()) ||
      a.ministry.toLowerCase().includes(search.toLowerCase());

    const matchesMinistry = selectedMinistry === 'ALL' || a.ministry === selectedMinistry;

    return matchesSearch && matchesMinistry;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <Breadcrumbs
        items={[
          { label: 'Public Authorities Directory', current: true },
        ]}
      />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded">
          Central Registry Directory
        </span>
        <h1 className="text-3xl font-bold text-[#1B1E22] font-display">
          Central Public Authorities & CPIOs
        </h1>
        <p className="text-xs sm:text-sm text-[#575D65] leading-relaxed">
          Search all 1,200+ Central Government Ministries, Departments, Statutory Commissions, and Autonomous Bodies mapped to RTI Online.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <label htmlFor="auth-dir-search" className="sr-only">
            Search authority name, code, ministry, or CPIO officer
          </label>
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            id="auth-dir-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search authority name, code, ministry, or CPIO officer..."
            className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1B4B8F]"
          />
        </div>

        <div className="shrink-0">
          <label htmlFor="auth-ministry-filter" className="sr-only">
            Filter by Central Ministry
          </label>
          <select
            id="auth-ministry-filter"
            value={selectedMinistry}
            onChange={(e) => setSelectedMinistry(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-[#1B4B8F] max-w-xs truncate w-full"
          >
            <option value="ALL">All Central Ministries</option>
            {ministries.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Authorities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((auth) => (
          <div
            key={auth.id}
            className="bg-white rounded-xl border border-[#E2DDD5] p-5 shadow-xs hover:border-[#1B4B8F] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono-code font-bold text-[#1B4B8F] bg-[#EEF3FA] px-2 py-0.5 rounded border border-[#1B4B8F]/20">
                  {auth.code}
                </span>
                <span className="text-[11px] font-mono-code text-[#1E7A46] font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Avg {auth.avgTurnaroundDays}d SLA</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#1B1E22] mb-1 font-display">
                {auth.name}
              </h3>
              <p className="text-xs text-[#575D65] mb-3">{auth.ministry}</p>

              <div className="bg-[#F6F4EF]/60 p-3 rounded-lg text-xs space-y-1 text-gray-700 mb-3">
                <div className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-[#1B4B8F]" />
                  <span>CPIO: {auth.cpioName}</span>
                </div>
                <div className="text-[11px] text-gray-500 pl-5">{auth.cpioDesignation}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onSelectAuthority(auth)}
                className="text-xs font-semibold text-[#1B4B8F] hover:underline"
              >
                View Directory Card
              </button>

              <button
                type="button"
                onClick={() => onFileRtiWithAuthority(auth)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1B4B8F] text-white text-xs font-semibold rounded-lg hover:bg-[#123362] transition-colors"
              >
                <span>File RTI</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
