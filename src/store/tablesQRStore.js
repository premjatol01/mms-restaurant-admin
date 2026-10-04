import { create } from "zustand";
import { tablesApi } from "../api/tables.api";

// Normalizes MongoDB _id to id
const norm = (doc) => {
  if (!doc) return doc;
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: ((_id?._id ?? _id)?.toString?.() || _id || rest.id) };
};

export const useTablesQRStore = create((set, get) => ({
  tables: [],
  qrCodes: [],
  qrTemplates: [],
  loading: false,
  error: null,
  loaded: false,
  templatesLoaded: false,

  fetchData: async () => {
    if (get().loaded) return;
    set({ loading: true, error: null });
    try {
      const [tablesRes, qrsRes] = await Promise.all([
        tablesApi.getTables(),
        tablesApi.getQRCodes()
      ]);
      set({ 
        tables: (tablesRes.data?.data || []).map(norm),
        qrCodes: (qrsRes.data?.data || []).map(norm),
        loading: false,
        loaded: true
      });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || "Failed to load tables data" });
    }
  },

  fetchQRTemplates: async () => {
    if (get().templatesLoaded) return;
    try {
      const res = await tablesApi.getQRTemplates();
      const templates = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      set({ 
        qrTemplates: templates.map(norm),
        templatesLoaded: true
      });
    } catch (err) {
      console.error("Failed to load QR templates", err);
    }
  },

  addTable: async (tableData) => {
    try {
      const res = await tablesApi.createTable(tableData);
      const newTable = norm(res.data?.data);
      // Refresh all to ensure sync of QR status
      await get().refreshData();
      return { table: newTable };
    } catch (err) {
      throw err;
    }
  },

  updateTable: async (id, data) => {
    try {
      await tablesApi.updateTable(id, data);
      await get().refreshData();
    } catch (err) {
      throw err;
    }
  },

  deleteTable: async (id) => {
    try {
      await tablesApi.deleteTable(id);
      set((state) => ({ tables: state.tables.filter((t) => t.id !== id) }));
      await get().refreshData();
    } catch (err) {
      throw err;
    }
  },

  assignQRToTable: async (tableId, qrCodeId) => {
    try {
      await tablesApi.updateTable(tableId, { qrCodeId });
      await get().refreshData();
      return true;
    } catch (err) {
      return false;
    }
  },

  unassignQRFromTable: async (tableId) => {
    try {
      await tablesApi.updateTable(tableId, { qrCodeId: null });
      await get().refreshData();
      return true;
    } catch (err) {
      return false;
    }
  },

  assignQR: (qrId, tableId) => get().assignQRToTable(tableId, qrId),
  unassignQR: (qrId) => {
    const qr = get().qrCodes.find((q) => q.id === qrId);
    return qr?.tableId ? get().unassignQRFromTable(qr.tableId) : false;
  },

  generateQRCodes: async (count, templateId) => {
    try {
      const res = await tablesApi.generateQRCodes(count, templateId);
      await get().refreshData();
      return (res.data?.data || []).map(norm);
    } catch (err) {
      throw err;
    }
  },

  deleteQRCode: async (id) => {
    try {
      await tablesApi.deleteQRCode(id);
      await get().refreshData();
    } catch (err) {
      throw err;
    }
  },

  refreshData: async () => {
    try {
      const [tablesRes, qrsRes] = await Promise.all([
        tablesApi.getTables(),
        tablesApi.getQRCodes()
      ]);
      set({ 
        tables: (tablesRes.data?.data || []).map(norm),
        qrCodes: (qrsRes.data?.data || []).map(norm),
      });
    } catch (err) {
      console.error("Failed to refresh data", err);
    }
  }
}));
