import { useState, useCallback } from "react";
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
import { buildViewUrl, geocodeAddress, reverseGeocode } from "../../utils/maps";
import LocationMapPicker from "./LocationMapPicker";

export default function MapEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content || {});
  const [errors, setErrors] = useState({});
  const [searching, setSearching] = useState(false);
  const [pinnedPlaceName, setPinnedPlaceName] = useState("");

  const location = content.location || {
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    latitude: "",
    longitude: ""
  };

  const setLocationField = (key) => (e) => {
    const val = e.target.value;
    setContent((c) => ({
      ...c,
      location: { ...c.location, [key]: val }
    }));
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
      // Fetch reverse geocoded place name asynchronously
      try {
        const place = await reverseGeocode(lat, lng);
        if (place) setPinnedPlaceName(place);
      } catch (err) {
        // Ignore reverse geocode failures silently
      }
    }
  }, []);

  const handleSearchOnMap = async () => {
    const hasAddress = [location.addressLine, location.city, location.state, location.pincode]
      .some((v) => String(v ?? "").trim() !== "");

    if (!hasAddress) {
      toast.error("Please enter street address, area or city first before searching on map");
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
          `Could not locate "${location.addressLine || location.city}". Try adding area/city name, or click directly on the map to place the pin.`
        );
      }
    } catch (err) {
      toast.error("Error searching location. Please click on the map to position the pin.");
    } finally {
      setSearching(false);
    }
  };

  const handleSave = () => {
    const next = validateMap(content);
    setErrors(next);
    if (Object.keys(next).length === 0) {
      onSave(content);
    }
  };

  const viewUrl = buildViewUrl(location);
  const isPinned = location.latitude && location.longitude;

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
        description="Enter your restaurant address details, then search to pin on map."
      >
        <div>
          <Input
            label="Street Address / Area / Landmark"
            value={location.addressLine || ""}
            onChange={setLocationField("addressLine")}
            placeholder="e.g. Linking Road, Bandra West or Sector 18"
          />
          <FieldError message={errors.addressLine} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="City"
            value={location.city || ""}
            onChange={setLocationField("city")}
            placeholder="e.g. Mumbai, Jaipur, Delhi"
          />
          <Input
            label="State"
            value={location.state || ""}
            onChange={setLocationField("state")}
            placeholder="e.g. Maharashtra, Rajasthan"
          />
          <Input
            label="PIN Code"
            value={location.pincode || ""}
            onChange={setLocationField("pincode")}
            placeholder="e.g. 400050"
          />
          <Input
            label="Country"
            value={location.country || "India"}
            onChange={setLocationField("country")}
            placeholder="India"
          />
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
