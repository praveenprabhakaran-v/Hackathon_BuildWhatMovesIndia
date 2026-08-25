import React from 'react';
import { Info, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export type NoticeVariant = 'info' | 'warning' | 'error' | 'success';

interface NoticeProps {
  variant?: NoticeVariant;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  id?: string;
  headingLevel?: 'h2' | 'h3' | 'h4' | 'div';
}

export const Notice: React.FC<NoticeProps> = ({
  variant = 'info',
  title,
  children,
  action,
  className = '',
  id,
  headingLevel = 'h3',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-[#FEF8E7] border-l-[#B7791F] border-y-[#F4E3B5] border-r-[#F4E3B5]',
          iconColor: 'text-[#B7791F]',
          titleColor: 'text-[#7C4E0A]',
          icon: AlertTriangle,
        };
      case 'error':
        return {
          container: 'bg-[#FDEEED] border-l-[#C23B22] border-y-[#F6C6BF] border-r-[#F6C6BF]',
          iconColor: 'text-[#C23B22]',
          titleColor: 'text-[#8A1F0C]',
          icon: AlertOctagon,
        };
      case 'success':
        return {
          container: 'bg-[#EAF6EE] border-l-[#1E7A46] border-y-[#BCE2C9] border-r-[#BCE2C9]',
          iconColor: 'text-[#1E7A46]',
          titleColor: 'text-[#11502C]',
          icon: CheckCircle2,
        };
      case 'info':
      default:
        return {
          container: 'bg-[#EEF3FA] border-l-[#1B4B8F] border-y-[#C9D9ED] border-r-[#C9D9ED]',
          iconColor: 'text-[#1B4B8F]',
          titleColor: 'text-[#103160]',
          icon: Info,
        };
    }
  };

  const style = getStyles();
  const IconComponent = style.icon;
  const HeadingTag = headingLevel;

  return (
    <div
      id={id}
      role={variant === 'error' ? 'alert' : 'region'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={`border-l-4 border-y border-r rounded-r-lg p-4 sm:p-5 my-4 transition-all shadow-xs ${style.container} ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`mt-0.5 shrink-0 ${style.iconColor}`}>
          <IconComponent className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <HeadingTag className={`text-base font-semibold ${style.titleColor} mb-1 flex items-center gap-2`}>
            {title}
          </HeadingTag>
          <div className="text-sm leading-relaxed text-[#1B1E22]/90 space-y-2">
            {children}
          </div>
          {action && <div className="mt-3 pt-2 border-t border-black/10">{action}</div>}
        </div>
      </div>
    </div>
  );
};

