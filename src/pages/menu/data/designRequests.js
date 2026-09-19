// Dummy data + constants for the Contact Designer feature.

export const DESIGN_REQUEST_STATUS = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700" },
};

export const ATTACHMENT_RULES = {
  maxSizeMB: 5,
  extensions: ["png", "jpg", "jpeg", "webp", "pdf", "doc", "docx"],
  accept: ".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx",
  label: "PNG, JPG, WEBP, PDF, DOC or DOCX up to 5 MB",
};

export const defaultDesignRequests = [
  {
    id: "dr-1",
    description: "We need a two-page A4 menu with a dark theme and gold accents. Logo is attached.",
    attachment: { name: "logo-and-reference.pdf", size: 482113, type: "application/pdf" },
    status: "in_progress",
    createdAt: "2026-09-10T10:30:00.000Z",
  },
  {
    id: "dr-2",
    description: "Please redesign our beverages page to match the rest of the menu.",
    attachment: null,
    status: "completed",
    createdAt: "2026-08-28T15:05:00.000Z",
  },
];
