import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { ApplicationTable } from '../../components/applications/ApplicationTable';
import { StatusBadge } from '../../components/status/StatusBadge';
import { EmptyState } from '../../components/status/EmptyState';
import { mockApi } from '../../lib/mockApi';
import { RTIApplication, FirstAppealApplication } from '../../types/rti';
import {
  FileText,
  Scale,
  Search,
  Filter,
  ArrowRight,
  LogOut,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface HistoryDashboardPageProps {
  userEmail: string;
  onLogout: () => void;
  onViewApplication: (regNo: string) => void;
  onFileNewRti: () => void;
}

export const HistoryDashboardPage: React.FC<HistoryDashboardPageProps> = ({
  userEmail,
  onLogout,
  onViewApplication,
  onFileNewRti,
}) => {
  const [activeTab, setActiveTab] = useState<'RTI' | 'APPEAL'>('RTI');
  const [applications, setApplications] = useState<RTIApplication[]>([]);
  const [appeals, setAppeals] = useState<FirstAppealApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appRes, appealRes] = await Promise.all([
        mockApi.listApplicationsByEmail(userEmail),
        mockApi.listAppealsByEmail(userEmail),
      ]);
      setApplications(appRes);
      setAppeals(appealRes);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userEmail]);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.authority.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.requestText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingActionCount = applications.filter(
    (a) => a.status === 'ADDITIONAL_FEE_REQUIRED' || a.status === 'SUPPORTING_DOCUMENT_REQUIRED'
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <Breadcrumbs
        items={[
          { label: 'Citizen History', current: true },
        ]}
      />

      {/* Citizen Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded">
            Authenticated Citizen Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B1E22] mt-1 font-display">
            My Applications & Appeals
          </h1>
          <p className="text-xs text-[#575D65] mt-0.5">
            Registered Email: <strong className="font-mono-code text-gray-800">{userEmail}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onFileNewRti}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B4B8F] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#123362] transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>File New RTI</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2DDD5] shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Total RTI Applications</div>
          <div className="text-2xl font-bold font-mono-code text-[#1B4B8F] mt-1">{applications.length}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2DDD5] shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Pending Action Notices</div>
          <div className="text-2xl font-bold font-mono-code text-[#B7791F] mt-1 flex items-center gap-2">
            <span>{pendingActionCount}</span>
            {pendingActionCount > 0 && <span className="text-xs font-normal text-[#B7791F]">(Action Needed)</span>}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2DDD5] shadow-xs">
          <div className="text-xs text-gray-500 font-medium">First Appeals Preferred</div>
          <div className="text-2xl font-bold font-mono-code text-[#1E7A46] mt-1">{appeals.length}</div>
        </div>
      </div>

      {/* Tabs: RTI Applications vs First Appeals */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 flex items-center justify-between">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setActiveTab('RTI')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'RTI'
                  ? 'border-[#1B4B8F] text-[#1B4B8F] font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              RTI Applications ({applications.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('APPEAL')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'APPEAL'
                  ? 'border-[#1B4B8F] text-[#1B4B8F] font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              First Appeals ({appeals.length})
            </button>
          </nav>

          <button
            type="button"
            onClick={loadData}
            className="p-2 text-gray-400 hover:text-[#1B4B8F] transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tab 1: RTI Applications */}
        {activeTab === 'RTI' && (
          <div className="space-y-4">
            {/* Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-[#E2DDD5]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by Registration No. or Authority..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#1B4B8F]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-[#1B4B8F]"
              >
                <option value="ALL">All Statuses</option>
                <option value="RECEIVED">Received</option>
                <option value="UNDER_PROCESSING">Under Processing</option>
                <option value="ADDITIONAL_FEE_REQUIRED">Additional Fee Required</option>
                <option value="SUPPORTING_DOCUMENT_REQUIRED">Document Required</option>
                <option value="TRANSFERRED">Transferred</option>
                <option value="MULTIPLE_CPIO">Multiple CPIO</option>
                <option value="RESPONSE_AVAILABLE">Response Available</option>
                <option value="RETURNED">Returned / Rejected</option>
              </select>
            </div>

            {filteredApps.length > 0 ? (
              <ApplicationTable
                applications={filteredApps}
                onViewDetails={onViewApplication}
              />
            ) : (
              <EmptyState
                title="No RTI Applications Found"
                description={
                  searchQuery || statusFilter !== 'ALL'
                    ? 'No records match the current filter criteria.'
                    : 'You have not submitted any RTI requests with this email address yet.'
                }
                actionLabel="File Your First RTI (₹10)"
                onAction={onFileNewRti}
              />
            )}
          </div>
        )}

        {/* Tab 2: First Appeals */}
        {activeTab === 'APPEAL' && (
          <div className="space-y-4">
            {appeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appeals.map((item) => (
                  <div
                    key={item.appealRegistrationNumber}
                    className="bg-white rounded-xl border border-[#E2DDD5] p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono-code font-bold text-sm text-[#1B4B8F]">
                          {item.appealRegistrationNumber}
                        </span>
                        <StatusBadge status={item.status as any} size="sm" />
                      </div>

                      <div className="text-xs text-gray-600 mb-2">
                        <div><strong>FAA:</strong> {item.faaOfficer.name} ({item.faaOfficer.designation})</div>
                        <div className="text-gray-500">{item.authority.name}</div>
                      </div>

                      <div className="text-xs bg-[#F6F4EF] p-2.5 rounded-lg text-gray-700 mb-3">
                        <span className="font-semibold block mb-0.5">Ground: {item.groundLabel}</span>
                        <p className="line-clamp-2 text-[11px] font-mono-code">{item.appealText}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-mono-code">
                        Filed: {new Date(item.filedOn).toLocaleDateString('en-IN')}
                      </span>

                      <button
                        type="button"
                        onClick={() => onViewApplication(item.appealRegistrationNumber)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4B8F] hover:underline"
                      >
                        <span>Track Appeal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No First Appeals Preferred"
                description="If any of your RTI applications are delayed beyond 30 days or unlawfully denied, you can lodge a First Appeal free of charge."
                actionLabel="Lodge First Appeal"
                onAction={() => onViewApplication('')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
