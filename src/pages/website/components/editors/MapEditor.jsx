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
import { INDIAN_STATES, COUNTRY_OPTIONS, selectCustomStyles } from "../../../../constants/addressConstants";

export default function MapEditor({ section, onSave, onCancel }) {
  const profile = useProfileStore((s) => s.profile);
  const profileAddr = profile?.address || profile?.detailedAddress || {};

  const [content, setContent] = useState(() => {
    const initialContent = section.content || {};
    const loc = initialContent.location || {};
    return {
      ...initialContent,
      location: {
        houseNumber: loc.houseNumber !== undefined ? loc.houseNumber : (loc.line1 !== undefined ? loc.line1 : (profileAddr.line1 || "")),
        street: loc.street !== undefined ? loc.street : (loc.line2 !== undefined ? loc.line2 : (profileAddr.line2 !== undefined ? profileAddr.line2 : "")),
        area: loc.area !== undefined ? loc.area : (profileAddr.area || ""),
        landmark: loc.landmark !== undefined ? loc.landmark : (profileAddr.landmark || ""),
        city: loc.city !== undefined ? loc.city : (profileAddr.city || ""),
        state: loc.state !== undefined ? loc.state : (profileAddr.state || "Rajasthan"),
        pincode: loc.pincode !== undefined ? loc.pincode : (profileAddr.pincode || ""),
        country: loc.country !== undefined ? loc.country : (profileAddr.country || "India"),
        latitude: loc.latitude || "",
        longitude: loc.longitude || ""
      }
    };
  });

  const [errors, setErrors] = useState({});
  const [searching, setSearching] = useState(false);
  const [pinnedPlaceName, setPinnedPlaceName] = useState("");

  // Sync from profile only if initial location is completely uninitialized
  useEffect(() => {
    if (profileAddr && Object.keys(profileAddr).length > 0) {
      setContent((prev) => {
        const cur = prev.location || {};
        if (!cur.city && !cur.pincode) {
          return {
            ...prev,
            location: {
              ...cur,
              houseNumber: profileAddr.line1 || cur.houseNumber || "",
              street: profileAddr.line2 !== undefined ? profileAddr.line2 : (cur.street || ""),
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
    const houseNumber = String(loc.houseNumber !== undefined ? loc.houseNumber : (loc.line1 || "")).trim();
    const street = String(loc.street !== undefined ? loc.street : (loc.line2 || "")).trim();
    const area = String(loc.area || "").trim();
    const landmark = String(loc.landmark || "").trim();
    const city = String(loc.city || "").trim();
    const state = String(loc.state || "").trim();
    const pincode = String(loc.pincode || "").trim();
    const country = String(loc.country || "India").trim();

    const fullAddressLine = [
      houseNumber,
      street,
      area,
      landmark ? `Near ${landmark}` : null,
      city,
      state,
      pincode,
      country
    ].filter(Boolean).join(", ");

    const updatedLocation = {
      ...loc,
      houseNumber,
      line1: houseNumber,
      street,
      line2: street,
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

    const validationErrors = validateMap(updatedContent);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSave(updatedContent);
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
            <label className="block text-xs font-semibold text-theme mb-1.5">
              City <span className="text-red-500">*</span>
            </label>
            <Input
              value={location.city || ""}
              onChange={setLocationField("city")}
              placeholder="e.g. Barmer, Jaipur"
            />
            <FieldError message={errors.city} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme mb-1.5">
              State <span className="text-red-500">*</span>
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
            <label className="block text-xs font-semibold text-theme mb-1.5">
              PIN Code <span className="text-red-500">*</span>
            </label>
            <Input
              value={location.pincode || ""}
              onChange={(e) => setLocationField("pincode")(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="e.g. 344001 (6 digits)"
              maxLength={6}
            />
            <FieldError message={errors.pincode} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme mb-1.5">
              Country <span className="text-red-500">*</span>
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
