import Button from "../../../components/ui/Button";

/** Centered message block used for the empty and error states. */
export default function StateMessage({ icon: Icon, title, description, tone = "default", actionLabel, actionIcon: ActionIcon, onAction }) {
  const iconBox = tone === "error" ? "bg-red-100 text-red-600" : "bg-primary-light text-primary";
  return (
    <div className="border border-dashed border-theme rounded-xl px-6 py-10 text-center">
      <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${iconBox}`}>
        <Icon size={22} />
      </div>
      <h3 className="text-base font-semibold text-theme">{title}</h3>
      {description && <p className="text-sm text-secondary mt-1 max-w-md mx-auto">{description}</p>}
      {actionLabel && (
        <div className="mt-5 flex justify-center">
          <Button onClick={onAction}>
            {ActionIcon && <ActionIcon size={16} />} {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
