import React from 'react';

export const VisuallyHidden: React.FC<{ children: React.ReactNode; as?: React.ElementType }> = ({
  children,
  as: Component = 'span',
}) => {
  return <Component className="sr-only">{children}</Component>;
};
