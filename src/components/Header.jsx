import { Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-surface border-b border-theme flex items-center justify-between px-6">
      <h1 className="text-theme font-semibold text-lg">Restaurant Admin Panel</h1>

      <div className="flex items-center gap-2">
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-secondary hover:bg-primary-light hover:text-theme transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
