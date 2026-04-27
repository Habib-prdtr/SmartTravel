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

      <form onSubmit={handleGenerate} className="hero-search-box" style={{ flexDirection: mode === "ai" ? "column" : "row" }}>
        {mode === "manual" ? (
          <div className="search-inputs">
            <div className="input-group">
              <MapPin className="input-icon" size={22} />
              <div className="input-field-wrapper" style={{ position: "relative" }}>
                <label>Tujuan</label>
                <input
                  type="text"
                  placeholder="Cari kota/tempat nyata..."
                  required={mode === "manual"}
                  value={destinationInput}
                  onChange={(e) => {
                    setDestinationInput(e.target.value);
                    setSelectedPlace(null);
                  }}
                />
                {canSearch && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 0.4rem)",
                      left: 0,
                      right: 0,
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "10px",
                      boxShadow: "var(--shadow-md)",
                      maxHeight: "320px",
                      overflowY: "auto",
                      zIndex: 20
                    }}
                  >
                    {isSearching ? (
                      <p style={{ margin: 0, padding: "0.65rem 0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Mencari lokasi...
                      </p>
                    ) : suggestions.length === 0 ? (
                      <p style={{ margin: 0, padding: "0.65rem 0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Tidak ada hasil.
                      </p>
                    ) : (
                      suggestions.map((place) => (
                        <button
                          key={place.place_id}
                          type="button"
                          onClick={() => {
                            setSelectedPlace(place);
                            setDestinationInput(toDestinationLabel(place));
                            setSuggestions([]);
                          }}
                          style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            textAlign: "left",
                            padding: "0.85rem 0.85rem",
                            cursor: "pointer",
                            borderBottom: "1px solid var(--border-color)"
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.87rem",
                              fontWeight: 600,
                              color: "var(--text-main)",
                              whiteSpace: "normal",
                              lineHeight: 1.35
                            }}
                          >
                            {toPlaceParts(place).primary}
                          </span>
                          <span
                            style={{
                              display: "block",
                              marginTop: "0.3rem",
                              fontSize: "0.78rem",
                              color: "var(--text-muted)",
                              whiteSpace: "normal",
                              lineHeight: 1.35
                            }}
                          >
                            {toPlaceParts(place).secondary}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="divider" />

            <div className="input-group">
              <CalendarDays className="input-icon" size={22} />
              <div className="input-field-wrapper">
                <label>Tanggal</label>
                <input type="date" required={mode === "manual"} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="divider" />

            <div className="input-group">
              <Wallet className="input-icon" size={22} />
              <div className="input-field-wrapper">
                <label>Budget</label>
                <input type="number" placeholder="Rp 0" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", padding: "0.5rem" }}>
            <textarea
              placeholder="Contoh: Buatkan itinerary 3 hari di Tokyo dengan budget 5 juta, fokus ke kuliner dan belanja."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              style={{
                width: "100%", minHeight: "100px", padding: "1rem", borderRadius: "12px",
                border: "1px solid var(--border-color)", fontSize: "1rem", resize: "vertical",
                backgroundColor: "var(--bg-color)"
              }}
              required={mode === "ai"}
            />
          </div>
        )}

        {errorMessage && <p style={{ color: "#b91c1c", margin: "0.5rem 0 0 0", fontSize: "0.9rem", textAlign: "center", width: "100%" }}>{errorMessage}</p>}

        <button 
          type="submit" 
          className="btn search-btn" 
          disabled={isSubmitting}
          style={{ 
            backgroundColor: mode === "ai" ? "#8b5cf6" : "var(--primary)",
            width: mode === "ai" ? "100%" : "auto",
            marginTop: mode === "ai" ? "1rem" : "0"
          }}
        >
          <Sparkles size={18} /> 
          {isSubmitting 
            ? (mode === "ai" ? "AI sedang menyusun itinerary (ini butuh waktu)..." : "Menyimpan...") 
            : (mode === "ai" ? "Generate dengan AI" : "Mulai Rencana")}
        </button>
      </form>
    </div>
  );
}
