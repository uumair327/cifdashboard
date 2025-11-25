/**
 * Skeleton Loader Component
 * Professional loading state for better UX
 */
interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export function SkeletonLoader({
  variant = 'text',
  width = '100%',
  height,
  className = '',
  count = 1,
}: SkeletonLoaderProps) {
  const baseClass = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  const skeletonClass = `${baseClass} ${variantClasses[variant]} ${className}`;

  if (count === 1) {
    return <div className={skeletonClass} style={style} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClass} style={style} />
      ))}
    </>
  );
}

// Preset skeleton components
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <SkeletonLoader width={40} height={40} variant="rectangular" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader width="60%" />
            <SkeletonLoader width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3">
          <SkeletonLoader height={120} variant="rectangular" />
          <SkeletonLoader width="80%" />
          <SkeletonLoader width="60%" />
        </div>
      ))}
    </div>
  );
}
