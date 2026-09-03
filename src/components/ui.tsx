import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-2xl border border-zinc-800 bg-zinc-900 ${className}`}>
      {children}
    </div>
  );
}

type MetricLabelProps = {
  children: ReactNode;
  className?: string;
};

export function MetricLabel({ children, className = '' }: MetricLabelProps) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-wider text-zinc-400 ${className}`}>
      {children}
    </p>
  );
}

type SectionTitleProps = {
  children: ReactNode;
  className?: string;
};

export function SectionTitle({ children, className = '' }: SectionTitleProps) {
  return (
    <h2 className={`text-lg font-bold text-white ${className}`}>{children}</h2>
  );
}
