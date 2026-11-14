import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Pencil,
  Power,
  Trash2,
  Eye,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useStaffStore } from "../../store/staffStore";
import { useSubscriptionPlan } from "../../hooks/useSubscriptionPlan";
import FeatureLockedScreen from "../../components/FeatureLockedScreen";
import Button from "../../components/ui/Button";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import InviteMemberModal from "./components/InviteMemberModal";
import MemberDetailsDrawer from "./components/MemberDetailsDrawer";
import InvitationEmailModal from "./components/InvitationEmailModal";
import StaffActionsMenu from "./components/StaffActionsMenu";
import RolesMatrixTab from "./components/RolesMatrixTab";

function formatDate(dateStr) {
  if (!dateStr) return "Never";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function StaffPage() {
  const { hasFeature } = useSubscriptionPlan();

  // Guard check: Multi-Staff & Role Access Control is an Enterprise Plan capability
  if (!hasFeature("multi_staff")) {
    return (
      <FeatureLockedScreen
        featureKey="multi_staff"
        title="Multi-Staff & Role Access Control (RBAC)"
        description="Invite restaurant managers, kitchen chefs, waiters, and cashiers with custom permissions and email-based activation links."
        requiredTier="Enterprise Plan"
      />
    );
  }

  const {
    staffMembers,
    roles,
    searchQuery,
    roleFilter,
    statusFilter,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    resendActivationEmail,
    toggleMemberStatus,
    deleteMember,
  } = useStaffStore();

  const [activeTab, setActiveTab] = useState("members"); // 'members' | 'roles'
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [emailPreviewMember, setEmailPreviewMember] = useState(null);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState(null);

  // Compute Stats
  const stats = useMemo(() => {
    const total = staffMembers.length;
    const active = staffMembers.filter((m) => m.status === "active").length;
    const pending = staffMembers.filter((m) => m.status === "pending_activation").length;
    const rolesCount = roles.length;
    return { total, active, pending, rolesCount };
  }, [staffMembers, roles]);

  // Filtered staff members
  const filteredStaff = useMemo(() => {
    return staffMembers.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q)) ||
        m.roleName.toLowerCase().includes(q);

      const matchRole = roleFilter === "all" || m.roleId === roleFilter;
      const matchStatus = statusFilter === "all" || m.status === statusFilter;

      return matchQuery && matchRole && matchStatus;
    });
  }, [staffMembers, searchQuery, roleFilter, statusFilter]);

  const handleResendActivation = async (member) => {
    try {
      await resendActivationEmail(member.id);
      toast.success(`🎉 Fresh activation email dispatched to ${member.email}! Link valid for 7 days.`);
    } catch (err) {
      toast.error(err.message || "Failed to resend activation email.");
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      const next = await toggleMemberStatus(member.id);
      toast.success(`${member.name}'s account is now ${next}.`);
      if (selectedMember?.id === member.id) {
        setSelectedMember((prev) => ({ ...prev, status: next }));
      }
    } catch (err) {
      toast.error(err.message || "Cannot change status.");
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Are you sure you want to remove ${member.name} from the staff roster?`)) return;
    try {
      await deleteMember(member.id);
      toast.success(`${member.name} has been removed.`);
      if (selectedMember?.id === member.id) setSelectedMember(null);
    } catch (err) {
      toast.error(err.message || "Failed to remove staff member.");
    }
  };

  const roleSelectOptions = [
    { value: "all", label: "All Roles" },
    ...roles.map((r) => ({ value: r.id, label: r.name })),
  ];

  const statusSelectOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "pending_activation", label: "Activation Pending" },
    { value: "inactive", label: "Suspended" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-surface rounded-xl border border-theme p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-secondary font-medium">Total Staff</p>
              <p className="text-xl font-black text-theme">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-theme p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-secondary font-medium">Active Logins</p>
              <p className="text-xl font-black text-theme">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-theme p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-secondary font-medium">Pending Activation</p>
              <p className="text-xl font-black text-theme">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-theme p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-xs text-secondary font-medium">Defined Roles</p>
              <p className="text-xl font-black text-theme">{stats.rolesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-theme bg-surface rounded-t-xl px-2">
        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "members"
              ? "border-primary text-primary"
              : "border-transparent text-secondary hover:text-theme"
          }`}
        >
          <Users size={16} />
          <span>Team Members ({staffMembers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "roles"
              ? "border-primary text-primary"
              : "border-transparent text-secondary hover:text-theme"
          }`}
        >
          <Shield size={16} />
          <span>Roles & RBAC Matrix ({roles.length})</span>
        </button>
      </div>

      {/* Tab 1: Team Members Roster */}
      {activeTab === "members" && (
        <div className="space-y-4">
          {/* Search & Filters Bar */}
          <div className="bg-surface rounded-xl border border-theme p-3.5 flex flex-col sm:flex-row gap-3 shadow-xs">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search staff by name, email, phone, or role..."
              />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Select
                value={roleFilter}
                onChange={setRoleFilter}
                options={roleSelectOptions}
                className="w-56 min-w-[210px]"
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusSelectOptions}
                className="w-48 min-w-[185px]"
              />
              <Button
                variant="primary"
                onClick={() => {
                  setEditingMember(null);
                  setShowInviteModal(true);
                }}
                className="shrink-0"
              >
                <UserPlus size={16} />
                <span>Invite Team Member</span>
              </Button>
            </div>
          </div>

          {/* Members Table */}
          {filteredStaff.length === 0 ? (
            <div className="bg-surface border border-theme rounded-xl p-8">
              <EmptyState
                title="No staff members found"
                description={
                  searchQuery || roleFilter !== "all" || statusFilter !== "all"
                    ? "No members match your selected filters. Try clearing filters to see the full team."
                    : "Invite your kitchen staff, waiters, floor managers, and cashiers to collaborate on Tablly."
                }
                actionLabel="+ Invite First Team Member"
                onAction={() => {
                  setEditingMember(null);
                  setShowInviteModal(true);
                }}
              />
            </div>
          ) : (
            <div className="bg-surface border border-theme rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse text-left">
                  <thead className="bg-primary-light/30 border-b border-theme sticky top-0 z-10 backdrop-blur-sm bg-surface/95">
                    <tr>
                      <th className="px-5 py-3.5 font-medium text-theme">Team Member</th>
                      <th className="px-4 py-3.5 font-medium text-theme">Role</th>
                      <th className="px-4 py-3.5 font-medium text-theme">Contact Phone</th>
                      <th className="px-4 py-3.5 font-medium text-theme">Account Status</th>
                      <th className="px-4 py-3.5 font-medium text-theme">Permissions</th>
                      <th className="px-4 py-3.5 font-medium text-theme">Last Login</th>
                      <th className="px-5 py-3.5 font-medium text-theme text-right w-20">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((member) => {
                      const isPending = member.status === "pending_activation";
                      const isActive = member.status === "active";
                      const roleObj = roles.find((r) => r.id === member.roleId);

                      return (
                        <tr
                          key={member.id}
                          className="border-b border-theme last:border-0 hover:bg-primary-light/10 transition-colors"
                        >
                          {/* Name & Email */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-primary/20 shrink-0">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-theme truncate">{member.name}</span>
                                  {member.isOwner && (
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-primary text-white">
                                      Owner
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-secondary truncate block">{member.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold border ${
                                roleObj?.badgeColor || "bg-primary-light text-primary border-primary/20"
                              }`}
                            >
                              <Shield size={12} />
                              {member.roleName}
                            </span>
                          </td>

                          {/* Contact Phone */}
                          <td className="px-4 py-3.5">
                            <span className="text-xs text-secondary font-mono">
                              {member.phone ? `+91 ${member.phone}` : "—"}
                            </span>
                          </td>

                          {/* Account Status / Email Activation */}
                          <td className="px-4 py-3.5">
                            {isPending ? (
                              <button
                                type="button"
                                onClick={() => setEmailPreviewMember(member)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
                                title="Click to preview activation email"
                              >
                                <Clock size={11} className="animate-spin" />
                                <span>Activation Pending</span>
                              </button>
                            ) : isActive ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30">
                                <CheckCircle2 size={11} />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-500/15 text-gray-700 dark:text-gray-300 border border-gray-500/30">
                                <span>Suspended</span>
                              </span>
                            )}
                          </td>

                          {/* Permissions */}
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => setSelectedMember(member)}
                              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                            >
                              <Layers size={12} />
                              <span>{member.permissions?.length || 0} modules</span>
                            </button>
                          </td>

                          {/* Last Login */}
                          <td className="px-4 py-3.5 text-xs text-secondary">
                            {formatDate(member.lastLoginAt)}
                          </td>

                          {/* Actions Three Dots Dropdown Menu */}
                          <td className="px-5 py-3.5 text-right whitespace-nowrap w-20">
                            <StaffActionsMenu
                              member={member}
                              onViewDetails={(m) => setSelectedMember(m)}
                              onEdit={(m) => {
                                setEditingMember(m);
                                setShowInviteModal(true);
                              }}
                              onResendActivation={(m) => handleResendActivation(m)}
                              onPreviewEmail={(m) => setEmailPreviewMember(m)}
                              onToggleStatus={(m) => handleToggleStatus(m)}
                              onDelete={(m) => handleDelete(m)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Roles & Permissions Matrix */}
      {activeTab === "roles" && <RolesMatrixTab />}

      {/* Modals & Slide-over Drawers */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setEditingMember(null);
        }}
        editingMember={editingMember}
      />

      <MemberDetailsDrawer
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        onEdit={(m) => {
          setSelectedMember(null);
          setEditingMember(m);
          setShowInviteModal(true);
        }}
        onResendActivation={(m) => handleResendActivation(m)}
        onToggleStatus={(m) => handleToggleStatus(m)}
        onDelete={(m) => handleDelete(m)}
        onPreviewEmail={(m) => setEmailPreviewMember(m)}
      />

      <InvitationEmailModal
        isOpen={Boolean(emailPreviewMember)}
        onClose={() => setEmailPreviewMember(null)}
        member={emailPreviewMember}
      />
    </div>
  );
}
