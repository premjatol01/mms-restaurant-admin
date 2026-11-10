import { useState, useCallback, useEffect } from "react";
import Select from "react-select";
import { ExternalLink, LoaderCircle, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import Button from "../../../../components/ui/Button";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";
import FieldError from "../shared/FieldError";
import { checkboxClass } from "../shared/fieldStyles";
import { validateMap } from "../../utils/validation";
import { buildViewUrl, geocodeAddress, reverseGeocode, formatAddress } from "../../utils/maps";
import { useProfileStore } from "../../../../store/profileStore";
import LocationMapPicker from "./LocationMapPicker";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
].map((s) => ({ value: s, label: s }));

const COUNTRY_OPTIONS = [
  { value: "India", label: "India" },
  { value: "Other", label: "Other" }
];

const selectCustomStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "transparent",
    borderColor: state.isFocused ? "var(--color-primary, #f29191)" : "var(--color-border, #e2e8f0)",
    borderRadius: "0.5rem",
    minHeight: "38px",
    boxShadow: state.isFocused ? "0 0 0 1px var(--color-primary, #f29191)" : "none",
    "&:hover": {
      borderColor: "var(--color-primary, #f29191)",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "0.5rem",
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#f29191"
      : state.isFocused
      ? "rgba(242, 145, 145, 0.15)"
      : "transparent",
    color: state.isSelected ? "#ffffff" : "#1f2937",
    cursor: "pointer",
    fontSize: "0.875rem",
  }),
  singleValue: (base) => ({
    ...base,
    color: "inherit",
    fontSize: "0.875rem",
  }),
  input: (base) => ({
    ...base,
    color: "inherit",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
    fontSize: "0.875rem",
  }),
};

