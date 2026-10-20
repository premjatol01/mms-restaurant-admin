import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  QrCode,
  ClipboardList,
  Store,
  Globe,
  Star,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  const quickLinks = [
    {
      title: "Menu Management",
      desc: "Manage categories, food items, and combo offerings",
      icon: UtensilsCrossed,
      path: "/menu",
    },
    {
      title: "Tables & QR Codes",
      desc: "Configure dining tables and download custom QR codes",
      icon: QrCode,
      path: "/tables",
    },
    {
      title: "Live Orders",
      desc: "Monitor active dining sessions and incoming orders",
      icon: ClipboardList,
      path: "/orders",
    },
    {
      title: "Restaurant Profile",
      desc: "Update basic restaurant information and branding",
      icon: Store,
      path: "/profile",
    },
    {
      title: "Website Builder",
      desc: "Customize your restaurant landing page and domain",
      icon: Globe,
      path: "/website",
    },
    {
      title: "Offers & Promos",
      desc: "Create discount codes and promotional campaigns",
      icon: Tag,
      path: "/offers-promos",
    },
    {
      title: "Customer Reviews",
      desc: "View and manage guest ratings and testimonials",
      icon: Star,
      path: "/reviews",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-theme">
          Welcome back, {user?.name || "Admin"}
        </h1>
        <p className="text-sm text-secondary mt-1">
          Overview and quick access to your restaurant operations
        </p>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="text-lg font-semibold text-theme mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group p-5 rounded-xl border border-theme bg-surface hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-theme text-base group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-secondary mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-theme/60 flex items-center text-xs font-medium text-primary gap-1">
                  <span>Open {item.title.split(" ")[0]}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
