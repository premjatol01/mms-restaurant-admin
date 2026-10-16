import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// SVG Pin Icon with drop shadow for crisp rendering on any resolution
const createCustomPinIcon = () => {
  return L.divIcon({
    className: "custom-leaflet-pin",
    html: `
      <div style="position: relative; width: 34px; height: 42px; transform: translate(-17px, -42px); cursor: grab;">
        <svg viewBox="0 0 24 32" width="34" height="42" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#e11d48" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

export default function LocationMapPicker({
  latitude,
  longitude,
  onChange,
  height = "380px",
  interactive = true,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const numLat = parseFloat(latitude);
  const numLng = parseFloat(longitude);
  const hasValidCoords = !isNaN(numLat) && !isNaN(numLng) && numLat !== 0 && numLng !== 0;

  // Track latest coordinates to avoid unnecessary re-centering or snap-backs
  const currentCoordsRef = useRef({ lat: null, lng: null });

  // Default fallback: coordinates or India center
  const centerLat = hasValidCoords ? numLat : 20.5937;
  const centerLng = hasValidCoords ? numLng : 78.9629;
  const initialZoom = hasValidCoords ? 15 : 5;

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [centerLat, centerLng],
      zoom: initialZoom,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;

    // Ensure map tiles properly render if container is sized asynchronously
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Initial marker if coordinates exist
    if (hasValidCoords) {
      currentCoordsRef.current = { lat: numLat, lng: numLng };
      const pinIcon = createCustomPinIcon();
      const marker = L.marker([numLat, numLng], {
        icon: pinIcon,
        draggable: interactive,
      }).addTo(map);

      marker.bindTooltip("📍 Drag pin to exact location", {
        permanent: false,
        direction: "top",
        offset: [0, -36],
      });

      if (interactive) {
        marker.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          const newLat = pos.lat.toFixed(6);
          const newLng = pos.lng.toFixed(6);
          currentCoordsRef.current = { lat: parseFloat(newLat), lng: parseFloat(newLng) };
          onChangeRef.current?.(newLat, newLng);
        });
      }

      markerRef.current = marker;
    }

    // Map click listener: place or move pin
    if (interactive) {
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        const newLat = lat.toFixed(6);
        const newLng = lng.toFixed(6);
        currentCoordsRef.current = { lat: parseFloat(newLat), lng: parseFloat(newLng) };

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const pinIcon = createCustomPinIcon();
          const marker = L.marker([lat, lng], {
            icon: pinIcon,
            draggable: true,
          }).addTo(map);

          marker.bindTooltip("📍 Drag pin to exact location", {
            permanent: false,
            direction: "top",
            offset: [0, -36],
          });

          marker.on("dragend", (event) => {
            const pos = event.target.getLatLng();
            const dLat = pos.lat.toFixed(6);
            const dLng = pos.lng.toFixed(6);
            currentCoordsRef.current = { lat: parseFloat(dLat), lng: parseFloat(dLng) };
            onChangeRef.current?.(dLat, dLng);
          });

          markerRef.current = marker;
        }

        onChangeRef.current?.(newLat, newLng);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker position and fly map when coordinates change externally (e.g. from "Search on Map")
  useEffect(() => {
    if (!mapRef.current || !hasValidCoords) return;

    // Skip if coordinates haven't changed from what map already has
    if (
      currentCoordsRef.current.lat !== null &&
      Math.abs(currentCoordsRef.current.lat - numLat) < 0.00001 &&
      Math.abs(currentCoordsRef.current.lng - numLng) < 0.00001
    ) {
      return;
    }

    currentCoordsRef.current = { lat: numLat, lng: numLng };

    if (markerRef.current) {
      markerRef.current.setLatLng([numLat, numLng]);
    } else {
      const pinIcon = createCustomPinIcon();
      const marker = L.marker([numLat, numLng], {
        icon: pinIcon,
        draggable: interactive,
      }).addTo(mapRef.current);

      marker.bindTooltip("📍 Drag pin to exact location", {
        permanent: false,
        direction: "top",
        offset: [0, -36],
      });

      if (interactive) {
        marker.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          const newLat = pos.lat.toFixed(6);
          const newLng = pos.lng.toFixed(6);
          currentCoordsRef.current = { lat: parseFloat(newLat), lng: parseFloat(newLng) };
          onChangeRef.current?.(newLat, newLng);
        });
      }

      markerRef.current = marker;
    }

    mapRef.current.flyTo([numLat, numLng], 16, { duration: 1.0 });
  }, [numLat, numLng, hasValidCoords, interactive]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-theme shadow-sm">
      <div
        ref={containerRef}
        style={{ height, width: "100%", zIndex: 10 }}
        className="cursor-crosshair"
      />
    </div>
  );
}
