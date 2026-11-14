import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Video,
  FileText,
  Newspaper,
  Share2,
  ExternalLink,
  Play,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2,
  Bookmark
} from "lucide-react";
import { bizGrowthApi } from "../../api/bizGrowth.api";
import SearchInput from "../../components/ui/SearchInput";
import EmptyState from "../../components/ui/EmptyState";
import VideoPlayerModal from "./modals/VideoPlayerModal";

const TABS = [
  { id: "all", label: "All Resources", icon: null },
  { id: "youtube", label: "Video Masterclasses", icon: Video, color: "text-red-600", badgeBg: "bg-red-50 text-red-700 border-red-200/60" },
  { id: "blog", label: "Articles & Guides", icon: FileText, color: "text-blue-600", badgeBg: "bg-blue-50 text-blue-700 border-blue-200/60" },
  { id: "news", label: "Industry News", icon: Newspaper, color: "text-emerald-600", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
  { id: "social", label: "Social Media & Marketing", icon: Share2, color: "text-purple-600", badgeBg: "bg-purple-50 text-purple-700 border-purple-200/60" },
];

export default function BizGrowthPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchResources = async () => {
      setLoading(true);
      try {
        const res = await bizGrowthApi.getAll({
          type: activeTab !== "all" ? activeTab : undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          search: search.trim() || undefined,
        });
        const isSuccess = res?.data?.success ?? res?.success;
        const dataPayload = res?.data?.data || res?.data || {};
        if (isMounted && (isSuccess || dataPayload?.items)) {
          setItems(dataPayload.items || []);
          if (dataPayload.categories) {
            setCategories(dataPayload.categories);
          }
        }
      } catch (err) {
        console.warn("Could not load Biz Growth resources:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchResources();
    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedCategory, search]);

  const featuredItem = useMemo(() => {
    return items.find((i) => i.featured) || (items.length > 0 ? items[0] : null);
  }, [items]);

  const handleCardClick = (item) => {
    if (item.type === "youtube") {
      setSelectedVideo(item);
    } else if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
    // Track view in backend
    const id = item._id || item.id;
    if (id) {
      bizGrowthApi.getById(id).catch(() => { });
    }
  };

  return (
    <div className="space-y-6">
      {/* Featured Resource Spotlight (If available) */}
        { featuredItem && (
          <div className="bg-surface rounded-2xl border border-primary/25 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col lg:flex-row items-stretch">
              {/* Thumbnail */}
              <div
                className="lg:w-2/5 aspect-video lg:aspect-auto min-h-[220px] bg-surface-soft relative overflow-hidden group cursor-pointer"
                onClick={() => handleCardClick(featuredItem)}
              >
                <img
                  src={
                    featuredItem.thumbnail
                      ? featuredItem.thumbnail.startsWith("http")
                        ? featuredItem.thumbnail
                        : `http://localhost:5000${featuredItem.thumbnail}`
                      : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80"
                  }
                  alt={featuredItem.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                  {featuredItem.type === "youtube" ? (
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={20} className="fill-current ml-0.5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/90 text-primary flex items-center justify-center shadow-lg">
                      <BookOpen size={18} />
                    </div>
                  )}
                </div>
              </div>

              {/* Featured Content */}
              <div className="lg:w-3/5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <Sparkles size={11} />
                      Featured Growth Pick
                    </span>
                    <span className="text-xs text-secondary font-medium">
                      &bull; {featuredItem.category || "Strategy"}
                    </span>
                    {featuredItem.readTime && (
                      <span className="text-xs text-secondary flex items-center gap-1 font-medium">
                        <Clock size={12} />
                        {featuredItem.readTime}
                      </span>
                    )}
                  </div>

                  <h2
                    onClick={() => handleCardClick(featuredItem)}
                    className="text-xl sm:text-2xl font-bold text-theme hover:text-primary transition-colors cursor-pointer"
                  >
                    {featuredItem.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-secondary leading-relaxed line-clamp-3">
                    {featuredItem.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-theme/60">
                  <span className="text-xs text-secondary font-medium">
                    By {featuredItem.sourceName || "Tablly Growth Team"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCardClick(featuredItem)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs sm:text-sm transition-all shadow-sm shadow-primary/20 cursor-pointer"
                  >
                    <span>{featuredItem.type === "youtube" ? "Watch Masterclass" : "Read Full Guide"}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Tabs & Search Controls */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${active
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-surface border-theme-faded text-secondary hover:text-theme hover:bg-primary-soft/20"
                  }`}
              >
                {Icon && <Icon size={16} className={active ? "text-white" : tab.color} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:max-w-md">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by topic, keyword, or title..."
            />
          </div>

          {/* Categories Pill Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${selectedCategory === "all"
                  ? "bg-theme text-theme border border-theme-faded shadow-xs font-bold"
                  : "text-secondary hover:text-theme bg-surface-soft hover:bg-primary-light"
                }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat
                    ? "bg-theme text-theme border border-theme-faded shadow-xs font-bold"
                    : "text-secondary hover:text-theme bg-surface-soft hover:bg-primary-light"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface rounded-2xl border border-theme p-4 space-y-3 animate-pulse">
              <div className="aspect-video bg-surface-soft rounded-xl" />
              <div className="h-4 bg-surface-soft rounded w-3/4" />
              <div className="h-3 bg-surface-soft rounded w-full" />
              <div className="h-3 bg-surface-soft rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-theme p-12 text-center">
          <EmptyState
            title="No growth resources found"
            description="Try selecting another category or clear your search query."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const id = item._id || item.id;
            const tabConf = TABS.find((t) => t.id === item.type) || TABS[1];
            const TypeIcon = tabConf.icon || BookOpen;
            const thumb = item.thumbnail
              ? item.thumbnail.startsWith("http")
                ? item.thumbnail
                : `http://localhost:5000${item.thumbnail}`
              : null;

            return (
              <div
                key={id}
                className="bg-surface rounded-2xl border border-theme-faded overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div
                    onClick={() => handleCardClick(item)}
                    className="relative aspect-video bg-surface-soft overflow-hidden cursor-pointer"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-soft/30 text-primary">
                        <TypeIcon size={36} />
                      </div>
                    )}

                    {/* Gradient Overlay & Play Button for YouTube */}
                    {item.type === "youtube" && (
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                        <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play size={20} className="fill-current ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-sm shadow-xs ${tabConf.badgeBg}`}>
                        <TypeIcon size={11} />
                        <span>{tabConf.label.split(" ")[0]}</span>
                      </span>
                    </div>

                    {/* Read / Watch Time */}
                    {item.readTime && (
                      <div className="absolute bottom-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 text-white backdrop-blur-sm">
                          <Clock size={10} />
                          <span>{item.readTime}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-secondary">
                      <span className="font-semibold text-primary uppercase tracking-wider">
                        {item.category || "Growth"}
                      </span>
                      <span>{item.sourceName || "Tablly Insights"}</span>
                    </div>

                    <h3
                      onClick={() => handleCardClick(item)}
                      className="font-bold text-base text-theme line-clamp-2 hover:text-primary transition-colors cursor-pointer leading-snug"
                    >
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 pb-5 pt-2 border-t border-theme/40 flex items-center justify-between">
                  <span className="text-[11px] text-secondary">
                    {item.type === "youtube" ? "Video Guide" : item.type === "social" ? "Social Playbook" : "Reading Guide"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCardClick(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                  >
                    <span>
                      {item.type === "youtube"
                        ? "Watch Video"
                        : item.type === "social"
                          ? "View Link"
                          : "Read Article"}
                    </span>
                    {item.type === "youtube" ? <Play size={12} className="fill-current" /> : <ExternalLink size={12} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-App Video Player Modal */}
      <VideoPlayerModal
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        resource={selectedVideo}
      />
    </div>
  );
}
