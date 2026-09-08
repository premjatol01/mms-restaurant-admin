export default function FormSection({ title, description, children }) {
  return (
    <div className="bg-surface rounded-xl border border-theme p-6">
      {(title || description) && (
        <div className="mb-5">
          {title && <h3 className="text-base font-semibold text-theme">{title}</h3>}
          {description && <p className="text-sm text-secondary mt-0.5">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
