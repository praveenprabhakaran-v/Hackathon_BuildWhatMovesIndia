import React from 'react';
import { Building, Calendar, ArrowRight, FileText, AlertTriangle } from 'lucide-react';
import { RTIApplication } from '../../types/rti';
import { StatusBadge } from '../status/StatusBadge';

interface ApplicationCardProps {
  application: RTIApplication;
  onViewDetails: (regNo: string) => void;
  className?: string;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onViewDetails,
  className = '',
}) => {
  const filedDate = new Date(application.filedOn).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className={`bg-white rounded-xl border border-[#E2DDD5] p-5 shadow-xs hover:border-[#1B4B8F]/50 transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="font-mono-code font-bold text-sm text-[#1B4B8F] block">
              {application.registrationNumber}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#575D65] mt-0.5">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Filed on {filedDate}</span>
            </div>
          </div>

          <StatusBadge status={application.status} size="sm" />
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B1E22]">
            <Building className="w-3.5 h-3.5 text-[#1B4B8F]" aria-hidden="true" />
            <span className="truncate">{application.authority.name}</span>
          </div>
          <p className="text-xs text-[#575D65] mt-1 line-clamp-2 leading-relaxed">
            {application.requestText}
          </p>
        </div>

        {application.actionRequired && (
          <div className="bg-[#FEF8E7] border border-[#F4E3B5] rounded-lg p-2.5 mb-3 flex items-center gap-2 text-xs text-[#7C4E0A]">
            <AlertTriangle className="w-4 h-4 text-[#B7791F] shrink-0" aria-hidden="true" />
            <span className="truncate font-medium">
              {application.actionRequired.type === 'ADDITIONAL_FEE'
                ? `Action: Additional fee of ₹${application.actionRequired.amount} required`
                : 'Action: Clarification document required'}
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
        <span className="text-[11px] font-mono-code text-[#575D65]">
          Fee: {application.isBplExempt ? '₹0 (BPL)' : `₹${application.applicationFee}`}
        </span>

        <button
          type="button"
          onClick={() => onViewDetails(application.registrationNumber)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4B8F] hover:text-[#123362] hover:underline"
        >
          <span>Track Status</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
