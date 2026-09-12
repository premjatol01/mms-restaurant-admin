import { useState } from "react";
import { X, Phone, Calendar, DollarSign, ShoppingBag, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useCustomersStore } from "../../../store/customersStore";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const tableNames = {
  "table-1": "Table 01",
  "table-2": "Table 02",
  "table-3": "Table 03",
  "table-4": "Table 04",
  "table-5": "Table 05",
  "table-6": "Table 06",
  "table-7": "Table 07",
  "table-8": "Table 08"
};

export default function CustomerDetailsDrawer({ customer, onClose }) {
  const { updateCustomerContact } = useCustomersStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editMobile, setEditMobile] = useState(customer.mobile || "");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { 
      day: "numeric", 
      month: "short", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleSave = () => {
    const trimmed = editMobile.trim();
    
    if (trimmed && !/^[+]?[\d\s-]{10,}$/.test(trimmed.replace(/\s/g, ""))) {
      toast.error("Please enter a valid mobile number.");
      return;
    }

    updateCustomerContact(customer.id, trimmed || null);
    setIsEditing(false);
    toast.success("Customer contact number updated successfully.");
  };

  const handleCancel = () => {
    setEditMobile(customer.mobile || "");
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-md h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
          <div>
            <h2 className="text-lg font-semibold text-theme">Customer Details</h2>
            <p className="text-sm text-secondary">{customer.displayName}</p>
          </div>
          <button onClick={onClose} className="p-1 text-secondary hover:text-theme rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="font-medium text-theme flex items-center gap-2">
              <Phone size={16} /> Contact Information
            </h3>
            
            {!isEditing ? (
              <div className="bg-primary-light/20 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-secondary mb-1">Mobile Number</p>
                    <p className="text-theme font-medium">
                      {customer.mobile || "Not provided"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-primary-light/20 rounded-lg p-4 space-y-3">
                <Input
                  label="Mobile Number"
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                />
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleCancel} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-light/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <ShoppingBag size={14} />
                <span className="text-xs">Total Orders</span>
              </div>
              <p className="text-xl font-bold text-theme">{customer.totalOrders}</p>
            </div>
            <div className="bg-primary-light/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <DollarSign size={14} />
                <span className="text-xs">Total Spent</span>
              </div>
              <p className="text-xl font-bold text-theme">₹{customer.totalSpent}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-light/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <Calendar size={14} />
                <span className="text-xs">First Order</span>
              </div>
              <p className="text-sm font-medium text-theme">
                {formatDate(customer.firstOrderAt)}
              </p>
            </div>
            <div className="bg-primary-light/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <Calendar size={14} />
                <span className="text-xs">Last Order</span>
              </div>
              <p className="text-sm font-medium text-theme">
                {formatDate(customer.lastOrderAt)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-theme">Order History</h3>
            <div className="space-y-2">
              {customer.orders.map((order) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center p-3 bg-primary-light/10 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-theme">{order.orderNumber}</p>
                    <p className="text-xs text-secondary">
                      {tableNames[order.tableId] || order.tableId} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <p className="font-medium text-theme">₹{order.amount}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              Customer contact numbers can be used to support future restaurant offers.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-theme">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}