import { useState } from "react";
import { ExternalLink, LocateFixed, LoaderCircle, MapPin, RefreshCw } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import Button from "../../../../components/ui/Button";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";
import FieldError from "../shared/FieldError";
import { checkboxClass } from "../shared/fieldStyles";
import { validateMap } from "../../utils/validation";
import { buildViewUrl, getMapEmbedSrc } from "../../utils/maps";

const MAP_SOURCES = [
  {
    value: "location",
    title: "Use restaurant location",
    description: "Pin the map to the address or coordinates above"
  },
  {
    value: "embed",
    title: "Paste a Google Maps embed",
    description: "Use the embed code from Google Maps for full control"
  }
];

export default function MapEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content);
  const [errors, setErrors] = useState({});
  const [previewSrc, setPreviewSrc] = useState(() => getMapEmbedSrc(section.content));
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");

  const location = content.location;
  const setLocation = (key) => (e) =>
    setContent((c) => ({ ...c, location: { ...c.location, [key]: e.target.value } }));

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError("Your browser doesn't support location access. Enter the coordinates instead.");
      return;
    }
    setLocating(true);
    setLocateError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setContent((c) => ({
          ...c,
          location: {
            ...c.location,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }
        }));
        setLocating(false);
      },
      () => {
        setLocateError("Could not get your location. Allow location access in your browser or enter the coordinates.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = () => {
    const next = validateMap(content);
    setErrors(next);
    if (Object.keys(next).length === 0) onSave(content);
  };

  const viewUrl = buildViewUrl(location);

  return (
    <EditorShell
      title="Map & Location Section"
      description="Show visitors where to find your restaurant"
      onBack={onCancel}
      onSave={handleSave}
    >
      <div>
        <Input
          label="Section Title"
          value={content.title}
          onChange={(e) => setContent((c) => ({ ...c, title: e.target.value }))}
          placeholder="Find Us"
        />
        <FieldError message={errors.title} />
      </div>
      <Textarea
        label="Section Description"
        value={content.description}
        onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
        placeholder="Visit us for lunch or dinner."
        rows={2}
      />

      <FormBlock title="Restaurant location" description="Shown as the address under the map and used to place the pin">
        <div>
          <Input
            label="Street address"
            value={location.addressLine}
            onChange={setLocation("addressLine")}
            placeholder="123 Food Street"
          />
          <FieldError message={errors.addressLine} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="City" value={location.city} onChange={setLocation("city")} placeholder="Mumbai" />
          <Input label="State" value={location.state} onChange={setLocation("state")} placeholder="Maharashtra" />
          <Input label="PIN code" value={location.pincode} onChange={setLocation("pincode")} placeholder="400001" />
          <Input label="Country" value={location.country} onChange={setLocation("country")} placeholder="India" />
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-theme">Coordinates (optional)</p>
            <Button variant="secondary" size="sm" onClick={useCurrentLocation} disabled={locating}>
              {locating ? <LoaderCircle size={14} className="animate-spin" /> : <LocateFixed size={14} />}
              Use my current location
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input label="Latitude" value={location.latitude} onChange={setLocation("latitude")} placeholder="19.076090" />
              <FieldError message={errors.latitude} />
            </div>
            <div>
              <Input label="Longitude" value={location.longitude} onChange={setLocation("longitude")} placeholder="72.877426" />
              <FieldError message={errors.longitude} />
            </div>
          </div>
          <p className="text-xs text-secondary">Coordinates place the pin more precisely than the address. Right-click your restaurant in Google Maps to copy them.</p>
          <FieldError message={locateError} />
        </div>
      </FormBlock>

      <FormBlock title="Google Maps" description="Choose how the map is shown on your website">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Map source">
          {MAP_SOURCES.map((option) => {
            const selected = content.mapSource === option.value;
            return (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${
                  selected ? "border-primary bg-primary-soft" : "border-theme"
                }`}
              >
                <input
                  type="radio"
                  name="mapSource"
                  value={option.value}
                  checked={selected}
                  onChange={() => setContent((c) => ({ ...c, mapSource: option.value }))}
                  className="mt-1 accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium text-theme">{option.title}</span>
                  <span className="block text-xs text-secondary">{option.description}</span>
                </span>
              </label>
            );
          })}
        </div>

        {content.mapSource === "embed" ? (
          <div>
            <Textarea
              label="Google Maps embed code or link"
              value={content.embedUrl}
              onChange={(e) => setContent((c) => ({ ...c, embedUrl: e.target.value }))}
              placeholder='<iframe src="https://www.google.com/maps/embed?pb=..."></iframe>'
              rows={3}
            />
            <FieldError message={errors.embedUrl} />
            <p className="mt-1 text-xs text-secondary">
              In Google Maps, find your restaurant, select Share, then Embed a map, and copy the HTML.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-theme mb-1">
              Zoom level: <span className="text-secondary font-normal">{content.zoom}</span>
            </label>
            <input
              type="range"
              min={10}
              max={20}
              value={content.zoom}
              onChange={(e) => setContent((c) => ({ ...c, zoom: Number(e.target.value) }))}
              className="w-full max-w-xs accent-primary"
              aria-label="Zoom level"
            />
            <div className="flex justify-between max-w-xs text-xs text-secondary">
              <span>City</span>
              <span>Street</span>
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={content.showDirections}
            onChange={(e) => setContent((c) => ({ ...c, showDirections: e.target.checked }))}
            className={checkboxClass}
          />
          <span className="text-theme">Show a Get directions button</span>
        </label>
      </FormBlock>

      <FormBlock
        title="Preview"
        action={
          <Button variant="secondary" size="sm" onClick={() => setPreviewSrc(getMapEmbedSrc(content))}>
            <RefreshCw size={14} />
            Update preview
          </Button>
        }
      >
        {previewSrc ? (
          <div className="aspect-video w-full rounded-lg overflow-hidden border border-theme">
            <iframe
              src={previewSrc}
              title="Map preview"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="aspect-video w-full rounded-lg border-2 border-dashed border-theme flex flex-col items-center justify-center gap-2 text-center px-4">
            <MapPin size={24} className="text-primary" />
            <p className="text-sm text-secondary">Add an address or coordinates, then select Update preview.</p>
          </div>
        )}
        {content.mapSource === "location" && viewUrl && (
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink size={14} />
            Open in Google Maps
          </a>
        )}
      </FormBlock>
    </EditorShell>
  );
}
