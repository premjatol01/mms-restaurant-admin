import { create } from "zustand";
import { INITIAL_STAFF_MEMBERS, PRESET_ROLES } from "../pages/staff/data/staffData";

const STORAGE_KEY = "tablly_staff_members_v1";
const ROLES_STORAGE_KEY = "tablly_staff_roles_v1";

const loadStoredStaff = () => {
  if (typeof window === "undefined") return INITIAL_STAFF_MEMBERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_STAFF_MEMBERS;
  } catch {
    return INITIAL_STAFF_MEMBERS;
  }
};

const loadStoredRoles = () => {
  if (typeof window === "undefined") return PRESET_ROLES;
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : PRESET_ROLES;
  } catch {
    return PRESET_ROLES;
  }
};

export const useStaffStore = create((set, get) => ({
  staffMembers: loadStoredStaff(),
  roles: loadStoredRoles(),
  searchQuery: "",
  roleFilter: "all",
  statusFilter: "all",
  loading: false,

  setSearchQuery: (q) => set({ searchQuery: q }),
  setRoleFilter: (r) => set({ roleFilter: r }),
  setStatusFilter: (s) => set({ statusFilter: s }),

  // Save staff array to state and localStorage
  _persist: (newStaff) => {
    set({ staffMembers: newStaff });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStaff));
      } catch (e) {
        console.error("Failed to persist staff members", e);
      }
    }
  },

  // Save roles array to state and localStorage
  _persistRoles: (newRoles) => {
    set({ roles: newRoles });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(newRoles));
      } catch (e) {
        console.error("Failed to persist roles", e);
      }
    }
  },

  // Invite new member & generate activation token
  inviteMember: async ({ name, email, phone, roleId, permissions = [] }) => {
    set({ loading: true });
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 400));

    const existing = get().staffMembers.find(
      (m) => m.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      set({ loading: false });
      throw new Error(`A team member with email "${email}" already exists.`);
    }

    const role = get().roles.find((r) => r.id === roleId) || PRESET_ROLES[1];
    const finalPermissions = permissions.length > 0 ? permissions : role.permissions;

    const token = `act_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const newMember = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").replace(/\D/g, ""),
      roleId: role.id,
      roleName: role.name,
      status: "pending_activation",
      permissions: finalPermissions,
      invitedAt: new Date().toISOString(),
      activatedAt: null,
      lastLoginAt: null,
      activationToken: token,
      tokenExpiresAt: expiresAt.toISOString(),
      avatar: null,
      isOwner: false,
    };

    const updated = [newMember, ...get().staffMembers];
    get()._persist(updated);
    set({ loading: false });
    return newMember;
  },

  // Resend invitation & reset token expiration
  resendActivationEmail: async (memberId) => {
    set({ loading: true });
    await new Promise((r) => setTimeout(r, 350));

    const token = `act_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const updated = get().staffMembers.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          status: "pending_activation",
          invitedAt: new Date().toISOString(),
          activationToken: token,
          tokenExpiresAt: expiresAt.toISOString(),
        };
      }
      return m;
    });

    get()._persist(updated);
    set({ loading: false });
    return updated.find((m) => m.id === memberId);
  },

  // Edit existing member
  updateMember: async (memberId, updates) => {
    set({ loading: true });
    await new Promise((r) => setTimeout(r, 300));

    const role = updates.roleId
      ? get().roles.find((r) => r.id === updates.roleId)
      : null;

    const updated = get().staffMembers.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          ...updates,
          roleName: role ? role.name : m.roleName,
        };
      }
      return m;
    });

    get()._persist(updated);
    set({ loading: false });
    return updated.find((m) => m.id === memberId);
  },

  // Toggle active / inactive
  toggleMemberStatus: async (memberId) => {
    const member = get().staffMembers.find((m) => m.id === memberId);
    if (!member) return;
    if (member.isOwner) {
      throw new Error("Cannot deactivate primary restaurant administrator account.");
    }

    const nextStatus = member.status === "inactive" ? "active" : "inactive";
    const updated = get().staffMembers.map((m) =>
      m.id === memberId ? { ...m, status: nextStatus } : m
    );
    get()._persist(updated);
    return nextStatus;
  },

  // Delete member
  deleteMember: async (memberId) => {
    const member = get().staffMembers.find((m) => m.id === memberId);
    if (!member) return;
    if (member.isOwner) {
      throw new Error("Cannot delete primary restaurant administrator account.");
    }

    const updated = get().staffMembers.filter((m) => m.id !== memberId);
    get()._persist(updated);
  },

  // Update role permissions in matrix
  updateRolePermissions: (roleId, newPermissions) => {
    const updatedRoles = get().roles.map((r) =>
      r.id === roleId ? { ...r, permissions: newPermissions } : r
    );
    get()._persistRoles(updatedRoles);
  },

  // Reset to initial mock data
  resetDefaults: () => {
    get()._persist(INITIAL_STAFF_MEMBERS);
    get()._persistRoles(PRESET_ROLES);
  },
}));
