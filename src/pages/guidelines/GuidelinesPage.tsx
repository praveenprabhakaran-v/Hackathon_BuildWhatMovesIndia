import React from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { BookOpen, ShieldCheck, Scale, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const GuidelinesPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Breadcrumbs
        items={[
          { label: 'Citizen Guidelines', current: true },
        ]}
      />

      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded">
          Statutory Reference
        </span>
        <h1 className="text-3xl font-bold text-[#1B1E22] font-display">
          User Guidelines & RTI Act Provisions
        </h1>
        <p className="text-xs sm:text-sm text-[#575D65]">
          A comprehensive guide to filing requests and appeals under the Right to Information Act, 2005.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 shadow-xs space-y-8 text-xs leading-relaxed text-gray-700">
        {/* Section 1: Filing Section 6(1) */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#1B1E22] font-display flex items-center gap-2 border-b pb-2">
            <FileText className="w-4 h-4 text-[#1B4B8F]" />
            <span>1. Filing an Application under Section 6(1)</span>
          </h2>
          <p>
            Any citizen of India can request information in writing or electronically. The application must state the particulars of the information sought. An applicant making request for information shall not be required to give any reason for requesting the information or any other personal details except those that may be necessary for contacting him/her.
          </p>
        </div>

        {/* Section 2: Fee Structure */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#1B1E22] font-display flex items-center gap-2 border-b pb-2">
            <Clock className="w-4 h-4 text-[#1B4B8F]" />
            <span>2. Prescribed Statutory Fee Structure</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Application Fee:</strong> ₹10.00 per request.</li>
            <li><strong>Below Poverty Line (BPL):</strong> ₹0.00 (Exempt under proviso to Section 7(5)).</li>
            <li><strong>Additional Cost:</strong> ₹2.00 for each page (A4/A3 size) created or copied.</li>
            <li><strong>Electronic Media:</strong> ₹50.00 per diskette or electronic drive.</li>
          </ul>
        </div>

        {/* Section 3: Disposal Timelines */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#1B1E22] font-display flex items-center gap-2 border-b pb-2">
            <CheckCircle2 className="w-4 h-4 text-[#1E7A46]" />
            <span>3. Disposal SLA & Deadlines</span>
          </h2>
          <p>
            The Central Public Information Officer (CPIO) shall, as expeditiously as possible, and in any case within <strong>thirty (30) days</strong> of the receipt of the request, either provide the information on payment of such fee as may be prescribed or reject the request for any of the reasons specified in Sections 8 and 9. Where the information sought concerns the life or liberty of a person, the same shall be provided within <strong>forty-eight (48) hours</strong>.
          </p>
        </div>

        {/* Section 4: First Appeal */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#1B1E22] font-display flex items-center gap-2 border-b pb-2">
            <Scale className="w-4 h-4 text-[#1B4B8F]" />
            <span>4. First Appeal Mechanism (Section 19(1))</span>
          </h2>
          <p>
            Any person who, does not receive a decision within the specified time, or is aggrieved by a decision of the Central Public Information Officer, may within thirty days from the expiry of such period or from the receipt of such a decision prefer an appeal to such officer who is senior in rank to the Central Public Information Officer, in each public authority.
          </p>
        </div>
      </div>
    </div>
  );
};
