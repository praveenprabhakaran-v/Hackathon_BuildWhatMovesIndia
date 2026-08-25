import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`text-xs text-[#575D65] my-3 no-print ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
        <li className="flex items-center gap-1.5">
          <a
            href="/"
            onClick={(e) => {
              if (items[0]?.onClick) {
                e.preventDefault();
                items[0].onClick();
              }
            }}
            className="hover:text-[#1B4B8F] flex items-center gap-1 focus:outline-none focus:underline"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Home</span>
          </a>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" aria-hidden="true" />
            {item.current || !item.onClick ? (
              <span className="font-semibold text-[#1B1E22] truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-[#1B4B8F] text-[#575D65] focus:outline-none focus:underline"
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
