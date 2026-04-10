import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Budget from './pages/Budget';

// Komponen sementara (Mock) sebelum halamannya selesai dibuat
const Planner = () => <div className="container" style={{paddingTop: "4rem"}}><h2>Trip Planner</h2><p className="text-muted">Jadwal harian yang disusun cerdas akan muncul di sini.</p></div>;
const MapViewPage = () => <div className="container" style={{paddingTop: "4rem"}}><h2>Interactive Map</h2><p className="text-muted">Peta wisata akan muncul di sini.</p></div>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="planner" element={<Planner />} />
        <Route path="map" element={<MapViewPage />} />
        <Route path="budget" element={<Budget />} />
      </Route>
    </Routes>
  );
}
