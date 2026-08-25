import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { ChevronDown, ChevronUp, HelpCircle, Search, BookOpen, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { useLanguage } from '../../lib/context/LanguageContext';

export const FaqPage: React.FC = () => {
  const { currentLocale } = useLanguage();
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [simplifiedTexts, setSimplifiedTexts] = useState<Record<number, string>>({});
  const [simplifyingIndex, setSimplifyingIndex] = useState<number | null>(null);

  const handleSimplify = async (idx: number, passage: string) => {
    if (simplifiedTexts[idx]) return;
    setSimplifyingIndex(idx);
    try {
      const res = await fetch('/api/assistant/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage, language: currentLocale }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimplifiedTexts((prev) => ({ ...prev, [idx]: data.simplified }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimplifyingIndex(null);
    }
  };

  const faqs = [
    {
      q: 'What is the statutory time limit for the CPIO to provide information?',
      a: 'Under Section 7(1) of the RTI Act 2005, the CPIO must provide the information or reject the request within 30 calendar days of receiving the application. If the information concerns the life or liberty of a person, it must be provided within 48 hours.',
      category: 'Timelines',
    },
    {
      q: 'How much is the RTI application fee and who is exempt?',
      a: 'The standard statutory application fee for Central Government Public Authorities is ₹10.00. Citizens belonging to the Below Poverty Line (BPL) category are totally exempt from paying this fee upon providing proof of a valid BPL card under Section 7(5).',
      category: 'Fees',
    },
    {
      q: 'What if the information sought pertains to another public authority?',
      a: 'Under Section 6(3), if the subject matter is held by or more closely connected with the functions of another public authority, the CPIO must transfer the application to that authority within 5 days and inform the applicant immediately.',
      category: 'Procedure',
    },
    {
      q: 'When and how can I file a First Appeal?',
      a: 'Under Section 19(1), if you do not receive a decision within 30 days or are aggrieved by any decision/rejection of the CPIO, you may file a First Appeal to the designated First Appellate Authority (FAA) within 30 days. Filing a First Appeal is free of charge (₹0).',
      category: 'Appeals',
    },
    {
      q: 'Can I file RTI applications for State Government departments on this portal?',
      a: 'No. RTI Online is dedicated strictly to Central Ministries, Departments, and Central Public Sector Undertakings (CPSUs). For state-level bodies (e.g. State Police, Panchayats, Municipal Corporations), please visit the respective State Government RTI portal.',
      category: 'Jurisdiction',
    },
    {
      q: 'What is the fee for additional copies or inspection of records?',
      a: 'Under Rule 4 of the RTI Rules 2012: ₹2.00 per page (A4/A3 size) created or copied; actual cost for larger samples or models; and for inspection of records, no fee for the first hour and ₹5.00 for each subsequent hour.',
      category: 'Fees',
    },
  ];

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Breadcrumbs
        items={[
          { label: 'Frequently Asked Questions', current: true },
        ]}
      />

      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded">
          Knowledge Base
        </span>
        <h1 className="text-3xl font-bold text-[#1B1E22] font-display">
          Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-xs sm:text-sm text-[#575D65]">
          Clear guidance on RTI filing procedures, statutory fees, appellate remedies, and citizen rights.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-3 shadow-xs max-w-lg mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg focus:outline-none text-gray-900"
          />
        </div>
      </div>

      {/* Accordion FAQ list */}
      <div className="space-y-3">
        {filtered.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`bg-white rounded-xl border transition-all overflow-hidden ${
                isOpen ? 'border-[#1B4B8F] shadow-xs' : 'border-[#E2DDD5]'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm text-[#1B1E22] hover:bg-gray-50 transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono-code text-[#1B4B8F] bg-[#EEF3FA] px-2 py-0.5 rounded">
                    {faq.category}
                  </span>
                  <span>{faq.q}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#1B4B8F] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-[#575D65] leading-relaxed border-t border-gray-100 bg-[#F6F4EF]/30 space-y-3">
                  <div>{faq.a}</div>

                  {simplifiedTexts[idx] && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] mb-1 text-emerald-800">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Plain-Language Simplified (Grade-6 Reading Level):
                      </div>
                      <p className="text-xs leading-relaxed">{simplifiedTexts[idx]}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-gray-200/50">
                    <span className="text-[10px] text-gray-400">Official RTI Statutory Reference</span>
                    <button
                      type="button"
                      onClick={() => handleSimplify(idx, faq.a)}
                      disabled={simplifyingIndex === idx || !!simplifiedTexts[idx]}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#1B4B8F] bg-[#EEF3FA] hover:bg-[#1B4B8F] hover:text-white rounded-lg border border-[#1B4B8F]/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{simplifyingIndex === idx ? 'Simplifying...' : simplifiedTexts[idx] ? 'Simplified' : 'Simplify This (Plain Text)'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
