// Map helpers & Geocoding utilities.

const hasValue = (v) => String(v ?? "").trim() !== "";

export function hasCoordinates(location) {
  return hasValue(location?.latitude) && hasValue(location?.longitude);
}

export function formatAddress(location) {
  if (!location) return "";
  const house = location.houseNumber || location.line1 || "";
  const street = location.street || location.line2 || location.addressLine || "";
  const area = location.area || "";
  const landmark = location.landmark ? `Near ${location.landmark}` : "";
  const city = location.city || "";
  const state = location.state || "";
  const pincode = location.pincode || "";
  const country = location.country || "India";

  return [house, street, area, landmark, city, state, pincode, country]
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

  const houseNumber = String(location.houseNumber || location.line1 || "").trim();
  const street = String(location.street || location.line2 || location.addressLine || "").trim();
  const area = String(location.area || "").trim();
  const landmark = String(location.landmark || "").trim();
  const city = String(location.city ?? "").trim();
  const state = String(location.state ?? "").trim();
  const pincode = String(location.pincode ?? "").trim();
  const country = String(location.country ?? "India").trim();

  const candidates = [];

  const streetDetails = [houseNumber, street, area].filter(hasValue).join(", ");

  // 1. Full combination if detailed address is provided
  const fullParts = [
    streetDetails,
    landmark ? `Near ${landmark}` : null,
    city,
    state,
    pincode,
    country
  ].filter(hasValue);
  if (fullParts.length > 0) {
    candidates.push(fullParts.join(", "));
  }

  // 2. street + city + state + country
  if (streetDetails && city) {
    candidates.push([streetDetails, city, state, country].filter(hasValue).join(", "));
  }

  // 3. area + city + state + country
  if (area && city) {
    candidates.push([area, city, state, country].filter(hasValue).join(", "));
  }

  // 4. landmark + city + state + country
  if (landmark && city) {
    candidates.push([landmark, city, state, country].filter(hasValue).join(", "));
  }

  // 5. Clean street (remove Shop/Flat/Plot prefix) + city + state + country
  if (street) {
    const cleanStreet = street
      .replace(/^(shop|flat|plot|room|door|house|no\.?|#)\s*[\d\w-]+\s*,?/i, "")
      .replace(/(near|opp|opposite|behind|beside)\s+[^,]*,?/i, "")
      .trim();

    if (cleanStreet && cleanStreet !== street && city) {
      candidates.push([cleanStreet, city, state, country].filter(hasValue).join(", "));
    }
  }

  // 6. Valid 6-digit Pincode with city/state (very accurate in India)
  if (pincode && /^\d{6}$/.test(pincode)) {
    if (city) {
      candidates.push([city, pincode, state, country].filter(hasValue).join(", "));
    }
    candidates.push(`${pincode}, ${country}`);
  }

  // 7. City + State + Country (e.g. Barmer, Rajasthan, India)
  if (city) {
    candidates.push([city, state, country].filter(hasValue).join(", "));
    candidates.push([city, country].filter(hasValue).join(", "));
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
