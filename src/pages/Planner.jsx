import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Map, CheckCircle2, ChevronRight, Share2, Download, Printer } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ItineraryDay } from "./Itinerary";
import { geocodeLocation } from "../lib/routing";
import { checkWeatherForecast } from "../lib/weather";
import {
  createItineraryDay,
  createItineraryItem,
  deleteTrip,
  getItineraryDays,
  getItineraryItems,
  getTrips,
  updateItineraryDay,
  updateTrip,
  updateItineraryItem,
  deleteItineraryItem
} from "../lib/api";
import { downloadSimplePdf } from "../lib/pdf";

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { dateStyle: "long" });
}

function formatTripDateRange(trip) {
  if (!trip?.start_date && !trip?.end_date) return "Tanggal belum diatur";
  if (trip?.start_date && trip?.end_date) {
    return `${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`;
  }
  return formatDate(trip?.start_date || trip?.end_date);
}

function toInputDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toTimeLabel(startTime, endTime) {
  const start = startTime ? String(startTime).slice(0, 5) : null;
  const end = endTime ? String(endTime).slice(0, 5) : null;
  if (start && end) return `${start} - ${end}`;
  return start || end || "-";
}

export default function Planner() {
  const location = useLocation();
  const navigate = useNavigate();
  const newTripId = location.state?.trip?.id;

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(newTripId || null);
  const [itineraryDays, setItineraryDays] = useState([]);
  const [itemsByDayId, setItemsByDayId] = useState({});
  const [dayDateDrafts, setDayDateDrafts] = useState({});
  const [activityDraftByDayId, setActivityDraftByDayId] = useState({});
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [isLoadingDays, setIsLoadingDays] = useState(false);
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [savingDayId, setSavingDayId] = useState(null);
  const [savingActivityDayId, setSavingActivityDayId] = useState(null);
  const [isDeletingTrip, setIsDeletingTrip] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [weatherAlerts, setWeatherAlerts] = useState({}); // { itemId: boolean }
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [editTripDraft, setEditTripDraft] = useState({ name: "", startDate: "", endDate: "" });
  const [isUpdatingTrip, setIsUpdatingTrip] = useState(false);

  // Edit Item State
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemDayId, setEditingItemDayId] = useState(null);
  const [editItemDraft, setEditItemDraft] = useState({ title: "", locationName: "", startTime: "", endTime: "", activityType: "sightseeing", notes: "" });
  const [isSavingItem, setIsSavingItem] = useState(false);

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === Number(selectedTripId)) || null,
    [trips, selectedTripId]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadTrips() {
      setIsLoadingTrips(true);
      setErrorMessage("");
      try {
        const tripRows = await getTrips();
        if (!isMounted) return;

        setTrips(tripRows);

        if (tripRows.length === 0) {
          setSelectedTripId(null);
          return;
        }

        if (newTripId && tripRows.some((trip) => trip.id === Number(newTripId))) {
          setSelectedTripId(Number(newTripId));
          return;
        }

        setSelectedTripId((currentId) => {
          if (currentId && tripRows.some((trip) => trip.id === Number(currentId))) {
            return Number(currentId);
          }
          return tripRows[0].id;
        });
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal memuat data trip");
      } finally {
        if (isMounted) setIsLoadingTrips(false);
      }
    }

    loadTrips();
    return () => {
      isMounted = false;
    };
  }, [newTripId]);

  useEffect(() => {
    if (!selectedTripId) {
      setItineraryDays([]);
      setItemsByDayId({});
      return;
    }

    let isMounted = true;

    async function loadItinerary() {
      setIsLoadingDays(true);
      setErrorMessage("");
      try {
        const dayRows = await getItineraryDays(selectedTripId);
        if (!isMounted) return;

        setItineraryDays(dayRows);
        setDayDateDrafts(
          dayRows.reduce((acc, day) => {
            acc[day.id] = toInputDate(day.date);
            return acc;
          }, {})
        );
        setActivityDraftByDayId(
          dayRows.reduce((acc, day) => {
            acc[day.id] = { title: "", locationName: "", startTime: "", endTime: "", activityType: "sightseeing", notes: "" };
            return acc;
          }, {})
        );

        const itemsEntry = await Promise.all(dayRows.map(async (day) => [day.id, await getItineraryItems(selectedTripId, day.id)]));
        if (!isMounted) return;
        setItemsByDayId(Object.fromEntries(itemsEntry));
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal memuat itinerary");
      } finally {
        if (isMounted) setIsLoadingDays(false);
      }
    }

    loadItinerary();
    return () => {
      isMounted = false;
    };
  }, [selectedTripId]);

  // Effect untuk mengecek cuaca pada aktivitas sightseeing
  useEffect(() => {
    let isMounted = true;
    
    async function checkWeatherForSightseeing() {
      if (!itineraryDays.length || Object.keys(itemsByDayId).length === 0) return;
      
      const newAlerts = { ...weatherAlerts };
      let hasChanges = false;
      
      for (const day of itineraryDays) {
        if (!day.date) continue; // Skip if day has no date
        
        // Ensure valid date format YYYY-MM-DD
        let targetDate;
        try {
          targetDate = new Date(day.date).toISOString().slice(0, 10);
        } catch {
          continue;
        }
        
        const items = itemsByDayId[day.id] || [];
        for (const item of items) {
          // Check if it's sightseeing, has location, and we haven't checked it yet
          if (item.activity_type === "sightseeing" && item.location_name && newAlerts[item.id] === undefined) {
            try {
              // 1. Geocode location name to coordinates
              const coords = await geocodeLocation(item.location_name);
              if (coords) {
                // 2. Fetch weather forecast from Open-Meteo
                const weather = await checkWeatherForecast(coords.lat, coords.lon, targetDate);
                if (weather && weather.isRainy) {
                  newAlerts[item.id] = true; // Show rain alert
                } else {
                  newAlerts[item.id] = false; // Safe weather
                }
                hasChanges = true;
              } else {
                newAlerts[item.id] = false; // Geocoding failed, mark as checked
                hasChanges = true;
              }
            } catch (err) {
              console.warn("Weather check failed for", item.location_name, err);
            }
          }
        }
      }
      
      if (isMounted && hasChanges) {
        setWeatherAlerts(newAlerts);
      }
    }
    
    checkWeatherForSightseeing();
    
    return () => {
      isMounted = false;
    };
  }, [itemsByDayId, itineraryDays]);

  const handleAddDay = async () => {
    if (!selectedTripId) return;

    const nextDayNumber = itineraryDays.length > 0 ? Math.max(...itineraryDays.map((day) => day.day_number)) + 1 : 1;

    let nextDate = null;
    if (selectedTrip?.start_date) {
      const baseDate = new Date(selectedTrip.start_date);
      if (!Number.isNaN(baseDate.getTime())) {
        baseDate.setDate(baseDate.getDate() + nextDayNumber - 1);
        nextDate = baseDate.toISOString().slice(0, 10);
      }
    }

    setIsAddingDay(true);
    setErrorMessage("");
    try {
      const created = await createItineraryDay(selectedTripId, { dayNumber: nextDayNumber, date: nextDate });
      const newDay = { id: created.id, trip_id: selectedTripId, day_number: created.dayNumber, date: created.date };

      setItineraryDays((prev) => [...prev, newDay].sort((a, b) => a.day_number - b.day_number));
      setDayDateDrafts((prev) => ({ ...prev, [newDay.id]: toInputDate(newDay.date) }));
      setItemsByDayId((prev) => ({ ...prev, [newDay.id]: [] }));
      setActivityDraftByDayId((prev) => ({
        ...prev,
        [newDay.id]: { title: "", locationName: "", startTime: "", endTime: "", activityType: "sightseeing", notes: "" }
      }));
    } catch (error) {
      setErrorMessage(error.message || "Gagal menambah hari itinerary");
    } finally {
      setIsAddingDay(false);
    }
  };

  const handleSaveDayDate = async (day) => {
    if (!selectedTripId) return;
    setSavingDayId(day.id);
    setErrorMessage("");
    try {
      const updated = await updateItineraryDay(selectedTripId, day.id, {
        dayNumber: day.day_number,
        date: dayDateDrafts[day.id] || null
      });

      setItineraryDays((prev) => prev.map((item) => (item.id === day.id ? { ...item, date: updated.date } : item)));
      setDayDateDrafts((prev) => ({ ...prev, [day.id]: toInputDate(updated.date) }));
    } catch (error) {
      setErrorMessage(error.message || "Gagal menyimpan tanggal hari");
    } finally {
      setSavingDayId(null);
    }
  };

  const handleDraftChange = (dayId, key, value) => {
    setActivityDraftByDayId((prev) => ({
      ...prev,
      [dayId]: {
        ...(prev[dayId] || { title: "", locationName: "", startTime: "", endTime: "", activityType: "sightseeing", notes: "" }),
        [key]: value
      }
    }));
  };

  const handleAddActivity = async (day) => {
    if (!selectedTripId) return;
    const draft = activityDraftByDayId[day.id] || {};
    if (!draft.title?.trim()) {
      setErrorMessage("Judul aktivitas wajib diisi.");
      return;
    }

    setSavingActivityDayId(day.id);
    setErrorMessage("");
    try {
      const created = await createItineraryItem(selectedTripId, day.id, {
        title: draft.title,
        locationName: draft.locationName,
        startTime: draft.startTime || null,
        endTime: draft.endTime || null,
        activityType: draft.activityType || "sightseeing",
        notes: draft.notes
      });

      setItemsByDayId((prev) => ({
        ...prev,
        [day.id]: [...(prev[day.id] || []), created]
      }));
      setActivityDraftByDayId((prev) => ({
        ...prev,
        [day.id]: { title: "", locationName: "", startTime: "", endTime: "", activityType: "sightseeing", notes: "" }
      }));
    } catch (error) {
      setErrorMessage(error.message || "Gagal menambah aktivitas");
    } finally {
      setSavingActivityDayId(null);
    }
  };

  const handleDownloadPdf = () => {
    if (!selectedTrip) return;

    const lines = [];
    lines.push(`Trip: ${selectedTrip.name}`);
    lines.push(`Periode: ${formatTripDateRange(selectedTrip)}`);
    lines.push("");

    itineraryDays.forEach((day) => {
      lines.push(`Hari ${day.day_number} - ${formatDate(day.date)}`);
      const dayItems = itemsByDayId[day.id] || [];
      if (dayItems.length === 0) {
        lines.push("  - Belum ada aktivitas");
      } else {
        dayItems.forEach((item, idx) => {
          const timeLabel = toTimeLabel(item.start_time, item.end_time);
          lines.push(`  ${idx + 1}. ${timeLabel} | ${item.title}`);
          if (item.location_name) lines.push(`     Lokasi: ${item.location_name}`);
          if (item.notes) lines.push(`     Catatan: ${item.notes}`);
        });
      }
      lines.push("");
    });

    downloadSimplePdf({
      fileName: `itinerary-${selectedTrip.name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      title: "SmartTravel - Itinerary",
      lines
    });
  };

  const handlePrint = () => window.print();

  const handleDeletePlanner = async () => {
    if (!selectedTrip) return;
    const confirmDelete = window.confirm(
      `Hapus planner "${selectedTrip.name}" dari daftar aktif?\n\nPlanner akan dipindahkan ke history.`
    );
    if (!confirmDelete) return;

    setIsDeletingTrip(true);
    setErrorMessage("");
    try {
      await deleteTrip(selectedTrip.id);
      const remainingTrips = trips.filter((trip) => trip.id !== selectedTrip.id);
      setTrips(remainingTrips);

      if (remainingTrips.length > 0) {
        setSelectedTripId(remainingTrips[0].id);
      } else {
        setSelectedTripId(null);
        navigate("/");
      }
    } catch (error) {
      setErrorMessage(error.message || "Gagal menghapus planner");
    } finally {
      setIsDeletingTrip(false);
    }
  };

  const handleEditTrip = () => {
    if (!selectedTrip) return;
    setEditTripDraft({
      name: selectedTrip.name || "",
      startDate: selectedTrip.start_date ? toInputDate(selectedTrip.start_date) : "",
      endDate: selectedTrip.end_date ? toInputDate(selectedTrip.end_date) : ""
    });
    setIsEditingTrip(true);
  };

  const handleSaveEditTrip = async () => {
    if (!selectedTrip) return;
    setIsUpdatingTrip(true);
    setErrorMessage("");
    try {
      const updated = await updateTrip(selectedTrip.id, {
        name: editTripDraft.name,
        startDate: editTripDraft.startDate || null,
        endDate: editTripDraft.endDate || null
      });
      
      setTrips(prev => prev.map(t => 
        t.id === selectedTrip.id 
          ? { ...t, name: updated.name, start_date: updated.startDate, end_date: updated.endDate }
          : t
      ));
      
      setIsEditingTrip(false);
    } catch (error) {
      setErrorMessage(error.message || "Gagal mengupdate planner");
    } finally {
      setIsUpdatingTrip(false);
    }
  };

  const handleEditActivityClick = (dayId, item) => {
    setEditingItemId(item.id);
    setEditingItemDayId(dayId);
    setEditItemDraft({
      title: item.title || "",
      locationName: item.location_name || "",
      startTime: item.start_time ? String(item.start_time).slice(0, 5) : "",
      endTime: item.end_time ? String(item.end_time).slice(0, 5) : "",
      activityType: item.activity_type || "sightseeing",
      notes: item.notes || ""
    });
  };

  const handleSaveEditedActivity = async () => {
    if (!selectedTripId || !editingItemDayId || !editingItemId) return;
    if (!editItemDraft.title?.trim()) {
      alert("Judul aktivitas wajib diisi.");
      return;
    }
    setIsSavingItem(true);
    try {
      const updated = await updateItineraryItem(selectedTripId, editingItemDayId, editingItemId, {
        title: editItemDraft.title,
        locationName: editItemDraft.locationName,
        startTime: editItemDraft.startTime || null,
        endTime: editItemDraft.endTime || null,
        activityType: editItemDraft.activityType,
        notes: editItemDraft.notes
      });
      setItemsByDayId(prev => ({
        ...prev,
        [editingItemDayId]: prev[editingItemDayId].map(item => item.id === editingItemId ? updated : item)
      }));
      setEditingItemId(null);
      setEditingItemDayId(null);
    } catch (error) {
      alert(error.message || "Gagal mengedit aktivitas");
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteActivityClick = async (dayId, itemId) => {
    if (!selectedTripId) return;
    if (!window.confirm("Hapus aktivitas ini?")) return;
    try {
      await deleteItineraryItem(selectedTripId, dayId, itemId);
      setItemsByDayId(prev => ({
        ...prev,
        [dayId]: prev[dayId].filter(item => item.id !== itemId)
      }));
    } catch (error) {
      alert(error.message || "Gagal menghapus aktivitas");
    }
  };

  if (isLoadingTrips) {
    return (
      <div className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <p className="text-muted">Memuat planner...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div className="card" style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h2 style={{ marginBottom: "0.75rem" }}>Belum Ada Trip</h2>
          <p className="text-muted" style={{ marginBottom: "1.25rem" }}>
            Kamu belum punya data planner. Buat trip dulu dari halaman Home agar itinerary bisa muncul di sini.
          </p>
          <Link to="/" className="btn btn-primary">
            Buat Trip Pertama
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
        <span>Home</span> <ChevronRight size={14} /> <span>Planner</span> <ChevronRight size={14} />{" "}
        <span style={{ color: "var(--primary)", fontWeight: 500 }}>{selectedTrip?.name || "Trip"}</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, var(--surface) 0%, var(--primary-soft) 100%)", padding: "2.5rem", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", marginBottom: "2rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem", border: "1px solid var(--border-color)" }}>
        <div style={{ flex: "1 1 min-content", minWidth: "300px" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
            <span style={{ backgroundColor: "#10b981", color: "white", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "4px", letterSpacing: "0.5px" }}>
              <CheckCircle2 size={13} /> DATABASE SYNC
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: 500 }}>{itineraryDays.length} hari itinerary</span>
          </div>

          {isEditingTrip ? (
            <div style={{ marginBottom: "1.5rem", display: "grid", gap: "0.5rem", backgroundColor: "white", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <input 
                type="text" 
                value={editTripDraft.name} 
                onChange={(e) => setEditTripDraft(prev => ({ ...prev, name: e.target.value }))}
                style={{ padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "1.1rem", fontWeight: "bold" }}
                placeholder="Nama Planner"
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input 
                  type="date" 
                  value={editTripDraft.startDate} 
                  onChange={(e) => setEditTripDraft(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{ flex: 1, padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                  title="Tanggal Mulai"
                />
                <input 
                  type="date" 
                  value={editTripDraft.endDate} 
                  onChange={(e) => setEditTripDraft(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{ flex: 1, padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                  title="Tanggal Selesai"
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn btn-primary" onClick={handleSaveEditTrip} disabled={isUpdatingTrip} style={{ padding: "0.4rem 1rem", fontSize: "0.9rem" }}>
                  {isUpdatingTrip ? "Menyimpan..." : "Simpan"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditingTrip(false)} disabled={isUpdatingTrip} style={{ padding: "0.4rem 1rem", fontSize: "0.9rem" }}>
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "2.5rem", letterSpacing: "-0.5px", color: "var(--text-main)", margin: 0 }}>{selectedTrip?.name}</h1>
                <button type="button" onClick={handleEditTrip} className="btn btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem", borderRadius: "20px" }}>Edit Planner</button>
              </div>
              <p className="text-muted" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.05rem", margin: 0 }}>
                <Calendar size={18} /> {formatTripDateRange(selectedTrip)}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" style={{ padding: "0.6rem 1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Map size={18} /> Peta Rute
            </button>
            <button type="button" className="btn btn-secondary" style={{ padding: "0.6rem 1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Share2 size={18} /> Bagikan
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <select value={selectedTripId || ""} onChange={(e) => setSelectedTripId(Number(e.target.value))} style={{ minWidth: "220px", padding: "0.55rem 0.8rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-secondary" onClick={handleAddDay} disabled={isAddingDay} style={{ padding: "0.55rem 0.9rem" }}>
            {isAddingDay ? "Menambah..." : "Tambah Hari"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDeletePlanner}
            disabled={isDeletingTrip}
            style={{ padding: "0.55rem 0.9rem", borderColor: "#fecaca", color: "#b91c1c" }}
          >
            {isDeletingTrip ? "Menghapus..." : "Hapus Planner"}
          </button>
          <button type="button" onClick={handleDownloadPdf} style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "white", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)", cursor: "pointer", transition: "all 0.2s" }} title="Download PDF">
            <Download size={18} />
          </button>
          <button type="button" onClick={handlePrint} style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "white", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)", cursor: "pointer", transition: "all 0.2s" }} title="Print Itinerary">
            <Printer size={18} />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "0.9rem" }}>
          {errorMessage}
        </div>
      )}

      <div style={{ maxWidth: "850px", margin: "0 auto" }}>
        {isLoadingDays ? (
          <p className="text-muted">Memuat itinerary...</p>
        ) : itineraryDays.length > 0 ? (
          itineraryDays.map((day) => {
            const dayItems = itemsByDayId[day.id] || [];
            const mappedActivities = dayItems.map((item) => ({
              id: item.id,
              time: toTimeLabel(item.start_time, item.end_time),
              title: item.title,
              description: item.notes || item.location_name || "Tidak ada deskripsi",
              type: item.activity_type || "sightseeing",
              duration: item.end_time ? `Selesai ${String(item.end_time).slice(0, 5)}` : "",
              weatherAlert: weatherAlerts[item.id] || false
            }));
            const draft = activityDraftByDayId[day.id] || { title: "", locationName: "", startTime: "", endTime: "", activityType: "sightseeing", notes: "" };

            return (
              <div key={day.id}>
                <ItineraryDay 
                  dayNumber={day.day_number} 
                  date={formatDate(day.date)} 
                  activities={mappedActivities} 
                  onEditActivity={(itemId) => {
                    const item = dayItems.find(i => i.id === itemId);
                    if(item) handleEditActivityClick(day.id, item);
                  }}
                  onDeleteActivity={(itemId) => handleDeleteActivityClick(day.id, itemId)}
                />

                <div className="card" style={{ marginTop: "-2.5rem", marginBottom: "2rem", padding: "1rem 1.25rem", display: "grid", gap: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "end" }}>
                    <div style={{ minWidth: "180px", flex: "1" }}>
                      <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "0.3rem", color: "var(--text-muted)" }}>Tanggal Hari Ini</label>
                      <input type="date" value={dayDateDrafts[day.id] || ""} onChange={(e) => setDayDateDrafts((prev) => ({ ...prev, [day.id]: e.target.value }))} style={{ width: "100%", padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={() => handleSaveDayDate(day)} disabled={savingDayId === day.id} style={{ padding: "0.55rem 0.9rem" }}>
                      {savingDayId === day.id ? "Menyimpan..." : "Simpan Tanggal"}
                    </button>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem" }}>
                    <p style={{ margin: "0 0 0.7rem 0", fontWeight: 600 }}>Tambah Aktivitas Hari {day.day_number}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.6rem" }}>
                      <input type="text" placeholder="Judul aktivitas" value={draft.title} onChange={(e) => handleDraftChange(day.id, "title", e.target.value)} style={{ padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
                      <input type="text" placeholder="Lokasi" value={draft.locationName} onChange={(e) => handleDraftChange(day.id, "locationName", e.target.value)} style={{ padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
                      <input type="time" value={draft.startTime} onChange={(e) => handleDraftChange(day.id, "startTime", e.target.value)} style={{ padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
                      <input type="time" value={draft.endTime} onChange={(e) => handleDraftChange(day.id, "endTime", e.target.value)} style={{ padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
                      <select value={draft.activityType} onChange={(e) => handleDraftChange(day.id, "activityType", e.target.value)} style={{ padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                        <option value="sightseeing">Sightseeing</option>
                        <option value="dining">Dining</option>
                        <option value="cafe">Cafe</option>
                        <option value="hotel">Hotel</option>
                        <option value="flight">Flight</option>
                        <option value="other">Other</option>
                      </select>
                      <input type="text" placeholder="Catatan" value={draft.notes} onChange={(e) => handleDraftChange(day.id, "notes", e.target.value)} style={{ padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => handleAddActivity(day)} disabled={savingActivityDayId === day.id} style={{ marginTop: "0.7rem" }}>
                      {savingActivityDayId === day.id ? "Menyimpan..." : "+ Tambah Aktivitas"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: "center", padding: "3rem 0", borderTop: "1px dashed var(--border-color)", marginTop: "2rem" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--bg-color)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <Calendar size={28} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Belum ada hari itinerary</h3>
            <p className="text-muted" style={{ marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
              Tambahkan hari pertama agar planner mulai tersusun dari database kamu.
            </p>
            <button type="button" className="btn btn-secondary" onClick={handleAddDay} disabled={isAddingDay}>
              {isAddingDay ? "Menambah..." : "Tambah Hari Pertama"}
            </button>
          </div>
        )}
      </div>

      {/* Modal Edit Activity */}
      {editingItemId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "1.5rem" }}>
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Edit Aktivitas</h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <input type="text" placeholder="Judul aktivitas" value={editItemDraft.title} onChange={(e) => setEditItemDraft(prev => ({...prev, title: e.target.value}))} style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
              <input type="text" placeholder="Lokasi" value={editItemDraft.locationName} onChange={(e) => setEditItemDraft(prev => ({...prev, locationName: e.target.value}))} style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input type="time" value={editItemDraft.startTime} onChange={(e) => setEditItemDraft(prev => ({...prev, startTime: e.target.value}))} style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
                <input type="time" value={editItemDraft.endTime} onChange={(e) => setEditItemDraft(prev => ({...prev, endTime: e.target.value}))} style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
              </div>
              <select value={editItemDraft.activityType} onChange={(e) => setEditItemDraft(prev => ({...prev, activityType: e.target.value}))} style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                <option value="sightseeing">Sightseeing</option>
                <option value="dining">Dining</option>
                <option value="cafe">Cafe</option>
                <option value="hotel">Hotel</option>
                <option value="flight">Flight</option>
                <option value="other">Other</option>
              </select>
              <textarea placeholder="Catatan" value={editItemDraft.notes} onChange={(e) => setEditItemDraft(prev => ({...prev, notes: e.target.value}))} style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)", minHeight: "80px" }} />
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setEditingItemId(null); setEditingItemDayId(null); }} disabled={isSavingItem}>Batal</button>
              <button type="button" className="btn btn-primary" onClick={handleSaveEditedActivity} disabled={isSavingItem}>{isSavingItem ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
