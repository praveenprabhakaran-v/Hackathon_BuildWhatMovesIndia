import React from 'react';
import { RTIApplication } from '../../types/rti';
import { StatusBadge } from '../status/StatusBadge';
import { ArrowRight, Building, Calendar, FileText } from 'lucide-react';
import { ApplicationCard } from './ApplicationCard';

interface ApplicationTableProps {
  applications: RTIApplication[];
  onViewDetails: (regNo: string) => void;
  className?: string;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  onViewDetails,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Mobile Stacked Cards View (< 768px) */}
      <div className="md:hidden space-y-4">
        {applications.map((app) => (
          <ApplicationCard
            key={app.registrationNumber}
            application={app}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block bg-white rounded-xl border border-[#E2DDD5] shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#EEF3FA] border-b border-[#E2DDD5] text-xs font-mono-code text-[#1B4B8F] uppercase">
              <th className="py-3.5 px-4 font-bold">Registration No.</th>
              <th className="py-3.5 px-4 font-bold">Public Authority</th>
              <th className="py-3.5 px-4 font-bold">Subject Summary</th>
              <th className="py-3.5 px-4 font-bold">Date Filed</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map((app) => {
              const filedDate = new Date(app.filedOn).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <tr
                  key={app.registrationNumber}
                  className="hover:bg-[#F6F4EF]/60 transition-colors group cursor-pointer"
                  onClick={() => onViewDetails(app.registrationNumber)}
                >
                  <td className="py-4 px-4 font-mono-code font-bold text-xs text-[#1B4B8F] whitespace-nowrap">
                    {app.registrationNumber}
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-[#1B1E22] max-w-[200px] truncate">
                    {app.authority.name}
                  </td>
                  <td className="py-4 px-4 text-xs text-[#575D65] max-w-[240px] truncate">
                    {app.requestText}
                  </td>
                  <td className="py-4 px-4 text-xs font-mono-code text-[#575D65] whitespace-nowrap">
                    {filedDate}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge status={app.status} size="sm" />
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(app.registrationNumber);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4B8F] hover:text-[#123362] hover:underline"
                    >
                      <span>Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
