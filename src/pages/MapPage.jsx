import React, { useEffect, useMemo, useState } from "react";
import { Map, Navigation, Search, Star, List } from "lucide-react";
import { Link } from "react-router-dom";
import { getItineraryDays, getItineraryItems, getTrips } from "../lib/api";

function formatTimeLabel(dayNumber, startTime) {
  if (!startTime) return `Hari ${dayNumber} - Tanpa jam`;
  return `Hari ${dayNumber} - ${String(startTime).slice(0, 5)}`;
}

function toTypeLabel(activityType) {
  const normalized = (activityType || "").toLowerCase();
  if (normalized === "dining") return "Dining";
  if (normalized === "cafe") return "Cafe";
  if (normalized === "hotel") return "Hotel";
  if (normalized === "flight") return "Flight";
  if (normalized === "sightseeing") return "Sightseeing";
  return "Location";
}

function buildLocations({ trip, days, itemsByDayId }) {
  const locations = [];

  const orderedDays = [...days].sort((a, b) => a.day_number - b.day_number);
  for (const day of orderedDays) {
    const items = [...(itemsByDayId[day.id] || [])].sort((a, b) => {
      const aTime = a.start_time || "99:99:99";
      const bTime = b.start_time || "99:99:99";
      if (aTime === bTime) return (a.sort_order || 0) - (b.sort_order || 0);
      return aTime.localeCompare(bTime);
    });

    for (const item of items) {
      const locationName = item.location_name || item.title || trip.destination;
      locations.push({
        id: `${day.id}-${item.id}`,
        name: locationName,
        type: toTypeLabel(item.activity_type),
        rating: null,
        time: formatTimeLabel(day.day_number, item.start_time),
        desc: item.notes || `Aktivitas: ${item.title}`,
        mapQuery: locationName
      });
    }
  }

  if (locations.length === 0 && trip) {
    locations.push({
      id: `trip-${trip.id}-destination`,
      name: trip.destination || trip.name,
      type: "Destination",
      rating: null,
      time: "Trip",
      desc: trip.notes || "Belum ada itinerary item untuk trip ini.",
      mapQuery: trip.destination || trip.name
    });
  }

  return locations;
}

