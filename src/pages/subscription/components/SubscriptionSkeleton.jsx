// Loading placeholder. Uses the theme's border colour so it works in light and dark mode.
const block = { backgroundColor: "var(--color-border)" };

function Bar({ className }) {
  return <div className={`animate-pulse rounded ${className}`} style={block} />;
}

export default function SubscriptionSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading subscription">
      <div className="bg-surface rounded-xl border border-theme p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Bar className="w-11 h-11 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Bar className="h-3 w-24" />
            <Bar className="h-5 w-48" />
          </div>
          <Bar className="h-10 w-44 rounded-lg hidden sm:block" />
        </div>
        <Bar className="h-24 w-full rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Bar className="h-3 w-20" />
              <Bar className="h-5 w-28" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-surface rounded-xl border border-theme p-6 space-y-3">
        <Bar className="h-5 w-40" />
        <Bar className="h-12 w-full" />
        <Bar className="h-12 w-full" />
      </div>
    </div>
  );
}
