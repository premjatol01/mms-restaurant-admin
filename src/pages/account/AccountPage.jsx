import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import SelectReact from "react-select";
import { toast } from "sonner";
import { accountApi } from "../../api/account.api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import FormSection from "../../components/ui/FormSection";
import {
  INDIAN_STATES,
  COUNTRY_OPTIONS,
  selectCustomStyles,
} from "../../constants/addressConstants";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'security'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Raw account data from API
  const [accountData, setAccountData] = useState(null);

  // Form states for Admin & Personal Address
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    line1: "",
    line2: "",
    area: "",
    landmark: "",
    city: "",
    state: "Rajasthan",
    pincode: "",
    country: "India",
  });

  const [formErrors, setFormErrors] = useState({});

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Fetch account data
  const loadAccount = async () => {
    try {
      setLoading(true);
      const res = await accountApi.getAccount();
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setAccountData(d);
        const addr = d.personalAddress || {};
        setFormData({
          name: d.name || "",
          email: d.email || "",
          mobile: d.phone || d.mobile || "",
          line1: addr.line1 || "",
          line2: addr.line2 || "",
          area: addr.area || "",
          landmark: addr.landmark || "",
          city: addr.city || "",
          state: addr.state || "Rajasthan",
          pincode: addr.pincode || "",
          country: addr.country || "India",
        });
      } else {
        toast.error("Failed to load account details");
      }
    } catch (err) {
      console.error("Error fetching account:", err);
      toast.error(err.response?.data?.message || "Failed to load account details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    }

    const cleanMobile = formData.mobile.replace(/\D/g, "");
    if (!cleanMobile) {
      errors.mobile = "Mobile number is required";
    } else if (cleanMobile.length !== 10) {
      errors.mobile = "Mobile number must be exactly 10 digits";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required";
    }
    if (!formData.state.trim()) {
      errors.state = "State is required";
    }
    if (!formData.pincode.trim()) {
      errors.pincode = "PIN Code is required";
    } else if (formData.country === "India" && !/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = "Please enter a valid 6-digit PIN code";
    }
    if (!formData.country.trim()) {
      errors.country = "Country is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveDetails = async (e) => {
    e?.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all compulsory fields correctly.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        mobile: formData.mobile.replace(/\D/g, ""),
        personalAddress: {
          line1: formData.line1.trim(),
          line2: formData.line2.trim(),
          area: formData.area.trim(),
          landmark: formData.landmark.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          country: formData.country.trim(),
        },
      };

      const res = await accountApi.updateAccount(payload);
      if (res.data?.success) {
        toast.success("Account details updated successfully!");
        setAccountData((prev) => ({
          ...prev,
          name: payload.name,
          mobile: payload.mobile,
          phone: payload.mobile,
          personalAddress: payload.personalAddress,
        }));

        // Update cached user in localStorage if name changed
        try {
          const stored = localStorage.getItem("restaurant_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.name = payload.name;
            localStorage.setItem("restaurant_user", JSON.stringify(parsed));
          }
        } catch {}
      } else {
        toast.error(res.data?.message || "Failed to update account");
      }
    } catch (err) {
      console.error("Error saving account:", err);
      toast.error(err.response?.data?.message || "Failed to update account details");
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    if (accountData) {
      const addr = accountData.personalAddress || {};
      setFormData({
        name: accountData.name || "",
        email: accountData.email || "",
        mobile: accountData.phone || accountData.mobile || "",
        line1: addr.line1 || "",
        line2: addr.line2 || "",
        area: addr.area || "",
        landmark: addr.landmark || "",
        city: addr.city || "",
        state: addr.state || "Rajasthan",
        pincode: addr.pincode || "",
        country: addr.country || "India",
      });
      setFormErrors({});
      toast.info("Changes reverted to saved details.");
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e?.preventDefault();
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await accountApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      if (res.data?.success) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordErrors({});
      } else {
        toast.error(res.data?.message || "Failed to change password");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const currentStateOption =
    INDIAN_STATES.find(
      (s) => s.value.toLowerCase() === (formData.state || "").toLowerCase()
    ) || (formData.state ? { value: formData.state, label: formData.state } : null);

  const currentCountryOption =
    COUNTRY_OPTIONS.find(
      (c) => c.value.toLowerCase() === (formData.country || "India").toLowerCase()
    ) || { value: formData.country || "India", label: formData.country || "India" };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 pt-2 animate-pulse">
        <div className="h-44 bg-surface rounded-2xl border border-theme p-6" />
        <div className="h-10 bg-surface rounded-xl border border-theme w-64" />
        <div className="h-96 bg-surface rounded-xl border border-theme" />
      </div>
    );
  }

  const initials = (accountData?.name || "Admin")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 pt-2">
      {/* Overview Card */}
      <div className="bg-surface rounded-2xl border border-theme p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[var(--color-primary-hover,#e03131)] text-white font-bold text-2xl flex items-center justify-center shadow-md flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-theme">
                  {accountData?.name || "Restaurant Administrator"}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  <ShieldCheck size={12} />
                  Restaurant Admin
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-secondary mt-2">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-primary" />
                  {accountData?.email || "N/A"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-primary" />
                  {accountData?.phone ? `+91 ${accountData.phone}` : "N/A"}
                </span>
                {accountData?.restaurant && (
                  <span className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-primary" />
                    {accountData.restaurant.name}
                    {accountData.restaurant.city ? ` (${accountData.restaurant.city})` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-theme">
            <span className="text-[11px] text-secondary">Assigned Portal</span>
            <span className="text-xs font-semibold text-theme px-2 py-0.5 rounded bg-primary-light/40 border border-theme">
              Tablly Restaurant Admin
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-theme pb-2">
        <button
          onClick={() => setActiveTab("details")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "details"
              ? "bg-primary text-white shadow-sm"
              : "text-secondary hover:text-theme hover:bg-primary-light/20"
          }`}
        >
          <User size={16} />
          Profile & Address
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "security"
              ? "bg-primary text-white shadow-sm"
              : "text-secondary hover:text-theme hover:bg-primary-light/20"
          }`}
        >
          <KeyRound size={16} />
          Security & Password
        </button>
      </div>

      {/* TAB 1: Profile & Address Details */}
      {activeTab === "details" && (
        <form onSubmit={handleSaveDetails} className="space-y-6">
          {/* Admin Info Section */}
          <FormSection
            title="Administrator Information"
            description="Personal contact and identity details (linked with Super Admin records)."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Administrator Name"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  error={formErrors.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex relative">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-theme bg-primary-light/20 text-theme text-sm select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) =>
                      handleFieldChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="9876543210"
                    className={`w-full px-3 py-2 rounded-r-lg border text-sm text-theme bg-surface focus:outline-none transition-colors ${
                      formErrors.mobile
                        ? "border-red-400 focus:border-red-500 ring-1 ring-red-200"
                        : "border-theme focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                    }`}
                  />
                </div>
                {formErrors.mobile ? (
                  <p className="text-xs text-red-500 mt-1">{formErrors.mobile}</p>
                ) : (
                  <p className="text-[11px] text-secondary mt-1">10-digit primary contact</p>
                )}
              </div>

              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  disabled
                  hint="Managed login identifier (read-only)"
                  className="bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
                />
              </div>
            </div>
          </FormSection>

          {/* Personal Address Details */}
          <FormSection
            title="Personal Address Details"
            description="Your personal residential or correspondence address."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="House / Building / Flat No."
                  placeholder="e.g. Shop 4 / Flat 12 / Plot 45"
                  value={formData.line1}
                  onChange={(e) => handleFieldChange("line1", e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Street Address / Road"
                  placeholder="e.g. 123 Food Street, MG Road"
                  value={formData.line2}
                  onChange={(e) => handleFieldChange("line2", e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Area / Locality"
                  placeholder="e.g. Shastri Nagar, Tilak Nagar"
                  value={formData.area}
                  onChange={(e) => handleFieldChange("area", e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Landmark"
                  placeholder="e.g. Opposite City Hospital"
                  value={formData.landmark}
                  onChange={(e) => handleFieldChange("landmark", e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="City"
                  required
                  placeholder="e.g. Barmer, Mumbai, Jaipur"
                  value={formData.city}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                  error={formErrors.city}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <SelectReact
                  options={INDIAN_STATES}
                  value={currentStateOption}
                  onChange={(opt) => handleFieldChange("state", opt?.value || "")}
                  placeholder="Select State"
                  styles={selectCustomStyles}
                  isClearable
                />
                {formErrors.state && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.state}</p>
                )}
              </div>

              <div>
                <Input
                  label="PIN Code"
                  required
                  maxLength={6}
                  placeholder="e.g. 344001 (6 digits)"
                  value={formData.pincode}
                  onChange={(e) =>
                    handleFieldChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  error={formErrors.pincode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <SelectReact
                  options={COUNTRY_OPTIONS}
                  value={currentCountryOption}
                  onChange={(opt) => handleFieldChange("country", opt?.value || "India")}
                  styles={selectCustomStyles}
                />
                {formErrors.country && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.country}</p>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-primary-light/10 border border-theme text-xs text-secondary flex items-start gap-2">
              <Sparkles size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span>
                City, State, PIN Code, and Country are mandatory. Other address fields can be left blank if not applicable.
              </span>
            </div>
          </FormSection>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleResetForm}
              disabled={saving}
            >
              <RotateCcw size={15} />
              Reset
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              <Save size={15} />
              Save Account Details
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: Security & Password */}
      {activeTab === "security" && (
        <form onSubmit={handleChangePassword} className="space-y-6">
          <FormSection
            title="Change Account Password"
            description="Update your administrator login password to keep your dashboard secure."
          >
            <div className="max-w-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme mb-1">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                      setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }));
                      if (passwordErrors.currentPassword) {
                        setPasswordErrors((prev) => ({ ...prev, currentPassword: "" }));
                      }
                    }}
                    placeholder="Enter current password"
                    className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm text-theme bg-surface focus:outline-none transition-colors ${
                      passwordErrors.currentPassword
                        ? "border-red-400 focus:border-red-500 ring-1 ring-red-200"
                        : "border-theme focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-theme cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }));
                      if (passwordErrors.newPassword) {
                        setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
                      }
                    }}
                    placeholder="Enter new password (min. 6 characters)"
                    className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm text-theme bg-surface focus:outline-none transition-colors ${
                      passwordErrors.newPassword
                        ? "border-red-400 focus:border-red-500 ring-1 ring-red-200"
                        : "border-theme focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-theme cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                      if (passwordErrors.confirmPassword) {
                        setPasswordErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }
                    }}
                    placeholder="Re-enter new password"
                    className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm text-theme bg-surface focus:outline-none transition-colors ${
                      passwordErrors.confirmPassword
                        ? "border-red-400 focus:border-red-500 ring-1 ring-red-200"
                        : "border-theme focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-theme cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Password security tips */}
            <div className="mt-6 p-4 rounded-xl bg-primary-light/10 border border-theme max-w-xl">
              <h4 className="text-xs font-semibold text-theme flex items-center gap-1.5 mb-2">
                <CheckCircle2 size={14} className="text-primary" />
                Password Recommendations
              </h4>
              <ul className="text-xs text-secondary space-y-1 list-disc pl-5">
                <li>Minimum of 6 characters in length.</li>
                <li>Use a mix of letters, numbers, and special symbols.</li>
                <li>Avoid repeating passwords used on other platforms.</li>
              </ul>
            </div>

            <div className="pt-4">
              <Button type="submit" variant="primary" loading={updatingPassword}>
                <KeyRound size={15} />
                Update Password
              </Button>
            </div>
          </FormSection>
        </form>
      )}
    </div>
  );
}
