import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Map, Wallet, User } from "lucide-react";

export default function MobileBottomNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: <Home size={22} /> },
    { path: "/planner", label: "Planner", icon: <Calendar size={22} /> },
    { path: "/map", label: "Map", icon: <Map size={22} /> },
    { path: "/budget", label: "Budget", icon: <Wallet size={22} /> },
    { path: "/profile", label: "Profil", icon: <User size={22} /> },
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-container">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${active ? "active" : ""}`}
            >
              <div className="bottom-nav-icon">
                {item.icon}
              </div>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
