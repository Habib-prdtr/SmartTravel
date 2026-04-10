import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Budget from './pages/Budget';
import Planner from './pages/Planner';
import MapPage from './pages/MapPage';
import Auth from './pages/Auth';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rute Auth berdiri sendiri tanpa MainLayout (Navbar & Footer) */}
      <Route path="/auth" element={<Auth />} />

      {/* Rute yang memuat antarmuka reguler (berisi Navbar & Footer) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="planner" element={<Planner />} />
        <Route path="map" element={<MapPage />} />
        <Route path="budget" element={<Budget />} />
      </Route>
    </Routes>
  );
}
