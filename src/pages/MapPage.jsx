import React, { useEffect, useMemo, useRef, useState } from "react";
import { Map, Navigation, Search, Star, List, Route, X, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getItineraryDays, getItineraryItems, getTrips } from "../lib/api";
import {
  geocodeLocation,
  fetchOSRMRoute,
  formatDistance,
  formatDuration,
  openGoogleMapsNav,
} from "../lib/routing";

// Fix Leaflet default icon bug with Vite/webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom colored marker
function createNumberedIcon(number, isActive) {
  const color = isActive ? "#3b82f6" : "#64748b";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:12px;
      transform:rotate(-45deg);
    "><span style="transform:rotate(45deg)">${number}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:#22c55e;border:3px solid white;
    box-shadow:0 0 0 4px rgba(34,197,94,0.3);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Auto-fit map bounds
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [60, 60] });
    } else if (bounds && bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
  }, [bounds, map]);
  return null;
}

function formatTimeLabel(dayNumber, startTime) {
  if (!startTime) return `Hari ${dayNumber}`;
  return `Hari ${dayNumber} - ${String(startTime).slice(0, 5)}`;
}

function toTypeLabel(activityType) {
  const n = (activityType || "").toLowerCase();
  const map = { dining: "Dining", cafe: "Cafe", hotel: "Hotel", flight: "Flight", sightseeing: "Sightseeing" };
  return map[n] || "Lokasi";
}

function buildLocations({ trip, days, itemsByDayId }) {
  const locations = [];
  const orderedDays = [...days].sort((a, b) => a.day_number - b.day_number);
  for (const day of orderedDays) {
    const items = [...(itemsByDayId[day.id] || [])].sort((a, b) => {
      const aT = a.start_time || "99:99:99", bT = b.start_time || "99:99:99";
      return aT === bT ? (a.sort_order || 0) - (b.sort_order || 0) : aT.localeCompare(bT);
    });
    for (const item of items) {
      const name = item.location_name || item.title || trip?.destination;
      locations.push({
        id: `${day.id}-${item.id}`,
        name,
        type: toTypeLabel(item.activity_type),
        time: formatTimeLabel(day.day_number, item.start_time),
        desc: item.notes || `Aktivitas: ${item.title}`,
        mapQuery: name,
      });
    }
  }
  if (locations.length === 0 && trip) {
    locations.push({
      id: `trip-${trip.id}`,
      name: trip.destination || trip.name,
      type: "Destination",
      time: "Trip",
      desc: trip.notes || "Belum ada itinerary.",
      mapQuery: trip.destination || trip.name,
    });
  }
  return locations;
}

