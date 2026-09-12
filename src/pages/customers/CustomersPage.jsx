import { useState } from "react";
import { Users, User, Clock, RefreshCw } from "lucide-react";
import { useCustomersStore } from "../../store/customersStore";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import CustomerDetailsDrawer from "./components/CustomerDetailsDrawer";

function SummaryCards() {
  const { getStats } = useCustomersStore();
  const stats = getStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-surface rounded-xl border border-theme p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-secondary">Total Customers</p>
            <p className="text-xl font-bold text-theme">{stats.totalCustomers}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-theme p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <User className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-secondary">With Contact</p>
            <p className="text-xl font-bold text-theme">{stats.withContact}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-theme p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Clock className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-secondary">Recent Customers</p>
            <p className="text-xl font-bold text-theme">{stats.recentCustomers}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-theme p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <RefreshCw className="text-amber-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-secondary">Returning Customers</p>
            <p className="text-xl font-bold text-theme">{stats.returningCustomers}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerTable({ customers, onViewCustomer }) {
  const getStatusBadge = (status) => {
    const styles = {
      new: "bg-blue-100 text-blue-700",
      returning: "bg-green-100 text-green-700"
    };
    const labels = { new: "New", returning: "Returning" };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="overflow-x-auto border border-theme rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-primary-light/30 border-b border-theme">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-theme">Customer</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Mobile</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Orders</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Total Spent</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Last Order</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Status</th>
            <th className="text-right px-4 py-3 font-medium text-theme">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10">
              <td className="px-4 py-3 font-medium text-theme">{customer.displayName}</td>
              <td className="px-4 py-3 text-secondary">
                {customer.mobile ? (
                  <span>{customer.mobile}</span>
                ) : (
                  <span className="text-gray-400">Not provided</span>
                )}
              </td>
              <td className="px-4 py-3 text-theme">{customer.totalOrders}</td>
              <td className="px-4 py-3 font-medium text-theme">₹{customer.totalSpent}</td>
              <td className="px-4 py-3 text-secondary">{formatDate(customer.lastOrderAt)}</td>
              <td className="px-4 py-3">{getStatusBadge(customer.status)}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onViewCustomer(customer)}
                  className="text-primary hover:underline text-sm"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerCard({ customer, onViewCustomer }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="bg-surface border border-theme rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-theme">{customer.displayName}</h3>
          <p className="text-sm text-secondary">
            {customer.mobile || "No contact"}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          customer.status === "returning" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
        }`}>
          {customer.status === "returning" ? "Returning" : "New"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-secondary">Orders</p>
          <p className="font-medium text-theme">{customer.totalOrders}</p>
        </div>
        <div>
          <p className="text-secondary">Total Spent</p>
          <p className="font-medium text-theme">₹{customer.totalSpent}</p>
        </div>
        <div className="col-span-2">
          <p className="text-secondary">Last Order</p>
          <p className="font-medium text-theme">{formatDate(customer.lastOrderAt)}</p>
        </div>
      </div>

      <button
        onClick={() => onViewCustomer(customer)}
        className="w-full py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary-light/20 transition-colors"
      >
        View Details
      </button>
    </div>
  );
}

export default function CustomersPage() {
  const { customers } = useCustomersStore();
  const [search, setSearch] = useState("");
  const [contactFilter, setContactFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = customers.filter((customer) => {
    const matchSearch = !search ||
      customer.displayName.toLowerCase().includes(search.toLowerCase()) ||
      customer.mobile?.includes(search);
    
    const matchContact = !contactFilter ||
      (contactFilter === "with-contact" && customer.mobile) ||
      (contactFilter === "no-contact" && !customer.mobile);
    
    const matchActivity = !activityFilter ||
      (activityFilter === "recent" && new Date(customer.lastOrderAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (activityFilter === "returning" && customer.totalOrders > 1) ||
      (activityFilter === "new" && customer.totalOrders === 1);

    return matchSearch && matchContact && matchActivity;
  });

  const clearFilters = () => {
    setSearch("");
    setContactFilter("");
    setActivityFilter("");
  };

  const hasFilters = search || contactFilter || activityFilter;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-theme">Customers</h1>
        <p className="text-sm text-secondary">
          View and manage customers who have provided their contact number through orders.
        </p>
      </div>

      <SummaryCards />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search customers..."
            />
          </div>
          <Select
            value={contactFilter}
            onChange={setContactFilter}
            options={[
              { value: "", label: "All Contact" },
              { value: "with-contact", label: "Contact Available" },
              { value: "no-contact", label: "No Contact" }
            ]}
            className="w-full sm:w-40"
          />
          <Select
            value={activityFilter}
            onChange={setActivityFilter}
            options={[
              { value: "", label: "All Activity" },
              { value: "recent", label: "Recent" },
              { value: "returning", label: "Returning" },
              { value: "new", label: "New" }
            ]}
            className="w-full sm:w-36"
          />
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-primary hover:underline">
            Clear filters
          </button>
        )}

        {!customers.length ? (
          <EmptyState
            title="No customers yet"
            description="Customers will appear here when customers provide their contact information while placing orders."
          />
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-secondary">No customers match your filters.</div>
        ) : (
          <>
            <div className="hidden md:block">
              <CustomerTable customers={filteredCustomers} onViewCustomer={setSelectedCustomer} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onViewCustomer={setSelectedCustomer}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {selectedCustomer && (
        <CustomerDetailsDrawer
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}