import React, { useState } from 'react';
import { MapPin, CalendarDays, Wallet, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../../lib/api';
import { isAuthenticated } from '../../lib/session';

export default function TripForm() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated()) {
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdTrip = await createTrip({
        name: `Trip ke ${destination}`,
        destination,
        startDate: date,
        endDate: date,
        notes: budget ? `Estimasi budget: Rp ${Number(budget).toLocaleString('id-ID')}` : null
      });

      navigate('/planner', { state: { trip: createdTrip } });
    } catch (error) {
      setErrorMessage(error.message || 'Gagal membuat trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleGenerate} className="hero-search-box">
      <div className="search-inputs">
        
        <div className="input-group">
          <MapPin className="input-icon" size={22} />
          <div className="input-field-wrapper">
            <label>Tujuan</label>
            <input type="text" placeholder="Mau ke mana?" required value={destination} onChange={(e) => setDestination(e.target.value)} />
          </div>
        </div>

        <div className="divider"></div>

        <div className="input-group">
          <CalendarDays className="input-icon" size={22} />
          <div className="input-field-wrapper">
            <label>Tanggal</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="divider"></div>

        <div className="input-group">
          <Wallet className="input-icon" size={22} />
          <div className="input-field-wrapper">
            <label>Budget</label>
            <input type="number" placeholder="Rp 0" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
        </div>

      </div>

      {errorMessage && (
        <p style={{ color: '#b91c1c', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>{errorMessage}</p>
      )}

      <button type="submit" className="btn btn-primary search-btn" disabled={isSubmitting}>
        <Sparkles size={18} /> {isSubmitting ? 'Menyimpan...' : 'Generate Itinerary'}
      </button>
    </form>
  );
}

