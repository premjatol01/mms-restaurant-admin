// Google Maps helpers. None of these need an API key.

const hasValue = (v) => String(v ?? "").trim() !== "";

export function hasCoordinates(location) {
  return hasValue(location?.latitude) && hasValue(location?.longitude);
}

export function formatAddress(location) {
  if (!location) return "";
  return [location.addressLine, location.city, location.state, location.pincode, location.country]
    .filter(hasValue)
    .map((v) => String(v).trim())
    .join(", ");
}

// What Google should search for: exact coordinates win over the typed address.
function getQuery(location) {
  if (hasCoordinates(location)) {
    return `${String(location.latitude).trim()},${String(location.longitude).trim()}`;
  }
  return formatAddress(location);
}

export function buildEmbedUrl(location, zoom = 15) {
  const query = getQuery(location);
  if (!query) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;
}

export function buildViewUrl(location) {
  const query = getQuery(location);
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "";
}

export function buildDirectionsUrl(location) {
  const query = getQuery(location);
  return query ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}` : "";
}

// Accepts either the full <iframe> HTML from Google Maps ("Share > Embed a map") or just its src link.
// Returns a safe Google Maps embed URL, or null when the input isn't one.
export function extractEmbedSrc(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  const fromIframe = raw.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  const candidate = (fromIframe ? fromIframe[1] : raw).replace(/&amp;/g, "&");

  try {
    const url = new URL(candidate);
    const allowedHosts = ["www.google.com", "google.com", "maps.google.com"];
    if (url.protocol !== "https:") return null;
    if (!allowedHosts.includes(url.hostname)) return null;
    if (!url.pathname.startsWith("/maps")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

// The URL the map iframe should load for a saved or draft map section.
export function getMapEmbedSrc(content) {
  if (content.mapSource === "embed") return extractEmbedSrc(content.embedUrl) ?? "";
  return buildEmbedUrl(content.location, content.zoom);
}