export default function MapPage() {
  const [mobileView, setMobileView] = useState("list");
  const [query, setQuery] = useState("");
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [days, setDays] = useState([]);
  const [itemsByDayId, setItemsByDayId] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Routing state
  const [activeLocId, setActiveLocId] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);       // { geometry, distance, duration }
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [userCoords, setUserCoords] = useState(null);     // { lat, lon }
  const [destCoords, setDestCoords] = useState(null);     // { lat, lon }
  const [mapCenter] = useState([-2.5, 118]);              // Default: Indonesia
  const watchIdRef = useRef(null);                        // Untuk menyimpan ID watchPosition GPS

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === Number(selectedTripId)) || null,
    [trips, selectedTripId]
  );

  const locations = useMemo(
    () => buildLocations({ trip: selectedTrip, days, itemsByDayId }),
    [selectedTrip, days, itemsByDayId]
  );

  const filteredLocations = useMemo(() => {
    if (!query.trim()) return locations;
    const q = query.trim().toLowerCase();
    return locations.filter(
      (l) => l.name.toLowerCase().includes(q) || l.type.toLowerCase().includes(q)
    );
  }, [locations, query]);

  const activeItem = useMemo(
    () => filteredLocations.find((l) => l.id === activeLocId) || null,
    [filteredLocations, activeLocId]
  );

  // Map bounds: user + dest markers
  const mapBounds = useMemo(() => {
    const pts = [];
    if (userCoords) pts.push([userCoords.lat, userCoords.lon]);
    if (destCoords) pts.push([destCoords.lat, destCoords.lon]);
    return pts;
  }, [userCoords, destCoords]);

  // Load trips
  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const rows = await getTrips();
        if (!mounted) return;
        setTrips(rows);
        setSelectedTripId(rows.length > 0 ? rows[0].id : null);
      } catch (e) {
        if (mounted) setErrorMessage(e.message || "Gagal memuat trip");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Load days & items
  useEffect(() => {
    if (!selectedTripId) { setDays([]); setItemsByDayId({}); return; }
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const dayRows = await getItineraryDays(selectedTripId);
        if (!mounted) return;
        setDays(dayRows);
        const pairs = await Promise.all(
          dayRows.map(async (d) => [d.id, await getItineraryItems(selectedTripId, d.id)])
        );
        if (mounted) setItemsByDayId(Object.fromEntries(pairs));
      } catch (e) {
        if (mounted) setErrorMessage(e.message || "Gagal memuat data");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [selectedTripId]);

  // Reset route when trip changes
  useEffect(() => {
    setActiveLocId(null);
    setRouteInfo(null);
    setDestCoords(null);
    setUserCoords(null);
    setRouteError("");
  }, [selectedTripId]);

  // Main: handle "Arahkan Rute" button
  async function handleArahkanRute(loc) {
    setActiveLocId(loc.id);
    setRouteInfo(null);
    setRouteError("");
    setDestCoords(null);
    setUserCoords(null);
    setMobileView("map");
    setRouteLoading(true);

    // Hentikan tracking sebelumnya jika ada
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    try {
      // 1. Get user GPS location (Initial)
      const userPos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error("Geolocation tidak didukung browser ini")); return; }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          (err) => reject(new Error(err.code === 1 ? "Izin lokasi ditolak. Aktifkan akses lokasi di browser." : "Gagal mendapatkan lokasi GPS")),
          { timeout: 10000, enableHighAccuracy: true }
        );
      });
      setUserCoords(userPos);

      // 1b. Mulai tracking GPS real-time (Watch Position)
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          // Update titik lokasi user di peta setiap kali user bergerak
          setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => console.warn("GPS tracking error:", err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

      // 2. Geocode destination
      const dest = await geocodeLocation(loc.mapQuery);
      if (!dest) throw new Error(`Lokasi "${loc.name}" tidak ditemukan di peta. Coba nama yang lebih spesifik.`);
      setDestCoords(dest);

      // 3. Fetch OSRM route
      const route = await fetchOSRMRoute([userPos, dest]);
      if (!route) throw new Error("Gagal menghitung rute. Coba lagi.");

      setRouteInfo(route);
    } catch (e) {
      setRouteError(e.message || "Terjadi kesalahan");
    } finally {
      setRouteLoading(false);
    }
  }

  function clearRoute() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setRouteInfo(null);
    setDestCoords(null);
    setUserCoords(null);
    setRouteError("");
    setActiveLocId(null);
  }

  // Cleanup tracking saat pindah halaman
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (isLoading && trips.length === 0) {
    return (
      <div className="container" style={{ paddingTop: "3rem" }}>
        <p className="text-muted">Memuat data peta...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div className="card" style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h2 style={{ marginBottom: "0.75rem" }}>Belum Ada Trip</h2>
          <p className="text-muted" style={{ marginBottom: "1.25rem" }}>
            Buat trip dan itinerary terlebih dahulu agar peta bisa menampilkan destinasi.
          </p>
          <Link to="/" className="btn btn-primary">Buat Trip Dulu</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 5rem)", overflow: "hidden" }}>
      {/* Mobile tab switcher */}
      <div className="map-tab-switcher" style={{ display: "none", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--surface)" }}>
        {[["list", <List size={16} />, "Daftar"], ["map", <Map size={16} />, "Peta"]].map(([v, icon, label]) => (
          <button
            key={v}
            onClick={() => setMobileView(v)}
            style={{
              flex: 1, padding: "0.85rem", border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "0.4rem",
              backgroundColor: mobileView === v ? "var(--primary-soft)" : "transparent",
              color: mobileView === v ? "var(--primary)" : "var(--text-muted)",
              borderBottom: mobileView === v ? "2px solid var(--primary)" : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >{icon}{label}</button>
        ))}
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* SIDEBAR */}
        <div
          className={`map-sidebar ${mobileView === "map" ? "map-sidebar--hidden" : ""}`}
          style={{ width: "380px", flexShrink: 0, backgroundColor: "var(--surface)", borderRight: "1px solid var(--border-color)", display: "flex", flexDirection: "column", overflowY: "hidden" }}
        >
          {/* Header */}
          <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Map size={20} color="var(--primary)" /> Destinasi Rute
            </h2>
            <select
              value={selectedTripId || ""}
              onChange={(e) => setSelectedTripId(Number(e.target.value))}
              style={{ width: "100%", marginBottom: "0.7rem", padding: "0.6rem 0.75rem", borderRadius: "10px", border: "1px solid var(--border-color)", backgroundColor: "var(--surface)", fontSize: "0.9rem" }}
            >
              {trips.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div style={{ display: "flex", alignItems: "center", backgroundColor: "var(--bg-color)", padding: "0.6rem 1rem", borderRadius: "var(--radius-full)", border: "1px solid var(--border-color)" }}>
              <Search size={15} color="var(--text-muted)" style={{ marginRight: "0.5rem", flexShrink: 0 }} />
              <input
                type="text" placeholder="Cari lokasi..." value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.875rem" }}
              />
            </div>
          </div>

          {errorMessage && (
            <div style={{ margin: "0.75rem", padding: "0.65rem 0.8rem", borderRadius: "10px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "0.85rem" }}>
              {errorMessage}
            </div>
          )}

          {/* Route info banner */}
          {(routeInfo || routeLoading || routeError) && (
            <div style={{ margin: "0.75rem", padding: "0.85rem 1rem", borderRadius: "12px", background: routeError ? "#fef2f2" : "linear-gradient(135deg, #eff6ff, #dbeafe)", border: routeError ? "1px solid #fecaca" : "1px solid #bfdbfe", position: "relative" }}>
              <button onClick={clearRoute} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px" }}>
                <X size={14} />
              </button>
              {routeLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontSize: "0.85rem" }}>
                  <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Menghitung rute...
                </div>
              )}
              {routeError && <p style={{ color: "#b91c1c", fontSize: "0.85rem", margin: 0 }}>{routeError}</p>}
              {routeInfo && !routeLoading && (
                <div>
                  <div style={{ display: "flex", gap: "1.25rem", marginBottom: "0.5rem" }}>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Jarak</div>
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary)" }}>{formatDistance(routeInfo.distance)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Estimasi</div>
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>{formatDuration(routeInfo.duration)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => openGoogleMapsNav(activeItem?.name, destCoords, userCoords)}
                    className="btn btn-primary"
                    style={{ width: "100%", padding: "0.45rem", fontSize: "0.82rem", gap: "0.4rem" }}
                  >
                    <Navigation size={13} /> Buka di Google Maps
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Location list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
            {isLoading ? (
              <p className="text-muted" style={{ fontSize: "0.9rem" }}>Memuat lokasi...</p>
            ) : filteredLocations.length === 0 ? (
              <p className="text-muted" style={{ fontSize: "0.9rem" }}>Tidak ada lokasi ditemukan.</p>
            ) : (
              filteredLocations.map((loc, idx) => {
                const isActive = activeLocId === loc.id;
                return (
                  <div
                    key={loc.id}
                    style={{
                      padding: "1rem", marginBottom: "0.65rem", borderRadius: "var(--radius-md)",
                      cursor: "pointer", transition: "all 0.2s",
                      border: isActive ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                      backgroundColor: isActive ? "var(--primary-soft)" : "var(--surface)",
                      boxShadow: isActive ? "var(--shadow-sm)" : "none"
                    }}
                    onClick={() => setActiveLocId(loc.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>{loc.time}</span>
                      <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", background: "var(--bg-color)", padding: "1px 7px", borderRadius: "99px", border: "1px solid var(--border-color)" }}>{idx + 1}</span>
                    </div>
                    <h3 style={{ fontSize: "0.95rem", marginBottom: "0.15rem", color: "var(--text-main)" }}>{loc.name}</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginBottom: "0.35rem" }}>{loc.type}</p>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.75rem", lineHeight: 1.4 }}>{loc.desc}</p>
                    <button
                      className="btn btn-primary"
                      disabled={routeLoading}
                      onClick={(e) => { e.stopPropagation(); handleArahkanRute(loc); }}
                      style={{ width: "100%", padding: "0.45rem", fontSize: "0.83rem", gap: "0.4rem", opacity: routeLoading ? 0.7 : 1 }}
                    >
                      {routeLoading && activeLocId === loc.id
                        ? <><Loader size={13} style={{ animation: "spin 1s linear infinite" }} /> Menghitung...</>
                        : <><Route size={13} /> Arahkan Rute</>
                      }
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MAP AREA */}
        <div
          className={`map-area ${mobileView === "list" ? "map-area--hidden" : ""}`}
          style={{ flex: 1, position: "relative", overflow: "hidden" }}
        >
          <MapContainer
            center={mapCenter}
            zoom={5}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Destination markers */}
            {filteredLocations.map((loc, idx) =>
              destCoords && activeLocId === loc.id ? (
                <Marker key={loc.id} position={[destCoords.lat, destCoords.lon]} icon={createNumberedIcon(idx + 1, true)}>
                  <Popup>
                    <div style={{ minWidth: "160px" }}>
                      <strong style={{ fontSize: "0.9rem" }}>{loc.name}</strong>
                      <br /><span style={{ fontSize: "0.78rem", color: "#64748b" }}>{loc.type} · {loc.time}</span>
                      {routeInfo && (
                        <div style={{ marginTop: "0.4rem", fontSize: "0.8rem" }}>
                          🚗 {formatDistance(routeInfo.distance)} · {formatDuration(routeInfo.duration)}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}

            {/* User location marker */}
            {userCoords && (
              <Marker position={[userCoords.lat, userCoords.lon]} icon={userIcon}>
                <Popup><strong>Lokasi Saya</strong></Popup>
              </Marker>
            )}

            {/* Route polyline */}
            {routeInfo && (
              <Polyline
                positions={routeInfo.geometry}
                pathOptions={{ color: "#3b82f6", weight: 5, opacity: 0.85, dashArray: null }}
              />
            )}

            {/* Auto fit bounds */}
            {mapBounds.length > 0 && <FitBounds bounds={mapBounds} />}
          </MapContainer>

          {/* Trip label overlay */}
          <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 1000, backgroundColor: "rgba(255,255,255,0.95)", padding: "0.45rem 0.85rem", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)", fontSize: "0.83rem", color: "var(--text-main)", border: "1px solid var(--border-color)", backdropFilter: "blur(6px)" }}>
            {selectedTrip ? `✈️ ${selectedTrip.name}` : "Peta"}
          </div>

          {/* Route summary overlay on map */}
          {routeInfo && (
            <div style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 1000, backgroundColor: "rgba(255,255,255,0.97)", padding: "0.75rem 1.25rem", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "1.25rem", backdropFilter: "blur(8px)", minWidth: "260px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Jarak</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>{formatDistance(routeInfo.distance)}</div>
              </div>
              <div style={{ width: "1px", height: "36px", backgroundColor: "var(--border-color)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Waktu</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{formatDuration(routeInfo.duration)}</div>
              </div>
              <div style={{ width: "1px", height: "36px", backgroundColor: "var(--border-color)" }} />
              <button
                onClick={() => openGoogleMapsNav(activeItem?.name, destCoords, userCoords)}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", padding: "0.5rem 0.85rem", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
              >
                <Navigation size={13} /> Navigasi
              </button>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (min-width: 769px) {
          .map-tab-switcher { display: none !important; }
          .map-sidebar { display: flex !important; }
          .map-area { display: block !important; }
        }
        @media (max-width: 768px) {
          .map-tab-switcher { display: flex !important; }
          .map-sidebar { width: 100% !important; flex-shrink: unset; border-right: none !important; }
          .map-sidebar--hidden { display: none !important; }
          .map-area--hidden { display: none !important; }
        }
        .leaflet-container { font-family: 'Inter', sans-serif; }
      `}} />
    </div>
  );
}
