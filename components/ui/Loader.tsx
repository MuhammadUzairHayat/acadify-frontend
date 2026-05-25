'use client';

export function Loader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizes[size]} border-3 border-border border-t-accent rounded-full animate-spin`} />
    </div>
  );
}