import React from 'react';
import { Calendar, Map, CheckCircle2, ChevronRight, Share2, Download, Printer } from 'lucide-react';
import { ItineraryDay } from './Itinerary';

export default function Planner() {
  const mockActivitiesDay1 = [
    { time: "09:00", title: "Tiba di Bandara Ngurah Rai", description: "Penjemputan sewaan mobil dan menuju ke hotel untuk menitipkan barang bawaan.", type: "flight", duration: "1 Jam" },
    { time: "10:30", title: "Check-in The Apurva Kempinski", description: "Proses check-in, menyimpan barang, dan bersantai sejenak menikmati pemandangan lobi yang mengagumkan.", type: "hotel", duration: "1.5 Jam" },
    { time: "12:00", title: "Makan Siang di Naughty Nuri's", description: "Babi panggang / Iga bakar legendaris khas Bali. Porsi besar, cocok untuk *sharing*.", type: "dining", duration: "2 Jam" },
    { time: "15:00", title: "Garuda Wisnu Kencana (GWK)", description: "Eksplorasi taman budaya yang luas, melihat patung megah, dan menyaksikan pertunjukan tari kecak sore hari.", type: "sightseeing", duration: "3 Jam" }
  ];

  const mockActivitiesDay2 = [
    { time: "08:00", title: "Sarapan di Motel Mexicola", description: "Sarapan estetik dengan nuansa Meksiko yang warna-warni, tempat terbaik untuk berfoto di pagi hari.", type: "cafe", duration: "1.5 Jam" },
    { time: "10:00", title: "Pantai Melasti", description: "Berenang dan bersantai di pantai pasir putih dengan tebing kapur yang megah di belakangnya.", type: "sightseeing", duration: "4 Jam" },
    { time: "14:30", title: "Late Lunch di CATCH Beach Club", description: "Menikmati hidangan laut sambil bersantai menunggu matahari terbenam dengan hiburan DJ.", type: "dining", duration: "3 Jam" },
    { time: "19:00", title: "Kembali ke Resor", description: "Istirahat untuk memulihkan energi menghadapi hari ketiga.", type: "hotel", duration: "" }
  ];

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Breadcrumb minimalis */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <span>Home</span> <ChevronRight size={14} /> <span>Planner</span> <ChevronRight size={14} /> <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Eksplorasi Selatan Bali</span>
      </div>

      {/* Header Planner */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--primary-soft) 100%)',
        padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
        marginBottom: '4rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ flex: '1 1 min-content', minWidth: '300px' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ 
              backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.75rem', 
              borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px',
              letterSpacing: '0.5px'
            }}>
              <CheckCircle2 size={13} /> AI GENERATED
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>• 3 Hari 2 Malam</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>Eksplorasi Selatan Bali</h1>
          <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
            <Calendar size={18} /> 12 Agustus - 14 Agustus 2026
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Map size={18} /> Peta Rute
            </button>
            <button className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Share2 size={18} /> Bagikan
            </button>
          </div>
        </div>
        
        {/* Aksi Tambahan di Kanan */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ 
            width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s'
          }} title="Download PDF">
            <Download size={18} />
          </button>
          <button style={{ 
            width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s'
          }} title="Print Itinerary">
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Itinerary Timeline */}
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <ItineraryDay dayNumber="1" date="Senin, 12 Agu 2026" activities={mockActivitiesDay1} />
        <ItineraryDay dayNumber="2" date="Selasa, 13 Agu 2026" activities={mockActivitiesDay2} />
        
        <div style={{ textAlign: 'center', padding: '3rem 0', borderTop: '1px dashed var(--border-color)', marginTop: '2rem' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', 
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' 
          }}>
            <Calendar size={28} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Hari ke-3 belum direncanakan</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>Anda masih memiliki 1 hari yang belum diisi dengan aktivitas.</p>
          <button className="btn btn-secondary">Tambah Aktivitas Hari 3</button>
        </div>
      </div>
    </div>
  );
}
