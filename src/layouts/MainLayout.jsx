import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function MainLayout() {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Global Decorative Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '600px',
          background: 'linear-gradient(180deg, var(--primary-soft) 0%, rgba(239, 246, 255, 0) 100%)'
        }} />
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
          borderRadius: '50%'
        }} />
      </div>

      <Navbar />
      <main className="main-content" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
