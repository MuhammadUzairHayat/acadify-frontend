'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'bordered';
}

export function Card({ children, className = '', padding = 'md', variant = 'default' }: CardProps) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const variants = {
    default: 'bg-surface border border-border',
    elevated: 'bg-surface-raised shadow-lg',
    bordered: 'bg-background-secondary border-2 border-border-strong',
  };
  
  return (
    <div className={`rounded-xl ${variants[variant]} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}