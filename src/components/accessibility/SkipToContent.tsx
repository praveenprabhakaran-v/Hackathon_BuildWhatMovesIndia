import React from 'react';

export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1B4B8F] focus:text-white focus:font-medium focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#1B4B8F]/30"
    >
      Skip to main content
    </a>
  );
};
