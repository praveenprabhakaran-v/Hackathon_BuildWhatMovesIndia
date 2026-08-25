import React from 'react';
import { ChildApplication } from '../../types/rti';
import { StatusBadge } from '../status/StatusBadge';
import { GitFork, User, FileText, ArrowRight } from 'lucide-react';

interface MultiCpioGroupProps {
  childApplications: ChildApplication[];
  onSelectChild?: (regNo: string) => void;
  className?: string;
}

export const MultiCpioGroup: React.FC<MultiCpioGroupProps> = ({
  childApplications,
  onSelectChild,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-6 shadow-xs ${className}`}>
      <div className="flex items-start gap-3 border-b border-gray-100 pb-4 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#EEF3FA] text-[#1B4B8F] flex items-center justify-center shrink-0">
          <GitFork className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-base font-bold text-[#1B1E22] font-display">
            Multi-CPIO Distribution ({childApplications.length} Sub-Applications)
          </h4>
          <p className="text-xs text-[#575D65] mt-0.5 leading-relaxed">
            Your original RTI query pertained to multiple distinct divisions. The Nodal Officer has created dedicated sub-cases for parallel response processing under Section 5(4) / 5(5).
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {childApplications.map((child, idx) => (
          <div
            key={idx}
            className="border border-[#E2DDD5] bg-[#F6F4EF]/40 rounded-lg p-4 hover:border-[#1B4B8F]/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono-code font-bold text-xs text-[#1B4B8F] bg-white px-2 py-0.5 rounded border border-[#E2DDD5]">
                  {child.registrationNumber}
                </span>
                <span className="text-xs font-semibold text-[#1B1E22]">{child.authority}</span>
              </div>
              <StatusBadge status={child.status} size="sm" />
            </div>

            <div className="text-xs text-[#575D65] space-y-1 my-2">
              <div className="flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <span><strong>Scope:</strong> {child.subject}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span><strong>Assigned CPIO:</strong> {child.cpioName}</span>
              </div>
            </div>

            {onSelectChild && (
              <div className="pt-2 border-t border-gray-200/60 flex justify-end">
                <button
                  type="button"
                  onClick={() => onSelectChild(child.registrationNumber)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4B8F] hover:underline"
                >
                  <span>Track Sub-Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
