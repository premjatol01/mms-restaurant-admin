import React, { useState, useEffect } from "react";
import { UserPlus, Mail, Phone, Shield, Check, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { useStaffStore } from "../../../store/staffStore";
import { PERMISSION_GROUPS, PRESET_ROLES } from "../data/staffData";

export default function InviteMemberModal({ isOpen, onClose, editingMember = null, onSaved }) {
  const { roles, inviteMember, updateMember, loading } = useStaffStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("manager");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [error, setError] = useState("");

  const isEditing = Boolean(editingMember);

  // Sync state when opening or switching member
  useEffect(() => {
    if (isOpen) {
      setError("");
      if (editingMember) {
        setName(editingMember.name || "");
        setEmail(editingMember.email || "");
        setPhone(editingMember.phone || "");
        setRoleId(editingMember.roleId || "manager");
        setSelectedPermissions(editingMember.permissions || []);
      } else {
        setName("");
        setEmail("");
        setPhone("");
        setRoleId("manager");
        const defaultRole = roles.find((r) => r.id === "manager") || roles[1];
        setSelectedPermissions(defaultRole?.permissions || []);
      }
    }
  }, [isOpen, editingMember, roles]);

  // When role changes and not editing, update permissions to role default
  const handleRoleChange = (newRoleId) => {
    setRoleId(newRoleId);
    const found = roles.find((r) => r.id === newRoleId);
    if (found) {
      setSelectedPermissions(found.permissions || []);
    }
  };

  const handleTogglePermission = (permId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleToggleGroup = (group) => {
    const groupPermIds = group.permissions.map((p) => p.id);
    const allSelected = groupPermIds.every((id) => selectedPermissions.includes(id));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !groupPermIds.includes(id)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupPermIds])));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide the staff member's full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid staff email address for account activation.");
      return;
    }

    try {
      if (isEditing) {
        await updateMember(editingMember.id, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          roleId,
          permissions: selectedPermissions,
        });
        toast.success(`Updated ${name}'s profile and role permissions.`);
      } else {
        const created = await inviteMember({
          name,
          email,
          phone,
          roleId,
          permissions: selectedPermissions,
        });
        toast.success(`🎉 Invitation sent to ${created.email}! They can now activate their login.`);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to process member.");
    }
  };

  const roleOptions = roles.map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const selectedRoleObj = roles.find((r) => r.id === roleId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Team Member: ${editingMember?.name}` : "Invite New Team Member"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Basic Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Chandra"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Staff Email Address"
            type="email"
            placeholder="e.g. ramesh@restaurant.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helper="Activation invite link will be sent to this email"
            required
            disabled={isEditing && editingMember?.isOwner}
          />

          <Input
            label="Mobile Phone (Optional)"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div>
            <label className="text-xs font-medium text-theme block mb-1">
              Assigned Role <span className="text-red-500">*</span>
            </label>
            <Select
              value={roleId}
              onChange={handleRoleChange}
              options={roleOptions}
              disabled={isEditing && editingMember?.isOwner}
            />
          </div>
        </div>

        {/* Role Description Pill */}
        {selectedRoleObj && (
          <div className="p-3 bg-primary-light/20 border border-theme rounded-xl text-xs flex items-start gap-2.5">
            <Shield size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-theme">{selectedRoleObj.name}</p>
              <p className="text-secondary mt-0.5">{selectedRoleObj.description}</p>
            </div>
          </div>
        )}

        {/* Email Activation Explainer Banner */}
        {!isEditing && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs flex items-start gap-2.5 text-secondary">
            <Mail size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-theme">Email-Based Account Activation</p>
              <p className="text-[11px] leading-relaxed">
                We will dispatch an activation email containing a secure link. The staff member will open the link, choose their own password, and immediately be able to log in.
              </p>
            </div>
          </div>
        )}

        {/* Granular Permissions Matrix */}
        <div className="space-y-3 pt-2 border-t border-theme">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-theme uppercase tracking-wider">
              Role Permissions ({selectedPermissions.length} enabled)
            </label>
            <span className="text-[11px] text-secondary">Check or uncheck to customize</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {PERMISSION_GROUPS.map((group) => {
              const groupPermIds = group.permissions.map((p) => p.id);
              const groupActiveCount = groupPermIds.filter((id) => selectedPermissions.includes(id)).length;
              const allChecked = groupActiveCount === groupPermIds.length;

              return (
                <div key={group.group} className="border border-theme rounded-xl p-3 bg-surface-soft">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-theme/60">
                    <div>
                      <h5 className="text-xs font-bold text-theme">{group.group}</h5>
                      <p className="text-[10px] text-secondary">{group.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(group)}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      {allChecked ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.permissions.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? "border-primary/50 bg-primary-light/20 text-theme"
                              : "border-theme/60 bg-surface hover:border-primary/30 text-secondary"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.id)}
                            className="mt-0.5 rounded border-theme text-primary focus:ring-primary"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold block leading-tight">{perm.label}</span>
                            <span className="text-[10px] text-secondary block mt-0.5 leading-tight">{perm.description}</span>
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

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-theme">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={loading} disabled={loading}>
            {isEditing ? "Save Role Permissions" : "Send Activation Email & Invite"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
