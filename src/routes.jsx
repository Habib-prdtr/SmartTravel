import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Budget from './pages/Budget';
import Planner from './pages/Planner';
import MapPage from './pages/MapPage';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import { isAuthenticated } from './lib/session';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rute Auth berdiri sendiri tanpa MainLayout (Navbar & Footer) */}
      <Route
        path="/auth"
        element={(
          <PublicOnlyRoute>
            <Auth />
          </PublicOnlyRoute>
        )}
      />

      {/* Rute yang memuat antarmuka reguler (berisi Navbar & Footer) */}
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        )}
      >
        <Route index element={<Home />} />
        <Route path="planner" element={<Planner />} />
        <Route path="map" element={<MapPage />} />
        <Route path="budget" element={<Budget />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
