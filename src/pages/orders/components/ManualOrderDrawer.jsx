import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useOrdersStore } from "../../../store/ordersStore";
import { useMenuStore } from "../../../store/menuStore";
import Drawer from "../../../components/ui/Drawer";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import SearchInput from "../../../components/ui/SearchInput";

const tables = [
  { value: "table-1", label: "Table 01" },
  { value: "table-2", label: "Table 02" },
  { value: "table-3", label: "Table 03" },
  { value: "table-4", label: "Table 04" },
  { value: "table-5", label: "Table 05" },
  { value: "table-6", label: "Table 06" },
  { value: "table-7", label: "Table 07" },
  { value: "table-8", label: "Table 08" },
];

export default function ManualOrderDrawer({ isOpen, onClose }) {
  const { addOrder, sessions, getTableName } = useOrdersStore();
  const { menuItems } = useMenuStore();
  const [selectedTable, setSelectedTable] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [cart, setCart] = useState({});
  const [menuSearch, setMenuSearch] = useState("");

  const activeSession = sessions.find((s) => s.tableId === selectedTable && s.status === "active");

  const filteredMenuItems = useMemo(() => {
    if (!menuSearch) return menuItems;
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(menuSearch.toLowerCase())
    );
  }, [menuItems, menuSearch]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menuItems.find((m) => m.id === id);
        return item ? { ...item, quantity: qty } : null;
      })
      .filter(Boolean);
  }, [cart, menuItems]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQuantity = (itemId, delta) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      const newQty = Math.max(0, current + delta);
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleSubmit = () => {
    if (!selectedTable) {
      toast.error("Please select a table");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    addOrder({
      tableId: selectedTable,
      sessionId: activeSession?.id,
      source: "manual",
      customer: { mobile: customerMobile || null },
      items: cartItems.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: cartTotal,
      discount: 0,
      total: cartTotal,
    });

    toast.success("Manual order added successfully.");
    handleClose();
  };

  const handleClose = () => {
    setSelectedTable("");
    setCustomerMobile("");
    setCart({});
    setMenuSearch("");
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Add Manual Order" size="lg">
      <div className="space-y-6">
        {/* Table Selection */}
        <div>
          <Select
            label="Select Table"
            value={selectedTable}
            onChange={setSelectedTable}
            options={[{ value: "", label: "Select a table" }, ...tables]}
          />
          {selectedTable && activeSession && (
            <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">● Active Session</p>
              <p className="text-xs text-purple-600">Current Session Total: ₹{activeSession.total}</p>
              <p className="text-xs text-purple-600 mt-1">This order will add to the existing session.</p>
            </div>
          )}
          {selectedTable && !activeSession && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">○ No Active Session</p>
              <p className="text-xs text-green-600">This order will start a new table session.</p>
            </div>
          )}
        </div>

        {/* Customer Mobile */}
        <Input
          label="Customer Mobile"
          hint="Optional"
          placeholder="Enter mobile number"
          value={customerMobile}
          onChange={(e) => setCustomerMobile(e.target.value)}
        />

        {/* Menu Items */}
        <div className="space-y-3">
          <h3 className="font-medium text-theme">Add Items</h3>
          <SearchInput
            value={menuSearch}
            onChange={setMenuSearch}
            placeholder="Search menu items..."
          />
          <div className="space-y-2 max-h-64 overflow-y-auto border border-theme rounded-lg p-2">
            {filteredMenuItems.length === 0 ? (
              <p className="text-center text-secondary py-4">No menu items found.</p>
            ) : (
              filteredMenuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 hover:bg-primary-light/20 rounded">
                  <div>
                    <p className="text-sm font-medium text-theme">{item.name}</p>
                    <p className="text-xs text-secondary">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-full bg-gray-200 text-theme hover:bg-gray-300 flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm text-theme">{cart[item.id] || 0}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-full bg-primary text-white hover:bg-primary-light flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Summary */}
        {cartItems.length > 0 && (
          <div className="bg-primary-light/20 rounded-lg p-4">
            <h4 className="font-medium text-theme mb-3">Order Summary</h4>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-theme">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-theme">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-theme pt-2 flex justify-between font-medium">
                <span className="text-theme">Total</span>
                <span className="text-theme">₹{cartTotal}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-theme">
          <Button variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!selectedTable || cartItems.length === 0}
          >
            Add Order
          </Button>
        </div>
      </div>
    </Drawer>
  );
}