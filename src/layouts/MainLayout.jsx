import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function MainLayout() {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main className="main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
