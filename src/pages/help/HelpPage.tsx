import React from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Mail, Phone, Clock, Building, HelpCircle, FileQuestion, LifeBuoy } from 'lucide-react';

export const HelpPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Breadcrumbs
        items={[
          { label: 'Helpdesk & Support', current: true },
        ]}
      />

      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded">
          Citizen Assistance
        </span>
        <h1 className="text-3xl font-bold text-[#1B1E22] font-display">
          RTI Online National Helpdesk
        </h1>
        <p className="text-xs sm:text-sm text-[#575D65]">
          Assistance for technical queries, payment reconciliation, and portal navigation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#EEF3FA] text-[#1B4B8F] flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1B1E22] font-display">
            Toll-Free Helpline
          </h3>
          <p className="text-xs text-[#575D65] leading-relaxed">
            For general inquiries and technical guidance regarding filing procedures on RTI Online.
          </p>
          <div className="bg-[#F6F4EF] p-3 rounded-lg text-xs space-y-1 font-mono-code">
            <div><strong>Toll Free:</strong> 1800-11-2026 / 011-2465-1000</div>
            <div><strong>Working Hours:</strong> Mon – Fri, 09:30 AM to 05:30 PM (IST)</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#EEF3FA] text-[#1B4B8F] flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1B1E22] font-display">
            Email Support & Grievances
          </h3>
          <p className="text-xs text-[#575D65] leading-relaxed">
            Write to the technical support team with screenshots if encountering system errors or payment drops.
          </p>
          <div className="bg-[#F6F4EF] p-3 rounded-lg text-xs space-y-1 font-mono-code">
            <div><strong>Email:</strong> helpdesk-rtionline@nic.in</div>
            <div><strong>DoPT Portal:</strong> dopt@nic.in</div>
          </div>
        </div>
      </div>
    </div>
  );
};
