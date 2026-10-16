// Map helpers & Geocoding utilities.

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

function getQuery(location) {
  if (hasCoordinates(location)) {
    return `${String(location.latitude).trim()},${String(location.longitude).trim()}`;
  }
  return formatAddress(location);
}

export function buildViewUrl(location) {
  const query = getQuery(location);
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "";
}

export function buildDirectionsUrl(location) {
  if (hasCoordinates(location)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
  }
  const query = formatAddress(location);
  return query ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}` : "";
}

/**
 * Smart address geocoding with multi-tier candidate queries.
 * Prevents returning a generic city center when an exact address or area is searched.
 */
export async function geocodeAddress(location) {
  if (!location) return null;

  const addressLine = String(location.addressLine ?? "").trim();
  const city = String(location.city ?? "").trim();
  const state = String(location.state ?? "").trim();
  const pincode = String(location.pincode ?? "").trim();
  const country = String(location.country ?? "India").trim();

  const candidates = [];

  // 1. Full combination if address line is provided
  if (addressLine) {
    const fullParts = [addressLine, city, state, pincode, country].filter(hasValue);
    candidates.push(fullParts.join(", "));

    // 2. addressLine + city + country
    if (city) {
      candidates.push([addressLine, city, country].join(", "));
    }

    // 3. Clean addressLine (strip shop/flat/plot/floor numbers like 'Shop 4', 'Plot 12', '#45', 'Near X')
    const cleanStreet = addressLine
      .replace(/^(shop|flat|plot|room|door|house|no\.?|#)\s*[\d\w-]+\s*,?/i, "")
      .replace(/(near|opp|opposite|behind|beside)\s+[^,]*,?/i, "")
      .trim();

    if (cleanStreet && cleanStreet !== addressLine) {
      if (city) {
        candidates.push([cleanStreet, city, country].join(", "));
      } else {
        candidates.push([cleanStreet, country].join(", "));
      }
    }

    // 4. If addressLine contains comma-separated sub-areas (e.g. 'Shop 4, Linking Road, Bandra West')
    if (addressLine.includes(",")) {
      const segments = addressLine.split(",").map((s) => s.trim()).filter(Boolean);
      for (let i = segments.length - 1; i >= 0; i--) {
        const seg = segments[i];
        if (seg.length > 2 && !/^\d+$/.test(seg)) {
          if (city) {
            candidates.push([seg, city, country].join(", "));
          } else {
            candidates.push([seg, country].join(", "));
          }
        }
      }
    }

    // 5. addressLine by itself (in case user entered "Bandra West Mumbai" or landmark in the street field)
    candidates.push(addressLine);
    if (!addressLine.toLowerCase().includes(country.toLowerCase())) {
      candidates.push(`${addressLine}, ${country}`);
    }
  }

  // 6. Valid 6-digit Pincode (very accurate for neighborhood post offices in India)
  if (pincode && /^\d{6}$/.test(pincode)) {
    candidates.push(`${pincode}, ${country}`);
  }

  // 7. If no street address was provided at all, search city + state
  if (!addressLine && city) {
    candidates.push([city, state, country].filter(hasValue).join(", "));
  }

  // Deduplicate candidates preserving order
  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];

  for (const q of uniqueCandidates) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "TabllyRestaurantAdmin/1.0",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const item = data[0];
          return {
            latitude: parseFloat(item.lat).toFixed(6),
            longitude: parseFloat(item.lon).toFixed(6),
            displayName: item.display_name,
            matchedQuery: q,
          };
        }
      }
    } catch (err) {
      console.warn("Geocoding query error:", q, err);
    }
  }

  return null;
}

/**
 * Reverse geocodes coordinates into a human-readable place description.
 */
export async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return "";
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "TabllyRestaurantAdmin/1.0",
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.display_name || "";
    }
  } catch (err) {
    console.warn("Reverse geocode error:", err);
  }
  return "";
}
