import React from 'react';
import { MapPin, CalendarDays, Wallet, Sparkles } from 'lucide-react';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <span className="badge">AI-Powered Travel Planner</span>
            <h1 className="hero-title">
              Rencanakan Liburan Impianmu Secara Otomatis
            </h1>
            <p className="hero-subtitle">
              SmartTravel membantu menyusun itinerary harian, mencari tempat wisata, dan mengestimasi biaya dengan cerdas. Cukup masukkan tujuan dan budgetmu!
            </p>
            
            <div className="hero-search-box card">
              <div className="search-inputs">
                <div className="input-group">
                  <MapPin className="input-icon" size={22} />
                  <div className="input-field-wrapper">
                    <label>Tujuan</label>
                    <input type="text" placeholder="Mau ke mana?" />
                  </div>
                </div>
                <div className="divider"></div>
                <div className="input-group">
                  <CalendarDays className="input-icon" size={22} />
                  <div className="input-field-wrapper">
                    <label>Tanggal</label>
                    <input type="date" />
                  </div>
                </div>
                <div className="divider"></div>
                <div className="input-group">
                  <Wallet className="input-icon" size={22} />
                  <div className="input-field-wrapper">
                    <label>Budget</label>
                    <input type="text" placeholder="Rp / USD" />
                  </div>
                </div>
              </div>
              <button className="btn btn-primary search-btn">
                <Sparkles size={18} />
                Generate Itinerary
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section container">
        <div className="section-header">
          <span className="badge text-primary" style={{ backgroundColor: 'var(--primary-soft)', border: 'none', marginBottom: '1rem' }}>Fitur Utama</span>
          <h2>Mengapa Memilih SmartTravel?</h2>
          <p className="text-muted">Desain cerdas untuk perjalanan yang lebih mudah, efisien, dan terarah.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              <Sparkles size={28} />
            </div>
            <h3>Itinerary Otomatis</h3>
            <p>Jadwal harian per jam yang disusun cerdas berdasarkan durasi dan preferensi perjalanan kamu.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
              <Wallet size={28} />
            </div>
            <h3>Estimasi Biaya</h3>
            <p>Perhitungkan budget dengan proaktif dan akurat, memastikan tidak ada pengeluaran tak terduga.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
              <MapPin size={28} />
            </div>
            <h3>Peta Interaktif</h3>
            <p>Navigasi rute optimal wisata kamu dengan peta visual interaktif yang terhubung langsung.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
