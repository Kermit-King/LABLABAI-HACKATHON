import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonBlockProps {
  width?: string;
  height: string;
  rounded?: string;
  className?: string;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width = 'w-full',
  height,
  rounded = 'rounded',
  className = '',
}) => {
  return (
    <div
      className={cn(
        'bg-slate-700 animate-pulse',
        width,
        height,
        rounded,
        className
      )}
    />
  );
};

// Made with Bob