// A titled group of fields inside an editor.
export default function FormBlock({ title, description, action, children }) {
  return (
    <div className="border border-theme rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-theme">{title}</h4>
          {description && <p className="text-xs text-secondary mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
