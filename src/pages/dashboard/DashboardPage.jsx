import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  IndianRupee,
  UtensilsCrossed,
  Users,
  Star,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Plus,
  ChevronRight,
  ExternalLink,
  QrCode,
  Flame,
  ChefHat,
  MessageSquare,
  Sparkles,
  Layers,
  CircleDot,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { getRestaurantAnalytics } from "../../api/analytics.api";

function CustomChartTooltip({ active, payload, label, prefix = "", suffix = "" }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-theme p-3 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur-md">
        <p className="font-bold text-theme">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-secondary">{entry.name}:</span>
            <span className="font-semibold text-theme">
              {prefix}
              {typeof entry.value === "number"
                ? entry.value.toLocaleString()
                : entry.value}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getRestaurantAnalytics();
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError(res.data?.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard analytics error:", err);
      setError(err?.message || "Failed to connect to analytics service");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const kpi = data?.kpi || {
    todayRevenue: 0,
    todayOrders: 0,
    todayAvgOrderValue: 0,
    yesterdayRevenue: 0,
    activeTables: 0,
    totalTables: 0,
    occupancyRate: 0,
    allTimeRevenue: 0,
    allTimeOrders: 0,
    totalDiners: 0,
    averageRating: 5.0,
    pendingKOT: 0,
  };

  const salesTrends = data?.salesTrends || [];
  const hourlyFlow = data?.hourlyFlow || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const topDishes = data?.topDishes || [];
  const activeSessions = data?.activeSessions || [];
  const recentOrders = data?.recentOrders || [];
  const recentReviews = data?.recentReviews || [];

  const totalMenuItems = useMemo(() => {
    return categoryDistribution.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }, [categoryDistribution]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-spin">
          <RefreshCw size={24} />
        </div>
        <p className="text-sm font-semibold text-theme">Loading restaurant operations data...</p>
        <p className="text-xs text-secondary">Gathering live orders, table sessions & sales records</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchAnalytics()}
            className="underline font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Today's Revenue */}
        <div className="bg-surface rounded-2xl border border-theme p-4.5 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">
              Today&apos;s Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-theme tracking-tight">
                ₹{kpi.todayRevenue.toLocaleString()}
              </p>
              <span className="text-xs text-emerald-600 font-bold flex items-center">
                <ArrowUpRight size={14} /> +18%
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-theme/60 text-xs">
              <span className="text-secondary">Average Order Value:</span>
              <span className="font-bold text-theme">₹{kpi.todayAvgOrderValue}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Today's Orders */}
        <div className="bg-surface rounded-2xl border border-theme p-4.5 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">
              Orders Placed Today
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UtensilsCrossed size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-theme tracking-tight">
                {kpi.todayOrders} Orders
              </p>
              {kpi.pendingKOT > 0 && (
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {kpi.pendingKOT} in Kitchen
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-theme/60 text-xs">
              <span className="text-secondary">All-time volume:</span>
              <span className="font-bold text-theme">{kpi.allTimeOrders} total</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Table Occupancy Rate */}
        <div className="bg-surface rounded-2xl border border-theme p-4.5 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">
              Floor Occupancy
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-theme tracking-tight">
                {kpi.occupancyRate}%
              </p>
              <span className="text-xs font-bold text-blue-600">
                {kpi.activeTables} of {kpi.totalTables} Tables
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-theme/60 text-xs">
              <span className="text-secondary">Dine-in status:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CircleDot size={10} className="animate-pulse" /> Live Sessions
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Customer Satisfaction & Total Diners */}
        <div className="bg-surface rounded-2xl border border-theme p-4.5 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">
              Diner Rating &amp; Reach
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Star size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-theme tracking-tight">
                ⭐ {kpi.averageRating}
              </p>
              <span className="text-xs text-secondary font-medium">/ 5.0 Rating</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-theme/60 text-xs">
              <span className="text-secondary">Unique Diners Served:</span>
              <span className="font-bold text-theme">{kpi.totalDiners} customers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Graphs Row: 7-Day Revenue Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1 (2 Cols): 7-Day Revenue & Volume Curve */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-theme flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600" />
                <span>7-Day Sales &amp; Revenue Velocity</span>
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Daily sales trends and daily order volume for the current week
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-theme">Revenue (₹)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-secondary">Order Count</span>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="restroRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="restroOrdersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d9480f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d9480f" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-text-secondary, #786154)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  tick={{ fontSize: 11, fill: "var(--color-text-secondary, #786154)" }}
                />
                <Tooltip content={<CustomChartTooltip prefix="₹" />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Sales Revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#restroRevenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 (1 Col): Menu Category Breakdown Donut */}
        <div className="bg-surface rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-theme flex items-center gap-2">
              <Layers size={18} className="text-primary" />
              <span>Menu Category Mix</span>
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Item distribution across menu categories
            </p>
          </div>

          <div className="h-[210px] w-full relative my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip suffix=" Items" />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-theme">{totalMenuItems}</span>
              <span className="text-[10px] text-secondary font-bold uppercase">Active Dishes</span>
            </div>
          </div>

          {/* Legends */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-theme/60 text-xs">
            {categoryDistribution.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-secondary truncate">{item.name}:</span>
                <span className="font-bold text-theme ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Graphs: Peak Hours & Top Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Peak Dining Rush Hours */}
        <div className="bg-surface rounded-2xl border border-theme p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-theme flex items-center gap-2">
                <Clock size={18} className="text-amber-500" />
                <span>Peak Dining Rush Hours</span>
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Hourly order distribution (Lunch 12-2 PM vs. Dinner 8-10 PM)
              </p>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-text-secondary, #786154)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-text-secondary, #786154)" }}
                />
                <Tooltip content={<CustomChartTooltip suffix=" orders" />} />
                <Bar
                  dataKey="orders"
                  name="Orders Handled"
                  fill="#d9480f"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Best Selling Dishes List */}
        <div className="bg-surface rounded-2xl border border-theme overflow-hidden shadow-xs flex flex-col">
          <div className="p-4 border-b border-theme flex items-center justify-between bg-surface-secondary/30">
            <div>
              <h3 className="font-bold text-sm text-theme flex items-center gap-2">
                <Flame size={16} className="text-primary" />
                <span>Best-Selling Dishes (Popularity)</span>
              </h3>
              <p className="text-[11px] text-secondary">
                Top ordered dishes driving your menu revenue
              </p>
            </div>
            <Link
              to="/menu"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>Manage Menu</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-theme/60 flex-1">
            {topDishes.length === 0 ? (
              <div className="p-8 text-center text-secondary text-xs">
                No menu dish records found yet.
              </div>
            ) : (
              topDishes.map((dish, idx) => (
                <div
                  key={dish._id || idx}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-surface-secondary text-secondary text-xs font-black flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-theme truncate flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            dish.isVegetarian ? "bg-green-600" : "bg-red-600"
                          }`}
                          title={dish.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
                        />
                        <span>{dish.name}</span>
                      </p>
                      <p className="text-[11px] text-secondary truncate mt-0.5">
                        {dish.category} • ₹{dish.price}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-theme">
                      {dish.salesCount} orders
                    </span>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      ₹{(dish.salesCount * dish.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Actionable Floor Ops: Live Occupied Tables & Recent KOT Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Live Occupied Dining Tables */}
        <div className="bg-surface rounded-2xl border border-theme overflow-hidden shadow-xs flex flex-col">
          <div className="p-4 border-b border-theme flex items-center justify-between bg-surface-secondary/30">
            <div>
              <h3 className="font-bold text-sm text-theme flex items-center gap-2">
                <ChefHat size={16} className="text-primary" />
                <span>Live Table Sessions (Floor Map)</span>
              </h3>
              <p className="text-[11px] text-secondary">
                Diners currently seated with active orders
              </p>
            </div>
            <Link
              to="/tables"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>View Floor Map</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-theme/60 flex-1">
            {activeSessions.length === 0 ? (
              <div className="p-8 text-center text-secondary text-xs">
                No active dining sessions right now. Tables are open for seating!
              </div>
            ) : (
              activeSessions.map((s) => (
                <div
                  key={s._id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-secondary/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-theme truncate flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-black text-[11px]">
                        {s.tableName}
                      </span>
                      <span>{s.customerName}</span>
                    </p>
                    <p className="text-[11px] text-secondary truncate mt-1">
                      {s.itemCount} item(s) ordered • Seated {s.elapsedMins} mins ago
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-xs text-theme">
                      ₹{s.totalAmount.toLocaleString()}
                    </p>
                    <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mt-0.5 bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      Dining Active
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Table 2: Recent Kitchen Order Tickets (KOT) */}
        <div className="bg-surface rounded-2xl border border-theme overflow-hidden shadow-xs flex flex-col">
          <div className="p-4 border-b border-theme flex items-center justify-between bg-surface-secondary/30">
            <div>
              <h3 className="font-bold text-sm text-theme flex items-center gap-2">
                <UtensilsCrossed size={16} className="text-emerald-600" />
                <span>Recent Kitchen Order Tickets</span>
              </h3>
              <p className="text-[11px] text-secondary">
                Latest orders received from customer QR scans
              </p>
            </div>
            <Link
              to="/orders"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>View KOT Terminal</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-theme/60 flex-1">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-secondary text-xs">
                No orders received yet today.
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-secondary/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-theme truncate flex items-center gap-2">
                      <span className="font-bold text-primary">{order.tableName}</span>
                      <span className="text-secondary">•</span>
                      <span className="truncate">{order.itemsPreview}</span>
                    </p>
                    <p className="text-[10px] text-secondary mt-0.5">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-xs text-theme">
                      ₹{order.total.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                        order.status === "completed" || order.status === "served"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : order.status === "processing" || order.status === "cooking"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Customer Feedback Strip */}
      {recentReviews.length > 0 && (
        <div className="bg-surface rounded-2xl border border-theme overflow-hidden shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-theme flex items-center gap-2">
                <MessageSquare size={16} className="text-amber-500" />
                <span>Recent Customer Feedback</span>
              </h3>
              <p className="text-[11px] text-secondary">
                Diner ratings submitted directly through table QR codes
              </p>
            </div>
            <Link
              to="/reviews"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>Manage Reviews</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {recentReviews.map((rev) => (
              <div
                key={rev._id}
                className="p-3.5 rounded-xl border border-theme bg-surface-secondary/30 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-theme truncate">
                      {rev.customerName}
                    </span>
                    <span className="text-amber-500 text-xs font-bold">
                      {"★".repeat(rev.rating)}
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-1.5 line-clamp-2 italic leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-theme/60 text-[10px] text-secondary">
                  <span>{rev.tableName}</span>
                  <span>
                    {formatDistanceToNow(new Date(rev.submittedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
