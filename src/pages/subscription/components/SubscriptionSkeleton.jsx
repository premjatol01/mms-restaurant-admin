// Loading placeholder for the 3-section subscription page.
const block = { backgroundColor: "var(--color-border)" };

function Bar({ className }) {
  return <div className={`animate-pulse rounded ${className}`} style={block} />;
}

export default function SubscriptionSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading subscription">
      {/* Current Plan card skeleton */}
      <div className="bg-surface rounded-xl border border-theme p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bar className="w-11 h-11 rounded-lg" />
            <div className="space-y-2">
              <Bar className="h-3 w-20" />
              <Bar className="h-5 w-36" />
              <Bar className="h-3 w-28" />
            </div>
          </div>
          <div className="flex gap-2">
            <Bar className="h-8 w-28 rounded-lg hidden sm:block" />
            <Bar className="h-8 w-20 rounded-lg hidden sm:block" />
          </div>
        </div>
        <Bar className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <Bar className="h-3 w-16" />
              <Bar className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Available Plans section skeleton */}
      <div className="bg-surface rounded-xl border border-theme p-6 space-y-4">
        <div className="space-y-1.5">
          <Bar className="h-4 w-32" />
          <Bar className="h-3 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-theme p-5 space-y-3">
              <Bar className="h-5 w-24" />
              <Bar className="h-8 w-20" />
              <div className="space-y-2">
                {[0, 1, 2].map((j) => <Bar key={j} className="h-3 w-full" />)}
              </div>
              <Bar className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Plan History skeleton */}
      <div className="bg-surface rounded-xl border border-theme p-6 space-y-3">
        <Bar className="h-4 w-28" />
        <Bar className="h-3 w-48" />
        <Bar className="h-36 w-full rounded-lg" />
      </div>
    </div>
  );
}