export default function MapEditor({ section, onSave, onCancel }) {
  const profile = useProfileStore((s) => s.profile);
  const profileAddr = profile?.address || profile?.detailedAddress || {};

  const [content, setContent] = useState(() => {
    const initialContent = section.content || {};
    const loc = initialContent.location || {};
    return {
      ...initialContent,
      location: {
        houseNumber: loc.houseNumber || loc.line1 || profileAddr.line1 || "",
        street: loc.street || loc.line2 || profileAddr.line2 || loc.addressLine || "",
        area: loc.area || profileAddr.area || "",
        landmark: loc.landmark || profileAddr.landmark || "",
        city: loc.city || profileAddr.city || "",
        state: loc.state || profileAddr.state || "Rajasthan",
        pincode: loc.pincode || profileAddr.pincode || "",
        country: loc.country || profileAddr.country || "India",
        latitude: loc.latitude || "",
        longitude: loc.longitude || ""
      }
    };
  });

  const [errors, setErrors] = useState({});
  const [searching, setSearching] = useState(false);
  const [pinnedPlaceName, setPinnedPlaceName] = useState("");

  // Sync from profile if initial location is empty
  useEffect(() => {
    if (profileAddr && Object.keys(profileAddr).length > 0) {
      setContent((prev) => {
        const cur = prev.location || {};
        if (!cur.city && !cur.street && !cur.houseNumber) {
          return {
            ...prev,
            location: {
              ...cur,
              houseNumber: profileAddr.line1 || cur.houseNumber || "",
              street: profileAddr.line2 || cur.street || "",
              area: profileAddr.area || cur.area || "",
              landmark: profileAddr.landmark || cur.landmark || "",
              city: profileAddr.city || cur.city || "",
              state: profileAddr.state || cur.state || "Rajasthan",
              pincode: profileAddr.pincode || cur.pincode || "",
              country: profileAddr.country || cur.country || "India",
            }
          };
        }
        return prev;
      });
    }
  }, [profileAddr]);

  const location = content.location || {};

  const setLocationField = (key) => (e) => {
    const val = typeof e === "string" ? e : e?.target?.value ?? "";
    setContent((c) => ({
      ...c,
      location: { ...c.location, [key]: val }
    }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleCoordinatesChange = useCallback(async (lat, lng, knownName = "") => {
    setContent((c) => ({
      ...c,
      location: {
        ...c.location,
        latitude: lat,
        longitude: lng
      }
    }));

    if (knownName) {
      setPinnedPlaceName(knownName);
    } else {
      try {
        const place = await reverseGeocode(lat, lng);
        if (place) setPinnedPlaceName(place);
      } catch (err) {
        // Ignore reverse geocode failures
      }
    }
  }, []);

  const handleSearchOnMap = async () => {
    const hasAnyAddress = [
      location.houseNumber,
      location.street,
      location.area,
      location.city,
      location.state,
      location.pincode
    ].some((v) => String(v ?? "").trim() !== "");

    if (!hasAnyAddress) {
      toast.error("Please enter house number, street, city or pincode first before searching on map");
      return;
    }

    setSearching(true);
    try {
      const result = await geocodeAddress(location);
      if (result) {
        handleCoordinatesChange(result.latitude, result.longitude, result.displayName);
        toast.success(`Location found: ${result.displayName.slice(0, 50)}...`);
      } else {
        toast.error(
          `Could not locate "${location.street || location.area || location.city}". Try entering city, state or pincode, or click directly on the map to place the pin.`
        );
      }
    } catch (err) {
      toast.error("Error searching location. Please click on the map to position the pin.");
    } finally {
      setSearching(false);
    }
  };

  const handleSave = () => {
    const loc = content.location || {};
    const houseNumber = String(loc.houseNumber || "").trim();
    const street = String(loc.street || "").trim();
    const area = String(loc.area || "").trim();
    const landmark = String(loc.landmark || "").trim();
    const city = String(loc.city || "").trim();
    const state = String(loc.state || "").trim();
    const pincode = String(loc.pincode || "").trim();
    const country = String(loc.country || "India").trim();

    const nextErrors = {};
    if (!city) {
      nextErrors.city = "City is required";
    }
    if (pincode && country === "India" && !/^\d{6}$/.test(pincode)) {
      nextErrors.pincode = "Please enter a valid 6-digit PIN code";
    }

    const fullAddressLine = [
      houseNumber,
      street,
      area,
      landmark ? `Near ${landmark}` : null
    ].filter(Boolean).join(", ");

    const updatedLocation = {
      ...loc,
      houseNumber,
      street,
      area,
      landmark,
      city,
      state,
      pincode,
      country,
      addressLine: fullAddressLine
    };

    const updatedContent = {
      ...content,
      location: updatedLocation
    };

    const combinedErrors = { ...validateMap(updatedContent), ...nextErrors };
    setErrors(combinedErrors);

    if (Object.keys(combinedErrors).length === 0) {
      onSave(updatedContent);

      // Keep Profile Module & Super Admin address in exact sync
      try {
        useProfileStore.getState().saveProfile({
          address: {
            line1: houseNumber,
            line2: street,
            area,
            landmark,
            city,
            state,
            pincode,
            country
          }
        });
      } catch (e) {
        console.warn("Could not sync address to profile store:", e);
      }
    }
  };

  const viewUrl = buildViewUrl(location);
  const isPinned = location.latitude && location.longitude;
  const currentStateOption = INDIAN_STATES.find((s) => s.value.toLowerCase() === (location.state || "").toLowerCase()) ||
    (location.state ? { value: location.state, label: location.state } : null);
  const currentCountryOption = COUNTRY_OPTIONS.find((c) => c.value.toLowerCase() === (location.country || "India").toLowerCase()) ||
    { value: location.country || "India", label: location.country || "India" };

  return (
    <EditorShell
      title="Map & Location Section"
      description="Show visitors your exact restaurant location with an interactive map and navigation"
      onBack={onCancel}
      onSave={handleSave}
    >
      <div>
        <Input
          label="Section Title"
          value={content.title || ""}
          onChange={(e) => setContent((c) => ({ ...c, title: e.target.value }))}
          placeholder="Find Us"
        />
        <FieldError message={errors.title} />
      </div>

      <Textarea
        label="Section Description"
        value={content.description || ""}
        onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
        placeholder="Visit us for lunch or dinner. We would love to see you."
        rows={2}
      />

      {/* Address Details Block */}
      <FormBlock
        title="Restaurant Address Details"
        description="Structured address fields matching your restaurant profile and invoice records."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="House / Building / Flat No."
              value={location.houseNumber || ""}
              onChange={setLocationField("houseNumber")}
              placeholder="e.g. Shop 4 / Flat 12 / Plot 45"
            />
            <FieldError message={errors.houseNumber} />
          </div>

          <div>
            <Input
              label="Street Address / Road"
              value={location.street || ""}
              onChange={setLocationField("street")}
              placeholder="e.g. Station Road, MG Marg"
            />
            <FieldError message={errors.street} />
          </div>

          <div>
            <Input
              label="Area / Locality"
              value={location.area || ""}
              onChange={setLocationField("area")}
              placeholder="e.g. Shastri Nagar, Tilak Nagar"
            />
            <FieldError message={errors.area} />
          </div>

          <div>
            <Input
              label="Landmark"
              value={location.landmark || ""}
              onChange={setLocationField("landmark")}
              placeholder="e.g. Opposite City Hospital"
            />
            <FieldError message={errors.landmark} />
          </div>

          <div>
            <Input
              label="City"
              value={location.city || ""}
              onChange={setLocationField("city")}
              placeholder="e.g. Barmer, Jaipur"
            />
            <FieldError message={errors.city} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme mb-1.5">
              State
            </label>
            <Select
              options={INDIAN_STATES}
              value={currentStateOption}
              onChange={(opt) => setLocationField("state")(opt?.value || "")}
              placeholder="Select State"
              styles={selectCustomStyles}
              isClearable
            />
            <FieldError message={errors.state} />
          </div>

          <div>
            <Input
              label="PIN Code"
              value={location.pincode || ""}
              onChange={setLocationField("pincode")}
              placeholder="e.g. 344001 (6 digits)"
              maxLength={6}
            />
            <FieldError message={errors.pincode} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme mb-1.5">
              Country
            </label>
            <Select
              options={COUNTRY_OPTIONS}
              value={currentCountryOption}
              onChange={(opt) => setLocationField("country")(opt?.value || "India")}
              styles={selectCustomStyles}
            />
            <FieldError message={errors.country} />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSearchOnMap}
            disabled={searching}
          >
            {searching ? (
              <LoaderCircle size={16} className="animate-spin mr-2" />
            ) : (
              <Search size={16} className="mr-2" />
            )}
            Search on Map
          </Button>
        </div>
      </FormBlock>

      {/* Interactive Map with Draggable Pin */}
      <FormBlock
        title="Interactive Map Pin"
        description="Drag and drop the pin to your exact entrance or rooftop, or click anywhere on the map."
      >
        <LocationMapPicker
          latitude={location.latitude}
          longitude={location.longitude}
          onChange={handleCoordinatesChange}
          height="380px"
          interactive={true}
        />

        <div className="space-y-2 pt-2 text-xs">
          {isPinned ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                  <MapPin size={13} className="text-emerald-600" />
                  Pinned: {location.latitude}, {location.longitude}
                </span>
                <span className="text-secondary">Drag pin to adjust</span>
              </div>

              {viewUrl && (
                <a
                  href={viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-medium shrink-0"
                >
                  <ExternalLink size={13} />
                  Open in Google Maps
                </a>
              )}
            </div>
          ) : (
            <span className="text-secondary flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              Click "Search on Map" or click anywhere on the map to place your pin.
            </span>
          )}

          {pinnedPlaceName && (
            <p className="text-secondary text-[11px] truncate" title={pinnedPlaceName}>
              📍 <strong>Location:</strong> {pinnedPlaceName}
            </p>
          )}
        </div>
      </FormBlock>

      {/* Options */}
      <FormBlock title="Website Display Settings">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={content.showDirections !== false}
            onChange={(e) => setContent((c) => ({ ...c, showDirections: e.target.checked }))}
            className={checkboxClass}
          />
          <span className="text-theme font-medium">Show "Get Directions" button on website</span>
        </label>
        <p className="text-xs text-secondary ml-6">
          When clicked by customers, opens turn-by-turn navigation in their native Google Maps / Apple Maps app.
        </p>
      </FormBlock>
    </EditorShell>
  );
}
