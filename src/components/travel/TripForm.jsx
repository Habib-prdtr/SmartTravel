import React from 'react';
import { MapPin, CalendarDays, Wallet, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TripForm() {
  const navigate = useNavigate();

  const handleGenerate = (e) => {
    e.preventDefault();
    navigate('/planner');
  };

  return (
    <form onSubmit={handleGenerate} className="hero-search-box">
      <div className="search-inputs">
        
        <div className="input-group">
          <MapPin className="input-icon" size={22} />
          <div className="input-field-wrapper">
            <label>Tujuan</label>
            <input type="text" placeholder="Mau ke mana?" required />
          </div>
        </div>

        <div className="divider"></div>

        <div className="input-group">
          <CalendarDays className="input-icon" size={22} />
          <div className="input-field-wrapper">
            <label>Tanggal</label>
            <input type="date" required />
          </div>
        </div>

        <div className="divider"></div>

        <div className="input-group">
          <Wallet className="input-icon" size={22} />
          <div className="input-field-wrapper">
            <label>Budget</label>
            <input type="number" placeholder="Rp 0" />
          </div>
        </div>

      </div>

      <button type="submit" className="btn btn-primary search-btn">
        <Sparkles size={18} /> Generate Itinerary
      </button>
    </form>
  );
}

