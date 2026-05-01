import React, { useEffect, useMemo, useState } from "react";
import { MapPin, CalendarDays, Wallet, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createTrip, searchDestinationPlaces, generateTripWithAI } from "../../lib/api";
import { isAuthenticated } from "../../lib/session";

function toPlaceParts(place) {
  const address = place?.address || {};
  const primary =
    place?.name ||
    address?.city ||
    address?.town ||
    address?.village ||
    address?.county ||
    address?.state ||
    (place?.display_name ? String(place.display_name).split(",")[0].trim() : "Lokasi");

  const secondaryTokens = [
    address?.city || address?.town || address?.village,
    address?.county,
    address?.state,
    address?.country
  ].filter(Boolean);

  const secondary = secondaryTokens.length > 0 ? secondaryTokens.join(", ") : place?.display_name || "";
  return { primary, secondary };
}

function toDestinationLabel(place) {
  const { primary, secondary } = toPlaceParts(place);
  return secondary && !secondary.includes(primary) ? `${primary}, ${secondary}` : primary;
}

export default function TripForm() {
  const navigate = useNavigate();
  const [destinationInput, setDestinationInput] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mode, setMode] = useState("manual"); // "manual" | "ai"
  const [aiPrompt, setAiPrompt] = useState("");

  const canSearch = destinationInput.trim().length >= 3;

  useEffect(() => {
    if (!canSearch) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const places = await searchDestinationPlaces(destinationInput, controller.signal);
        setSuggestions(places);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [destinationInput, canSearch]);

  const selectedLabel = useMemo(
    () => (selectedPlace ? toDestinationLabel(selectedPlace) : destinationInput.trim()),
    [selectedPlace, destinationInput]
  );

  const handleGenerate = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isAuthenticated()) {
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "ai") {
        if (!aiPrompt.trim()) {
          setErrorMessage("Silakan isi prompt AI terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const aiTrip = await generateTripWithAI(aiPrompt);
        navigate("/planner", { state: { trip: { id: aiTrip.tripId, name: aiTrip.tripName } } });
      } else {
        if (!selectedLabel) {
          setErrorMessage("Silakan isi tujuan terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        
        const parsedBudget = Number(budget);
        const totalBudget = Number.isFinite(parsedBudget) && parsedBudget > 0 ? parsedBudget : null;

        const createdTrip = await createTrip({
          name: `Trip ke ${selectedLabel.split(",")[0]}`,
          destination: selectedLabel,
          startDate: date,
          endDate: date,
          notes:
            selectedPlace?.lat && selectedPlace?.lon
              ? `Lat: ${selectedPlace.lat}, Lon: ${selectedPlace.lon}`
              : null,
          totalBudget,
          currency: "IDR"
        });

        navigate("/planner", { state: { trip: createdTrip } });
      }
    } catch (error) {
      setErrorMessage(error.message || "Gagal membuat trip");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem", gap: "1rem" }}>
        <button
          onClick={() => setMode("manual")}
          style={{
            padding: "0.5rem 1.5rem", borderRadius: "20px", fontWeight: 600, border: "none", cursor: "pointer",
            backgroundColor: mode === "manual" ? "var(--primary)" : "var(--surface)",
            color: mode === "manual" ? "white" : "var(--text-muted)",
            boxShadow: mode === "manual" ? "var(--shadow-sm)" : "none"
          }}
        >
          Buat Manual
        </button>
        <button
          onClick={() => setMode("ai")}
          style={{
            padding: "0.5rem 1.5rem", borderRadius: "20px", fontWeight: 600, border: "none", cursor: "pointer",
            backgroundColor: mode === "ai" ? "#8b5cf6" : "var(--surface)",
            color: mode === "ai" ? "white" : "var(--text-muted)",
            boxShadow: mode === "ai" ? "var(--shadow-sm)" : "none",
            display: "flex", alignItems: "center", gap: "0.5rem"
          }}
        >
          <Sparkles size={16} /> AI Magic
        </button>
      </div>

      <form 
        onSubmit={handleGenerate} 
        className={`hero-search-box ${mode === "ai" ? "hero-search-box--ai" : "hero-search-box--manual"}`}
      >
        {mode === "manual" ? (
          <div className="search-inputs">
            <div className="input-group">
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                <MapPin size={14} style={{ color: "var(--primary)" }} /> Tujuan
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Cari kota atau tempat..."
                  required={mode === "manual"}
                  value={destinationInput}
                  onChange={(e) => {
                    setDestinationInput(e.target.value);
                    setSelectedPlace(null);
                  }}
                  style={{ border: "none", background: "transparent", width: "100%", fontSize: "0.98rem", fontWeight: 500, color: "var(--text-main)", outline: "none", fontFamily: "inherit", padding: 0 }}
                />
                {canSearch && (
                  <div style={{ position: "absolute", top: "calc(100% + 0.4rem)", left: 0, right: 0, backgroundColor: "var(--surface)", border: "1px solid var(--border-color)", borderRadius: "10px", boxShadow: "var(--shadow-md)", maxHeight: "280px", overflowY: "auto", zIndex: 20 }}>
                    {isSearching ? (
                      <p style={{ margin: 0, padding: "0.65rem 0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>Mencari lokasi...</p>
                    ) : suggestions.length === 0 ? (
                      <p style={{ margin: 0, padding: "0.65rem 0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>Tidak ada hasil.</p>
                    ) : (
                      suggestions.map((place) => (
                        <button key={place.place_id} type="button"
                          onClick={() => { setSelectedPlace(place); setDestinationInput(toDestinationLabel(place)); setSuggestions([]); }}
                          style={{ width: "100%", border: "none", background: "transparent", textAlign: "left", padding: "0.75rem", cursor: "pointer", borderBottom: "1px solid var(--border-color)" }}
                        >
                          <span style={{ display: "block", fontSize: "0.87rem", fontWeight: 600, color: "var(--text-main)" }}>{toPlaceParts(place).primary}</span>
                          <span style={{ display: "block", marginTop: "0.2rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>{toPlaceParts(place).secondary}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="input-group">
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                <CalendarDays size={14} style={{ color: "var(--primary)" }} /> Tanggal
              </label>
              <input type="date" required={mode === "manual"} value={date} onChange={(e) => setDate(e.target.value)}
                style={{ border: "none", background: "transparent", width: "100%", fontSize: "0.98rem", fontWeight: 500, color: "var(--text-main)", outline: "none", fontFamily: "inherit", padding: 0 }}
              />
            </div>

            <div className="input-group">
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                <Wallet size={14} style={{ color: "var(--primary)" }} /> Budget
              </label>
              <input type="number" placeholder="Rp 0 (opsional)" value={budget} onChange={(e) => setBudget(e.target.value)}
                style={{ border: "none", background: "transparent", width: "100%", fontSize: "0.98rem", fontWeight: 500, color: "var(--text-main)", outline: "none", fontFamily: "inherit", padding: 0 }}
              />
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.8rem", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8b5cf6", marginBottom: "0.2rem" }}>
              <span style={{ fontWeight: 600, fontSize: "1.05rem" }}>✨ Jelaskan liburan seperti apa yang kamu inginkan</span>
            </div>
            <textarea
              placeholder="Contoh: Buatkan itinerary 3 hari di Tokyo dengan budget 5 juta, fokus ke kuliner dan belanja."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              style={{
                width: "100%", minHeight: "110px", padding: "1.2rem", borderRadius: "16px",
                border: "2px solid #ddd6fe", fontSize: "1.05rem", resize: "vertical",
                backgroundColor: "#f5f3ff", color: "#4c1d95", outline: "none",
                lineHeight: "1.5", transition: "all 0.3s ease"
              }}
              onFocus={(e) => { e.target.style.border = "2px solid #8b5cf6"; e.target.style.boxShadow = "0 0 0 4px rgba(139, 92, 246, 0.15)"; e.target.style.backgroundColor = "#fff"; }}
              onBlur={(e) => { e.target.style.border = "2px solid #ddd6fe"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#f5f3ff"; }}
              required={mode === "ai"}
            />
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", marginTop: "0.2rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>Coba:</span>
              {["Honeymoon 3 hari di Bali", "Backpacker ke Jogja budget 1 juta", "Wisata alam di Lombok"].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAiPrompt(suggestion)}
                  style={{
                    padding: "0.3rem 0.75rem", borderRadius: "20px", border: "1px solid #c4b5fd",
                    backgroundColor: "white", color: "#6d28d9", fontSize: "0.8rem", cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#ede9fe"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "white"}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {errorMessage && <p style={{ color: "#b91c1c", margin: mode === "ai" ? "0.5rem 0 0 0" : "0.5rem 0 0 0", fontSize: "0.9rem", textAlign: mode === "ai" ? "left" : "center", width: "100%" }}>{errorMessage}</p>}

        <button 
          type="submit" 
          className="btn search-btn" 
          disabled={isSubmitting}
          style={{ 
            backgroundColor: mode === "ai" ? "#8b5cf6" : "var(--primary)",
            boxShadow: mode === "ai" ? "0 4px 14px rgba(139, 92, 246, 0.3)" : "0 4px 14px rgba(59,130,246,0.2)",
            color: "white",
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          <Sparkles size={18} /> 
          {isSubmitting 
            ? (mode === "ai" ? "Menyusun itinerary..." : "Menyimpan...") 
            : (mode === "ai" ? "✨ Generate dengan AI" : "Mulai Rencana →")}
        </button>
      </form>
    </div>
  );
}
