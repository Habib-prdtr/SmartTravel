import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MobileBottomNav from '../components/layout/MobileBottomNav';

export default function MainLayout() {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Global Decorative Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Dot Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, white 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, white 40%, transparent 100%)',
          opacity: 0.8
        }} />
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '600px',
          background: 'linear-gradient(180deg, var(--primary-soft) 0%, var(--bg-gradient-fade) 100%)'
        }} />
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, var(--bg-glow-1) 0%, var(--bg-gradient-fade) 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, var(--bg-glow-2) 0%, var(--bg-gradient-fade) 70%)',
          borderRadius: '50%'
        }} />
      </div>

      <Navbar />
      <main className="main-content" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
