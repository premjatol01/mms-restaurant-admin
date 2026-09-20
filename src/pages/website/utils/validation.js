import { z } from "zod";
import {
  SUBDOMAIN_MIN,
  SUBDOMAIN_MAX,
  RESERVED_SUBDOMAINS,
  MAX_PURPOSE_OPTIONS
} from "./constants";
import { extractEmbedSrc } from "./maps";

const isBlank = (v) => !String(v ?? "").trim();

/* ---------- Subdomain ---------- */

const subdomainSchema = z
  .string()
  .min(SUBDOMAIN_MIN, `Use at least ${SUBDOMAIN_MIN} characters`)
  .max(SUBDOMAIN_MAX, `Use ${SUBDOMAIN_MAX} characters or fewer`)
  .regex(/^[a-z0-9-]+$/, "Use only lowercase letters, numbers and hyphens")
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Start and end with a letter or number")
  .refine((v) => !v.includes("--"), "Avoid two hyphens in a row")
  .refine((v) => !RESERVED_SUBDOMAINS.includes(v), "This name is reserved. Try another one");

// Returns an error message, or "" when the subdomain is valid.
export function validateSubdomain(slug) {
  if (isBlank(slug)) return "Enter a subdomain";
  const result = subdomainSchema.safeParse(slug);
  return result.success ? "" : result.error.issues[0].message;
}

/* ---------- Hero ---------- */

export function validateHero(content) {
  const errors = {};
  if (isBlank(content.heading)) errors.heading = "Enter a heading";
  if (isBlank(content.buttonText)) errors.buttonText = "Enter a label for the button";
  else if (content.buttonText.trim().length > 25) errors.buttonText = "Use 25 characters or fewer";
  return errors;
}

/* ---------- Map ---------- */

const inRange = (value, min, max) => {
  const n = Number(value);
  return !Number.isNaN(n) && n >= min && n <= max;
};

// Returns { fieldName: message }. An empty object means the content is valid.
export function validateMap(content) {
  const errors = {};
  const { location = {}, mapSource, embedUrl } = content;

  if (isBlank(content.title)) errors.title = "Enter a section title";

  const hasLat = !isBlank(location.latitude);
  const hasLng = !isBlank(location.longitude);
  if (hasLat && !inRange(location.latitude, -90, 90)) errors.latitude = "Latitude must be between -90 and 90";
  if (hasLng && !inRange(location.longitude, -180, 180)) errors.longitude = "Longitude must be between -180 and 180";
  if (hasLat && !hasLng && !errors.longitude) errors.longitude = "Enter longitude too";
  if (hasLng && !hasLat && !errors.latitude) errors.latitude = "Enter latitude too";

  if (mapSource === "embed") {
    if (isBlank(embedUrl)) {
      errors.embedUrl = "Paste the embed code or link from Google Maps";
    } else if (!extractEmbedSrc(embedUrl)) {
      errors.embedUrl = "This isn't a Google Maps embed. In Google Maps, use Share > Embed a map";
    }
  } else if (isBlank(location.addressLine) && !(hasLat && hasLng)) {
    errors.addressLine = "Enter the street address or the coordinates";
  }

  return errors;
}

/* ---------- Inquiry form ---------- */

export function validateInquiry(content) {
  const errors = {};
  if (isBlank(content.title)) errors.title = "Enter a section title";

  const enabledCount = Object.values(content.fields).filter((f) => f.enabled).length;
  if (enabledCount === 0) errors.fields = "Show at least one field on the form";

  if (content.fields.purpose?.enabled && content.purposeOptions.length === 0) {
    errors.purposeOptions = "Add at least one purpose option";
  }
  if (content.purposeOptions.length > MAX_PURPOSE_OPTIONS) {
    errors.purposeOptions = `Use ${MAX_PURPOSE_OPTIONS} options or fewer`;
  }
  return errors;
}

// Older data may store fields as plain booleans. This always returns { enabled, required }.
export function normalizeField(field) {
  if (typeof field === "boolean") return { enabled: field, required: false };
  return { enabled: field?.enabled ?? true, required: field?.required ?? false };
}