function buildEmbedUrl(query) {
  if (!query) return "https://www.google.com/maps?q=Indonesia&output=embed";
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export default function MapPage() {
  const [activeLocation, setActiveLocation] = useState(null);
  const [mobileView, setMobileView] = useState("list");
  const [query, setQuery] = useState("");
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [days, setDays] = useState([]);
  const [itemsByDayId, setItemsByDayId] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === Number(selectedTripId)) || null,
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
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.type.toLowerCase().includes(q) ||
        loc.desc.toLowerCase().includes(q)
    );
  }, [locations, query]);

  const activeItem = useMemo(
    () => filteredLocations.find((loc) => loc.id === activeLocation) || filteredLocations[0] || null,
    [filteredLocations, activeLocation]
  );
  const activeMapUrl = useMemo(() => buildEmbedUrl(activeItem?.mapQuery), [activeItem]);

  useEffect(() => {
    let isMounted = true;

    async function loadTrips() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const tripRows = await getTrips();
        if (!isMounted) return;
        setTrips(tripRows);
        setSelectedTripId(tripRows.length > 0 ? tripRows[0].id : null);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal memuat trip");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTrips();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTripId) {
      setDays([]);
      setItemsByDayId({});
      setActiveLocation(null);
      return;
    }

    let isMounted = true;

    async function loadTripMapData() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const dayRows = await getItineraryDays(selectedTripId);
        if (!isMounted) return;
        setDays(dayRows);

        const itemPairs = await Promise.all(
          dayRows.map(async (day) => [day.id, await getItineraryItems(selectedTripId, day.id)])
        );
        if (!isMounted) return;
        setItemsByDayId(Object.fromEntries(itemPairs));
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal memuat data map");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTripMapData();
    return () => {
      isMounted = false;
    };
  }, [selectedTripId]);

  useEffect(() => {
    setActiveLocation(filteredLocations.length > 0 ? filteredLocations[0].id : null);
  }, [selectedTripId, query, filteredLocations.length]);

  const handleOpenRoute = (loc) => {
    if (!loc?.mapQuery) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapQuery)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isLoading && trips.length === 0) {
    return (
      <div className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
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
            Halaman map akan terisi otomatis setelah kamu membuat trip dan itinerary.
          </p>
          <Link to="/" className="btn btn-primary">
            Buat Trip Dulu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 5rem)", overflow: "hidden" }}>
      <div
        className="map-tab-switcher"
        style={{
          display: "none",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "var(--surface)"
        }}
      >
        <button
          onClick={() => setMobileView("list")}
          style={{
            flex: 1,
            padding: "0.85rem",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            backgroundColor: mobileView === "list" ? "var(--primary-soft)" : "transparent",
            color: mobileView === "list" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: mobileView === "list" ? "2px solid var(--primary)" : "2px solid transparent",
            transition: "all 0.2s"
          }}
        >
          <List size={17} /> Daftar Lokasi
        </button>
        <button
          onClick={() => setMobileView("map")}
          style={{
            flex: 1,
            padding: "0.85rem",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            backgroundColor: mobileView === "map" ? "var(--primary-soft)" : "transparent",
            color: mobileView === "map" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: mobileView === "map" ? "2px solid var(--primary)" : "2px solid transparent",
            transition: "all 0.2s"
          }}
        >
          <Map size={17} /> Lihat Peta
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div
          className={`map-sidebar ${mobileView === "map" ? "map-sidebar--hidden" : ""}`}
          style={{
            width: "380px",
            flexShrink: 0,
            backgroundColor: "var(--surface)",
            borderRight: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            overflowY: "hidden"
          }}
        >
          <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
            <h2 style={{ fontSize: "1.35rem", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-main)" }}>
              <Map size={22} color="var(--primary)" /> Destinasi Rute
            </h2>

            <select
              value={selectedTripId || ""}
              onChange={(e) => setSelectedTripId(Number(e.target.value))}
              style={{ width: "100%", marginBottom: "0.7rem", padding: "0.6rem 0.75rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.name}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", alignItems: "center", backgroundColor: "var(--bg-color)", padding: "0.65rem 1rem", borderRadius: "var(--radius-full)", border: "1px solid var(--border-color)" }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: "0.5rem", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Cari lokasi..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.9rem" }}
              />
            </div>
          </div>

          {errorMessage && (
            <div style={{ margin: "0.75rem", padding: "0.65rem 0.8rem", borderRadius: "10px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "0.85rem" }}>
              {errorMessage}
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
            {isLoading ? (
              <p className="text-muted" style={{ margin: 0 }}>
                Memuat lokasi...
              </p>
            ) : filteredLocations.length === 0 ? (
              <p className="text-muted" style={{ margin: 0 }}>
                Tidak ada lokasi cocok untuk pencarian ini.
              </p>
            ) : (
              filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setActiveLocation(loc.id);
                    setMobileView("map");
                  }}
                  style={{
                    padding: "1rem",
                    marginBottom: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    border: activeItem?.id === loc.id ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                    backgroundColor: activeItem?.id === loc.id ? "var(--primary-soft)" : "var(--surface)",
                    transition: "all 0.2s",
                    boxShadow: activeItem?.id === loc.id ? "var(--shadow-sm)" : "none"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.3px" }}>{loc.time}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.8rem", fontWeight: 700 }}>
                      <Star size={13} color="#f59e0b" fill={loc.rating ? "#f59e0b" : "none"} /> {loc.rating || "-"}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1rem", marginBottom: "0.2rem", color: "var(--text-main)" }}>{loc.name}</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-light)", margin: "0 0 0.45rem 0" }}>{loc.type}</p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.85rem", lineHeight: 1.4 }}>{loc.desc}</p>
                  <button
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRoute(loc);
                    }}
                    style={{ width: "100%", padding: "0.45rem", fontSize: "0.85rem", display: "flex", justifyContent: "center", gap: "0.4rem" }}
                  >
                    <Navigation size={14} /> Arahkan Rute
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div
          className={`map-area ${mobileView === "list" ? "map-area--hidden" : ""}`}
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden"
          }}
        >
          <iframe
            title="SmartTravel Map"
            src={activeMapUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{
              width: "100%",
              height: "100%",
              border: "none"
            }}
          />

          <div style={{ position: "absolute", top: "1rem", left: "1rem", backgroundColor: "rgba(255,255,255,0.92)", padding: "0.5rem 0.85rem", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)", fontSize: "0.85rem", color: "var(--text-main)", border: "1px solid var(--border-color)" }}>
            {selectedTrip ? `Trip: ${selectedTrip.name}` : "Trip"}
          </div>

          {activeItem && (
            <div
              className="map-active-card"
              style={{
                position: "absolute",
                bottom: "5rem",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "var(--surface)",
                borderRadius: "var(--radius-lg)",
                padding: "1rem 1.25rem",
                boxShadow: "var(--shadow-lg)",
                border: "1px solid var(--border-color)",
                display: "none",
                width: "calc(100% - 2rem)",
                maxWidth: "340px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700 }}>{activeItem.time}</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px" }}>
                  <Star size={13} color="#f59e0b" fill={activeItem.rating ? "#f59e0b" : "none"} /> {activeItem.rating || "-"}
                </span>
              </div>
              <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem", color: "var(--text-main)" }}>{activeItem.name}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>{activeItem.desc}</p>
              <button
                onClick={() => setMobileView("list")}
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center", padding: "0.45rem", fontSize: "0.85rem" }}
              >
                <List size={14} /> Kembali ke Daftar
              </button>
            </div>
          )}

          <div style={{ position: "absolute", right: "1.25rem", bottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {["+", "-"].map((s, i) => (
              <button
                key={i}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--shadow-md)",
                  cursor: "pointer",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  lineHeight: 1
                }}
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => handleOpenRoute(activeItem)}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--primary)",
                color: "white",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-md)",
                cursor: "pointer",
                marginTop: "0.25rem"
              }}
            >
              <Navigation size={19} />
            </button>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (min-width: 769px) {
          .map-tab-switcher  { display: none !important; }
          .map-sidebar       { display: flex !important; }
          .map-area          { display: block !important; }
          .map-active-card   { display: none !important; }
        }

        @media (max-width: 768px) {
          .map-tab-switcher  { display: flex !important; }
          .map-sidebar       { width: 100% !important; flex-shrink: unset; border-right: none !important; }
          .map-sidebar--hidden { display: none !important; }
          .map-area--hidden  { display: none !important; }
          .map-active-card   { display: block !important; }
        }
      `
        }}
      />
    </div>
  );
}
