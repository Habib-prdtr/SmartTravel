import React from 'react';
import { Plane, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: 'var(--surface)', 
      borderTop: '1px solid var(--border-color)',
      padding: '4rem 0 2rem 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'space-between' }}>
        
        {/* Brand Section */}
        <div style={{ flex: '1 1 300px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Plane size={20} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>SmartTravel</span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', maxWidth: '350px' }}>
            Aplikasi perencana perjalanan berbasis AI yang membantu menyusun rute, anggaran, dan aktivitas liburan Anda dengan praktis.
          </p>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-light)' }}>
            <a href="#" style={{ color: 'inherit', transition: 'color 0.2s', fontSize: '0.9rem', fontWeight: 600 }}>FB</a>
            <a href="#" style={{ color: 'inherit', transition: 'color 0.2s', fontSize: '0.9rem', fontWeight: 600 }}>TW</a>
            <a href="#" style={{ color: 'inherit', transition: 'color 0.2s', fontSize: '0.9rem', fontWeight: 600 }}>IG</a>
            <a href="#" style={{ color: 'inherit', transition: 'color 0.2s' }}><Globe size={20} /></a>
          </div>
        </div>

        {/* Links Section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', flex: '2 1 400px', justifyContent: 'space-around' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Produk</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><Link to="/planner" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', transition: 'color 0.2s' }}>Trip Planner</Link></li>
              <li><Link to="/map" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', transition: 'color 0.2s' }}>Peta Wisata</Link></li>
              <li><Link to="/budget" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', transition: 'color 0.2s' }}>Dasbor Keuangan</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Bantuan</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', transition: 'color 0.2s' }}>Pusat Bantuan</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', transition: 'color 0.2s' }}>Syarat & Ketentuan</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', transition: 'color 0.2s' }}>Kebijakan Privasi</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Kontak</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ color: 'var(--text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> support@smarttravel.id
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Copyright Bar */}
      <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '3rem', paddingTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: 0 }}>
          &copy; {new Date().getFullYear()} SmartTravel. All rights reserved. Didesain secara eksklusif.
        </p>
      </div>
    </footer>
  );
}
