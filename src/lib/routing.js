/**
 * routing.js — Helper untuk geocoding dan routing rute perjalanan
 * Menggunakan:
 *   - Nominatim (OpenStreetMap) untuk geocoding nama lokasi → koordinat
 *   - OSRM Public API untuk menghitung rute / polyline antar waypoint
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const OSRM_BASE = "https://router.project-osrm.org";

/**
 * Konversi nama lokasi ke koordinat {lat, lon}.
 * Mengembalikan null jika tidak ditemukan.
 * @param {string} locationName - Nama tempat, misal "Menara Eiffel, Paris"
 * @param {AbortSignal} [signal]
 * @returns {Promise<{lat: number, lon: number} | null>}
 */
export async function geocodeLocation(locationName, signal) {
  const name = String(locationName || "").trim();
  if (!name) return null;

  try {
    const url = `${NOMINATIM_BASE}/search?format=jsonv2&limit=1&q=${encodeURIComponent(name)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

/**
 * Geocode banyak lokasi sekaligus dengan throttle (1 request/detik agar tidak kena rate-limit Nominatim).
 * @param {string[]} locationNames
 * @param {(index: number) => void} [onProgress] - dipanggil setiap lokasi selesai di-geocode
 * @returns {Promise<Array<{lat: number, lon: number} | null>>}
 */
export async function geocodeMany(locationNames, onProgress) {
  const results = [];
  for (let i = 0; i < locationNames.length; i++) {
    const coord = await geocodeLocation(locationNames[i]);
    results.push(coord);
    if (onProgress) onProgress(i + 1);
    // Throttle: tunggu 1.1 detik antar request agar tidak kena rate-limit Nominatim
    if (i < locationNames.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }
  return results;
}

/**
 * Ambil rute dari OSRM antara waypoints yang diberikan.
 * @param {Array<{lat: number, lon: number}>} waypoints - minimal 2 titik
 * @returns {Promise<{ geometry: [number, number][], distance: number, duration: number } | null>}
 *   geometry: array of [lat, lon] pairs untuk Leaflet polyline
 *   distance: meter
 *   duration: detik
 */
export async function fetchOSRMRoute(waypoints) {
  if (!waypoints || waypoints.length < 2) return null;

  // OSRM format: /route/v1/driving/lon1,lat1;lon2,lat2;...?overview=full&geometries=geojson
  const coords = waypoints
    .map((p) => `${p.lon},${p.lat}`)
    .join(";");

  const url = `${OSRM_BASE}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    // GeoJSON coordinates are [lon, lat], Leaflet needs [lat, lon]
    const geometry = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);

    // OSRM default duration assumes ideal empty roads. 
    // We multiply by 1.8 to simulate real-world traffic conditions (especially in Indonesia).
    const TRAFFIC_MULTIPLIER = 1.8;

    return {
      geometry,
      distance: route.distance,    // meters
      duration: Math.round(route.duration * TRAFFIC_MULTIPLIER),    // seconds, adjusted for traffic
    };
  } catch {
    return null;
  }
}

/**
 * Format jarak meter ke string yang mudah dibaca.
 * @param {number} meters
 * @returns {string}
 */
export function formatDistance(meters) {
  if (meters == null) return "-";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format durasi detik ke string yang mudah dibaca.
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (seconds == null) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} jam ${m} mnt`;
  return `${m} menit`;
}

/**
 * Buka Google Maps Directions di tab baru.
 * Jika coords tersedia, gunakan lat/lon; fallback ke nama query.
 * @param {string} destName
 * @param {{lat: number, lon: number} | null} coords
 * @param {{lat: number, lon: number} | null} [originCoords] - titik asal (opsional)
 */
export function openGoogleMapsNav(destName, coords, originCoords) {
  let url;
  if (coords) {
    const dest = `${coords.lat},${coords.lon}`;
    if (originCoords) {
      const origin = `${originCoords.lat},${originCoords.lon}`;
      url = `https://www.google.com/maps/dir/${origin}/${dest}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${dest}`;
    }
  } else {
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destName)}`;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Buka Google Maps Directions dengan semua waypoints sekaligus.
 * @param {Array<{name: string, coords: {lat: number, lon: number} | null}>} stops
 */
export function openGoogleMapsFullRoute(stops) {
  const validStops = stops.filter((s) => s.coords);
  if (validStops.length === 0) return;

  if (validStops.length === 1) {
    const s = validStops[0];
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${s.coords.lat},${s.coords.lon}`,
      "_blank",
      "noopener,noreferrer"
    );
    return;
  }

  const origin = `${validStops[0].coords.lat},${validStops[0].coords.lon}`;
  const dest = `${validStops[validStops.length - 1].coords.lat},${validStops[validStops.length - 1].coords.lon}`;
  const midWaypoints = validStops
    .slice(1, -1)
    .map((s) => `${s.coords.lat},${s.coords.lon}`)
    .join("|");

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
  if (midWaypoints) url += `&waypoints=${encodeURIComponent(midWaypoints)}`;

  window.open(url, "_blank", "noopener,noreferrer");
}
