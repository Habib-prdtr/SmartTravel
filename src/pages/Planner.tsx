// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Map, CheckCircle2, ChevronRight, Share2, Download, History, CloudRain, Package } from "lucide-react";
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
  getTripById,
  updateItineraryDay,
  updateTrip,
  updateItineraryItem,
  deleteItineraryItem
} from "../lib/api";


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
  const [showActivityFormByDay, setShowActivityFormByDay] = useState({});
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

  // Toast & Modal State
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: "", id: null, dayId: null, title: "" });

  const showSuccessModal = (msg) => {
    setSuccessModal({ isOpen: true, message: msg });
    setTimeout(() => setSuccessModal({ isOpen: false, message: "" }), 2000);
  };

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

        let allTrips = [...tripRows];
        
        if (newTripId && !allTrips.some((trip) => trip.id === Number(newTripId))) {
          try {
            const specificTrip = await getTripById(Number(newTripId));
            if (specificTrip) {
              allTrips.push(specificTrip);
            }
          } catch (err) {
            console.error("Failed to fetch deleted/specific trip", err);
          }
        }

        setTrips(allTrips);

        if (allTrips.length === 0) {
          setSelectedTripId(null);
          return;
        }

        if (newTripId && allTrips.some((trip) => trip.id === Number(newTripId))) {
          setSelectedTripId(Number(newTripId));
          return;
        }

        setSelectedTripId((currentId) => {
          if (currentId && allTrips.some((trip) => trip.id === Number(currentId))) {
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
          const d = new Date(day.date);
          targetDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        } catch {
          continue;
        }
        
        const items = itemsByDayId[day.id] || [];
        for (const item of items) {
          // Check if it has location, and we haven't checked it yet
          if (item.location_name && newAlerts[item.id] === undefined) {
            try {
              // 1. Geocode location name to coordinates
              const coords = await geocodeLocation(item.location_name);
              if (coords) {
                // 2. Fetch weather forecast from WeatherAPI
                const weather = await checkWeatherForecast(coords.lat, coords.lon, targetDate, item.start_time);
                newAlerts[item.id] = weather || null; // Simpan seluruh objek cuaca
                hasChanges = true;
              } else {
                newAlerts[item.id] = null; // Geocoding failed, mark as checked
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
      setShowActivityFormByDay((prev) => ({ ...prev, [day.id]: false }));
    } catch (error) {
      setErrorMessage(error.message || "Gagal menambah aktivitas");
    } finally {
      setSavingActivityDayId(null);
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const triggerDeletePlanner = () => {
    if (!selectedTrip) return;
    setDeleteConfirm({
      isOpen: true,
      type: "trip",
      id: selectedTrip.id,
      title: selectedTrip.name
    });
  };

  const confirmDeleteAction = async () => {
    setIsDeletingTrip(true);
    setErrorMessage("");
    try {
      if (deleteConfirm.type === "trip") {
        await deleteTrip(deleteConfirm.id);
        const remainingTrips = trips.filter((trip) => trip.id !== deleteConfirm.id);
        setTrips(remainingTrips);

        if (remainingTrips.length > 0) {
          setSelectedTripId(remainingTrips[0].id);
        } else {
          setSelectedTripId(null);
          navigate("/");
        }
        setDeleteConfirm({ isOpen: false, type: "", id: null, dayId: null, title: "" });
        showSuccessModal("Planner berhasil dihapus!");
      } else if (deleteConfirm.type === "activity") {
        await deleteItineraryItem(selectedTripId, deleteConfirm.dayId, deleteConfirm.id);
        setItemsByDayId(prev => ({
          ...prev,
          [deleteConfirm.dayId]: prev[deleteConfirm.dayId].filter(item => item.id !== deleteConfirm.id)
        }));
        setDeleteConfirm({ isOpen: false, type: "", id: null, dayId: null, title: "" });
        showSuccessModal("Aktivitas berhasil dihapus!");
      }
    } catch (error) {
      setErrorMessage(error.message || `Gagal menghapus ${deleteConfirm.type}`);
      setDeleteConfirm({ isOpen: false, type: "", id: null, dayId: null, title: "" });
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
      showSuccessModal("Planner berhasil diedit!");
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
      showSuccessModal("Aktivitas berhasil diedit!");
    } catch (error) {
      setErrorMessage(error.message || "Gagal mengedit aktivitas");
    } finally {
      setIsSavingItem(false);
    }
  };

  const triggerDeleteActivity = (dayId, itemId, itemTitle) => {
    setDeleteConfirm({
      isOpen: true,
      type: "activity",
      id: itemId,
      dayId: dayId,
      title: itemTitle
    });
  };

  if (isLoadingTrips) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <p className="text-muted">Memuat planner...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div className="card" style={{ maxWidth: "540px", margin: "0 auto", padding: "3rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img src="/planner_empty.png" alt="Empty Planner" style={{ width: "220px", marginBottom: "1.5rem", opacity: 0.9 }} />
          <h2 style={{ marginBottom: "0.75rem", fontSize: "1.75rem" }}>Belum Ada Trip</h2>
          <p className="text-muted" style={{ marginBottom: "2rem", lineHeight: 1.6 }}>
            Kamu belum punya data planner. Buat trip dulu dari halaman Home agar itinerary bisa muncul di sini.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/" className="btn btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "1.05rem" }}>
              Buat Trip Pertama
            </Link>
            <Link to="/history" className="btn btn-secondary" style={{ padding: "0.75rem 2rem", fontSize: "1.05rem" }}>
              Lihat History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container animate-fade-in" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
        <span>Home</span> <ChevronRight size={14} /> <span>Planner</span> <ChevronRight size={14} />{" "}
        <span style={{ color: "var(--primary)", fontWeight: 500 }}>{selectedTrip?.name || "Trip"}</span>
      </div>

      <div style={{ background: "linear-gradient(135deg, var(--primary-soft) 0%, var(--surface) 40%, var(--accent-soft) 100%)", padding: "clamp(1.5rem, 5vw, 3rem)", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)", marginBottom: "3rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem", border: "1px solid var(--border-color)", position: "relative" }}>
        <div style={{ flex: "1 1 min-content", minWidth: "300px" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
            <span style={{ backgroundColor: "#10b981", color: "white", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "4px", letterSpacing: "0.5px" }}>
              <CheckCircle2 size={13} /> DATABASE SYNC
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: 500 }}>{itineraryDays.length} hari itinerary</span>
          </div>

          {isEditingTrip ? (
            <div style={{ marginBottom: "1.5rem", display: "grid", gap: "0.5rem", backgroundColor: "var(--surface)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
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
            <button type="button" onClick={() => navigate("/map", { state: { trip: selectedTrip } })} className="btn btn-primary" style={{ padding: "0.6rem 1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Map size={18} /> Peta Rute
            </button>
            <button type="button" className="btn btn-secondary" style={{ padding: "0.6rem 1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Share2 size={18} /> Bagikan
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <select value={selectedTripId || ""} onChange={(e) => setSelectedTripId(Number(e.target.value))} style={{ minWidth: "220px", padding: "0.55rem 0.8rem", borderRadius: "10px", border: "1px solid var(--primary)" }}>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/history")} style={{ padding: "0.55rem 0.9rem" }}>
            Riwayat
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleAddDay} disabled={isAddingDay} style={{ padding: "0.55rem 0.9rem" }}>
            {isAddingDay ? "Menambah..." : "Tambah Hari"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={triggerDeletePlanner}
            disabled={isDeletingTrip}
            style={{ padding: "0.55rem 0.9rem", borderColor: "#fecaca", color: "#b91c1c" }}
          >
            Hapus Planner
          </button>
          <button type="button" className="btn-secondary" onClick={handleDownloadPdf} style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, transition: "all 0.2s" }} title="Download PDF">
            <Download size={18} />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "0.9rem" }}>
          {errorMessage}
        </div>
      )}

      <div style={{ maxWidth: "850px", margin: "0 auto" }}>
        
        {selectedTrip && selectedTrip.packing_list && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
            {selectedTrip.packing_list && (
              <div style={{ background: "linear-gradient(145deg, #f5f3ff 0%, #ffffff 100%)", borderRadius: "20px", padding: "2rem", border: "1px solid #ede9fe", boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.1)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-20px", right: "-20px", opacity: 0.05, transform: "rotate(15deg)", pointerEvents: "none" }}>
                  <Package size={150} color="#8b5cf6" />
                </div>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 1.5rem 0", color: "#5b21b6", fontSize: "1.3rem", fontWeight: 700, position: "relative", zIndex: 1 }}>
                  <Package size={24} color="#7c3aed" style={{ filter: "drop-shadow(0 2px 4px rgba(124,58,237,0.3))" }} /> AI Packing List
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", position: "relative", zIndex: 1 }}>
                  {(typeof selectedTrip.packing_list === "string" ? JSON.parse(selectedTrip.packing_list) : selectedTrip.packing_list).map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.8rem", backgroundColor: "#ffffff", padding: "0.8rem 1.2rem", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", cursor: "default" }} onMouseOver={(e) => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(139, 92, 246, 0.15)"; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)"; }}>
                      <div style={{ backgroundColor: "#ede9fe", color: "#7c3aed", borderRadius: "50%", padding: "5px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CheckCircle2 size={16} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: "0.95rem", color: "#334155", fontWeight: 500, lineHeight: 1.3 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


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
              weatherData: weatherAlerts[item.id] || null
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
                  onDeleteActivity={(itemId) => {
                    const item = dayItems.find(i => i.id === itemId);
                    if(item) triggerDeleteActivity(day.id, itemId, item.title || "Aktivitas ini");
                  }}
                  onMapActivity={(itemId) => {
                    navigate("/map", { state: { trip: selectedTrip, autoRouteLocId: `${day.id}-${itemId}` } });
                  }}
                />

                {!showActivityFormByDay[day.id] ? (
                  <div style={{ marginTop: "0.5rem", marginBottom: "3.5rem", marginLeft: "4.5rem", animation: "enterButton 0.3s ease-out" }}>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => setShowActivityFormByDay(prev => ({ ...prev, [day.id]: true }))}
                      style={{ padding: "0.6rem 1.25rem", fontSize: "0.95rem" }}
                    >
                      + Tambah Aktivitas
                    </button>
                  </div>
                ) : (
                  <div className="card" style={{ marginTop: "0.5rem", marginBottom: "3.5rem", padding: "1.5rem", borderRadius: "16px", backgroundColor: "var(--surface)", border: "1px solid var(--border-color)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", animation: "enterForm 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "var(--primary-dark)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.05rem" }}>
                        Pengaturan Hari & Tambah Aktivitas
                      </p>
                      <button 
                        type="button" 
                        onClick={() => setShowActivityFormByDay(prev => ({ ...prev, [day.id]: false }))}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem", padding: "0.25rem 0.5rem" }}
                      >
                        Tutup
                      </button>
                    </div>

                    {/* Date Picker Section */}
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "end", borderBottom: "1px solid var(--border-color)", paddingBottom: "1.25rem", marginBottom: "1.25rem" }}>
                      <div style={{ minWidth: "180px", flex: "1" }}>
                        <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "0.3rem", color: "var(--text-muted)" }}>Tanggal Hari Ini</label>
                        <input type="date" value={dayDateDrafts[day.id] || ""} onChange={(e) => setDayDateDrafts((prev) => ({ ...prev, [day.id]: e.target.value }))} style={{ width: "100%", padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-main)" }} />
                      </div>
                      <button type="button" className="btn btn-secondary" onClick={() => handleSaveDayDate(day)} disabled={savingDayId === day.id} style={{ padding: "0.55rem 0.9rem" }}>
                        {savingDayId === day.id ? "Menyimpan..." : "Simpan Tanggal"}
                      </button>
                    </div>

                    {/* Activity Form Section */}
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.8rem" }}>
                        <input type="text" placeholder="Judul aktivitas" value={draft.title} onChange={(e) => handleDraftChange(day.id, "title", e.target.value)} style={{ padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-main)" }} />
                        <input type="text" placeholder="Lokasi" value={draft.locationName} onChange={(e) => handleDraftChange(day.id, "locationName", e.target.value)} style={{ padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-main)" }} />
                        <input type="time" value={draft.startTime} onChange={(e) => handleDraftChange(day.id, "startTime", e.target.value)} style={{ padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-main)" }} />
                        <input type="time" value={draft.endTime} onChange={(e) => handleDraftChange(day.id, "endTime", e.target.value)} style={{ padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-main)" }} />
                        <select value={draft.activityType} onChange={(e) => handleDraftChange(day.id, "activityType", e.target.value)} style={{ padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-main)" }}>
                          <option value="sightseeing">Sightseeing</option>
                          <option value="dining">Dining</option>
                          <option value="cafe">Cafe</option>
                          <option value="hotel">Hotel</option>
                          <option value="flight">Flight</option>
                          <option value="other">Other</option>
                        </select>
                        <input type="text" placeholder="Catatan" value={draft.notes} onChange={(e) => handleDraftChange(day.id, "notes", e.target.value)} style={{ padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-main)" }} />
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                        <button type="button" className="btn btn-primary" onClick={() => handleAddActivity(day)} disabled={savingActivityDayId === day.id}>
                          {savingActivityDayId === day.id ? "Menyimpan..." : "Simpan Aktivitas"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center", border: "1px dashed var(--border-color)", background: "transparent", boxShadow: "none" }}>
            <img src="/planner_empty.png" alt="Empty Itinerary" style={{ width: "180px", marginBottom: "1.5rem", opacity: 0.8 }} />
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Belum ada hari itinerary</h3>
            <p className="text-muted" style={{ marginBottom: "2rem", maxWidth: "450px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
              Tambahkan hari pertama agar planner mulai tersusun dari database kamu. Atur jadwal perjalananmu dengan mudah di sini.
            </p>
            <button type="button" className="btn btn-primary" onClick={handleAddDay} disabled={isAddingDay} style={{ padding: "0.75rem 2rem", fontSize: "1.05rem" }}>
              {isAddingDay ? "Menambah..." : "+ Tambah Hari Pertama"}
            </button>
          </div>
        )}
      </div>
      </div>

      {/* Modal Edit Activity */}
      {editingItemId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "1.5rem" }}>
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Edit Aktivitas</h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>Judul Aktivitas</label>
                <input type="text" value={editItemDraft.title} onChange={(e) => setEditItemDraft(prev => ({...prev, title: e.target.value}))} style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--primary)" }} />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>Lokasi</label>
                <input type="text" value={editItemDraft.locationName} onChange={(e) => setEditItemDraft(prev => ({...prev, locationName: e.target.value}))} style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--primary)" }} />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>Waktu Mulai</label>
                  <input type="time" value={editItemDraft.startTime} onChange={(e) => setEditItemDraft(prev => ({...prev, startTime: e.target.value}))} style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--primary)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>Waktu Selesai</label>
                  <input type="time" value={editItemDraft.endTime} onChange={(e) => setEditItemDraft(prev => ({...prev, endTime: e.target.value}))} style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--primary)" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>Kategori</label>
                <select value={editItemDraft.activityType} onChange={(e) => setEditItemDraft(prev => ({...prev, activityType: e.target.value}))} style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--primary)" }}>
                  <option value="sightseeing">Sightseeing</option>
                  <option value="dining">Dining</option>
                  <option value="cafe">Cafe</option>
                  <option value="hotel">Hotel</option>
                  <option value="flight">Flight</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>Catatan Tambahan</label>
                <textarea value={editItemDraft.notes} onChange={(e) => setEditItemDraft(prev => ({...prev, notes: e.target.value}))} style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--primary)", minHeight: "80px" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setEditingItemId(null); setEditingItemDayId(null); }} disabled={isSavingItem}>Batal</button>
              <button type="button" className="btn btn-primary" onClick={handleSaveEditedActivity} disabled={isSavingItem}>{isSavingItem ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteConfirm.isOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", animation: "fadeIn 0.2s ease-out" }}>
          <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "1.5rem", animation: "slideUp 0.2s ease-out" }}>
            <h3 style={{ marginTop: 0, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "8px", color: "#b91c1c" }}>
              Konfirmasi Hapus
            </h3>
            <p className="text-muted" style={{ marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Apakah kamu yakin ingin menghapus {deleteConfirm.type === "trip" ? `planner "${deleteConfirm.title}"` : `aktivitas "${deleteConfirm.title}"`}?
              {deleteConfirm.type === "trip" && " Planner akan dipindahkan ke history."}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirm({ isOpen: false, type: "", id: null, dayId: null, title: "" })} disabled={isDeletingTrip}>Batal</button>
              <button type="button" className="btn" style={{ backgroundColor: "#ef4444", color: "white", padding: "0.5rem 1.2rem", borderRadius: "100px", border: "none", fontWeight: 600, cursor: isDeletingTrip ? "wait" : "pointer" }} onClick={confirmDeleteAction} disabled={isDeletingTrip}>
                {isDeletingTrip ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses (Diedit / Dihapus) */}
      {successModal.isOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", animation: "fadeIn 0.2s ease-out" }}>
          <div className="card" style={{ width: "100%", maxWidth: "350px", padding: "2.5rem 1.5rem", animation: "slideUp 0.2s ease-out", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#d1fae5", color: "#10b981", marginBottom: "1rem" }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-main)", fontSize: "1.25rem" }}>Berhasil!</h3>
            <p className="text-muted" style={{ margin: 0, fontSize: "1rem" }}>{successModal.message}</p>
          </div>
        </div>
      )}
    </>
  );
}
