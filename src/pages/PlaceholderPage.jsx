export default function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center h-full min-h-64">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-theme mb-2">{title}</h2>
        <p className="text-secondary text-sm">This page is under construction.</p>
      </div>
    </div>
  );
}
