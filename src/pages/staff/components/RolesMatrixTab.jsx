import React, { useState } from "react";
import { Shield, Check, Info, Save, RotateCcw, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useStaffStore } from "../../../store/staffStore";
import { PERMISSION_GROUPS } from "../data/staffData";
import Button from "../../../components/ui/Button";

export default function RolesMatrixTab() {
  const { roles, staffMembers, updateRolePermissions, resetDefaults } = useStaffStore();
  const [selectedRoleId, setSelectedRoleId] = useState("manager");

  const currentRole = roles.find((r) => r.id === selectedRoleId) || roles[0];
  const [rolePermissions, setRolePermissions] = useState(currentRole.permissions || []);
  const [isDirty, setIsDirty] = useState(false);

  // When switching roles, update local permission set
  const handleSelectRole = (rId) => {
    setSelectedRoleId(rId);
    const r = roles.find((x) => x.id === rId);
    if (r) {
      setRolePermissions(r.permissions || []);
      setIsDirty(false);
    }
  };

  const handleToggle = (permId) => {
    if (currentRole.isProtected) {
      toast.info("Restaurant Admin role has permanent full access to all capabilities.");
      return;
    }

    setRolePermissions((prev) => {
      const next = prev.includes(permId)
        ? prev.filter((p) => p !== permId)
        : [...prev, permId];
      setIsDirty(true);
      return next;
    });
  };

  const handleToggleGroup = (group) => {
    if (currentRole.isProtected) return;

    const groupIds = group.permissions.map((p) => p.id);
    const allActive = groupIds.every((id) => rolePermissions.includes(id));

    setRolePermissions((prev) => {
      const next = allActive
        ? prev.filter((id) => !groupIds.includes(id))
        : Array.from(new Set([...prev, ...groupIds]));
      setIsDirty(true);
      return next;
    });
  };

  const handleSave = () => {
    updateRolePermissions(selectedRoleId, rolePermissions);
    setIsDirty(false);
    toast.success(`Role permissions for "${currentRole.name}" updated successfully!`);
  };

  const countStaffWithRole = (rId) => {
    return staffMembers.filter((m) => m.roleId === rId).length;
  };

  return (
    <div className="space-y-6">
      {/* Role Picker Pills */}
      <div className="bg-surface rounded-xl border border-theme p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-theme">System Role Profiles</h3>
            <p className="text-xs text-secondary mt-0.5">Select a role to inspect and configure its capabilities</p>
          </div>
          <span className="text-xs text-secondary">{roles.length} Roles Defined</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {roles.map((r) => {
            const isSelected = selectedRoleId === r.id;
            const staffCount = countStaffWithRole(r.id);

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectRole(r.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-surface-soft border-theme hover:border-primary/40 text-theme"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Shield size={16} className={isSelected ? "text-white" : "text-primary"} />
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-surface text-secondary border border-theme"
                    }`}
                  >
                    {staffCount} {staffCount === 1 ? "staff" : "staff"}
                  </span>
                </div>
                <h4 className="text-xs font-bold truncate">{r.name}</h4>
                <p className={`text-[10px] mt-0.5 truncate ${isSelected ? "text-white/80" : "text-secondary"}`}>
                  {r.permissions?.length || 0} permissions
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Role Header & Action Banner */}
      <div className="bg-surface rounded-xl border border-theme p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-theme">{currentRole.name}</h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentRole.badgeColor}`}>
              {currentRole.id.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-secondary max-w-xl">{currentRole.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || currentRole.isProtected}
          >
            <Save size={14} />
            <span>{isDirty ? "Save Role Changes" : "Saved"}</span>
          </Button>
        </div>
      </div>

      {/* Permissions Matrix Table / Accordion */}
      <div className="space-y-4">
        {PERMISSION_GROUPS.map((group) => {
          const groupPermIds = group.permissions.map((p) => p.id);
          const activeCount = groupPermIds.filter((id) => rolePermissions.includes(id)).length;
          const allActive = activeCount === groupPermIds.length;

          return (
            <div key={group.group} className="bg-surface rounded-xl border border-theme overflow-hidden shadow-xs">
              <div className="p-4 bg-surface-soft border-b border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-theme">{group.group}</h5>
                    <span className="text-[11px] font-semibold text-secondary">
                      ({activeCount}/{group.permissions.length} active)
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5">{group.description}</p>
                </div>

                {!currentRole.isProtected && (
                  <button
                    type="button"
                    onClick={() => handleToggleGroup(group)}
                    className="text-xs font-semibold text-primary hover:underline text-left sm:text-right"
                  >
                    {allActive ? "Deselect All in Group" : "Select All in Group"}
                  </button>
                )}
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {group.permissions.map((perm) => {
                  const isChecked = rolePermissions.includes(perm.id);

                  return (
                    <label
                      key={perm.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? "border-primary/50 bg-primary-light/15 text-theme shadow-2xs"
                          : "border-theme bg-surface hover:border-primary/30 text-secondary"
                      } ${currentRole.isProtected ? "opacity-80 cursor-default" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={currentRole.isProtected}
                        onChange={() => handleToggle(perm.id)}
                        className="mt-0.5 rounded border-theme text-primary focus:ring-primary"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-theme block leading-tight">{perm.label}</span>
                        <span className="text-[11px] text-secondary block mt-1 leading-snug">{perm.description}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
