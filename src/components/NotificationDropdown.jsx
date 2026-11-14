import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  CreditCard,
  UtensilsCrossed,
  Sparkles,
  BellRing,
  LifeBuoy,
  Info,
  Trash2,
  Volume2,
  VolumeX,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotificationStore } from "../store/notificationStore";
import { onNewNotification } from "../services/socket";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  } = useNotificationStore();

  // Load initial notifications on mount
  useEffect(() => {
    fetchNotifications();

    // Listen to real-time events via socket
    onNewNotification((newNotif) => {
      addNotification(newNotif);
    });
  }, [fetchNotifications, addNotification]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredList =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const getCategoryConfig = (category) => {
    switch (category) {
      case "order":
        return {
          icon: UtensilsCrossed,
          bg: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
          badge: "Order",
        };
      case "subscription":
        return {
          icon: CreditCard,
          bg: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
          badge: "Subscription",
        };
      case "waiter_call":
        return {
          icon: BellRing,
          bg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
          badge: "Table Service",
        };
      case "biz_growth":
        return {
          icon: Sparkles,
          bg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
          badge: "Biz Growth",
        };
      case "ticket":
        return {
          icon: LifeBuoy,
          bg: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
          badge: "Support",
        };
      default:
        return {
          icon: Info,
          bg: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
          badge: "Alert",
        };
    }
  };

  const handleItemClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    if (notif.actionUrl) {
      setIsOpen(false);
      navigate(notif.actionUrl);
    }
  };

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-secondary hover:bg-primary-light hover:text-theme transition-colors cursor-pointer"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-75">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-2xl border border-theme shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-theme flex items-center justify-between bg-surface/50 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-theme">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  soundEnabled
                    ? "text-primary hover:bg-primary/10"
                    : "text-secondary hover:bg-surface-secondary opacity-60"
                }`}
                title={soundEnabled ? "Notification sound is ON" : "Notification sound is MUTED"}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-secondary hover:text-theme px-2 py-1 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} className="text-primary" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1 p-2 border-b border-theme bg-surface-secondary/40 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`flex-1 py-1 px-2.5 rounded-lg text-center transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-surface text-theme shadow-xs border border-theme"
                  : "text-secondary hover:text-theme"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`flex-1 py-1 px-2.5 rounded-lg text-center transition-colors cursor-pointer ${
                filter === "unread"
                  ? "bg-surface text-theme shadow-xs border border-theme"
                  : "text-secondary hover:text-theme"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-theme/60">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <CheckCheck size={22} />
                </div>
                <p className="text-sm font-semibold text-theme">You&apos;re all caught up!</p>
                <p className="text-xs text-secondary mt-1">
                  {filter === "unread"
                    ? "No unread notifications left."
                    : "No new notifications right now."}
                </p>
              </div>
            ) : (
              filteredList.map((notif) => {
                const config = getCategoryConfig(notif.category);
                const IconComponent = config.icon;

                return (
                  <div
                    key={notif._id}
                    onClick={() => handleItemClick(notif)}
                    className={`group p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      notif.isRead
                        ? "bg-surface hover:bg-surface-secondary/60 opacity-80"
                        : "bg-primary-light/15 hover:bg-primary-light/30 border-l-4 border-primary"
                    }`}
                  >
                    {/* Category Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${config.bg}`}
                    >
                      <IconComponent size={18} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                          {config.badge}
                        </span>
                        <span className="text-[10px] text-secondary shrink-0">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>

                      <p
                        className={`text-xs mt-0.5 truncate ${
                          notif.isRead ? "font-medium text-theme" : "font-bold text-theme"
                        }`}
                      >
                        {notif.title}
                      </p>

                      <p className="text-xs text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.actionUrl && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-1.5 hover:underline">
                          View details <ExternalLink size={10} />
                        </span>
                      )}
                    </div>

                    {/* Delete Action on Hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-secondary hover:text-red-500 rounded transition-opacity shrink-0"
                      title="Dismiss"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
