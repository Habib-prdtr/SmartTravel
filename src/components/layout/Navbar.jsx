import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plane, Menu, X, ChevronRight, LogOut, User } from "lucide-react";
import "./Navbar.css";
import { clearSession, getUser, isAuthenticated } from "../../lib/session";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [user, setUser] = useState(getUser());

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = "";
  };

  const handleLogout = () => {
    closeMenu();
    if (window.confirm("Apakah kamu yakin ingin keluar?")) {
      clearSession();
      window.dispatchEvent(new Event("storage"));
      navigate("/auth");
    }
  };

  const handleMasuk = () => {
    closeMenu();
    navigate("/auth");
  };

  const handleProfile = () => {
    closeMenu();
    navigate("/profile");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const syncSession = () => {
      setIsLoggedIn(isAuthenticated());
      setUser(getUser());
    };

    syncSession();
    window.addEventListener("focus", syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("focus", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="container nav-content">
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <div className="brand-logo">
            <Plane size={24} className="brand-icon" />
          </div>
          <div className="brand-text-styled" style={{ fontSize: "1.45rem" }}>
            <span className="smart">Smart</span>
            <span className="travel">Travel</span>
          </div>
        </Link>

        {/* Desktop Links (Center) */}
        <div className="nav-links desktop-only">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>
          <Link
            to="/planner"
            className={`nav-link ${isActive("/planner") ? "active" : ""}`}
          >
            Planner
          </Link>
          <Link
            to="/map"
            className={`nav-link ${isActive("/map") ? "active" : ""}`}
          >
            Map
          </Link>
          <Link
            to="/budget"
            className={`nav-link ${isActive("/budget") ? "active" : ""}`}
          >
            Budget
          </Link>
        </div>

        {/* Desktop Actions (Right) */}
        <div className="nav-actions desktop-only">
          {isLoggedIn ? (
            <>
              <button
                className="btn btn-secondary nav-btn"
                onClick={handleProfile}
                style={{ padding: 0, width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                title={user?.name ? `Profil (${user.name})` : "Profil"}
              >
                <User size={20} />
              </button>
              <button
                className="btn"
                onClick={handleLogout}
                style={{
                  backgroundColor: "#fef2f2",
                  color: "#ef4444",
                  border: "1px solid #fee2e2",
                  borderRadius: "100px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0.45rem 1rem",
                  fontWeight: 600,
                  transition: "all 0.2s",
                  boxShadow: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fee2e2";
                  e.currentTarget.style.borderColor = "#fca5a5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fef2f2";
                  e.currentTarget.style.borderColor = "#fee2e2";
                }}
              >
                Keluar <LogOut size={16} strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-secondary nav-btn"
                onClick={handleMasuk}
              >
                Masuk
              </button>
              <button
                className="btn btn-primary nav-btn"
                onClick={() => navigate("/planner")}
              >
                Mulai Plan
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMenu}
          aria-label="Open menu"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-menu-overlay ${isMenuOpen ? "open" : ""}`}
        onClick={closeMenu}
      ></div>

      {/* Mobile Drawer Container */}
      <div className={`mobile-menu-container ${isMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="nav-brand">
            <div className="brand-logo">
              <Plane size={20} className="brand-icon" />
            </div>
            <div className="brand-text-styled" style={{ fontSize: "1.3rem" }}>
              <span className="smart">Smart</span>
              <span className="travel">Travel</span>
            </div>
          </div>
          <button
            className="mobile-close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mobile-nav-links">
          <Link
            to="/"
            className={`mobile-nav-link ${isActive("/") ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span>Home</span>
            <ChevronRight size={18} className="chevron" />
          </Link>
          <Link
            to="/planner"
            className={`mobile-nav-link ${isActive("/planner") ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span>Planner</span>
            <ChevronRight size={18} className="chevron" />
          </Link>
          <Link
            to="/map"
            className={`mobile-nav-link ${isActive("/map") ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span>Map</span>
            <ChevronRight size={18} className="chevron" />
          </Link>
          <Link
            to="/budget"
            className={`mobile-nav-link ${isActive("/budget") ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span>Budget</span>
            <ChevronRight size={18} className="chevron" />
          </Link>
        </div>

        <div className="mobile-nav-footer">
          {isLoggedIn ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={handleProfile}
                style={{ padding: 0, width: "42px", height: "42px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, margin: "0 auto" }}
                title="Profil"
              >
                <User size={22} />
              </button>
              <button
                className="btn"
                onClick={handleLogout}
                style={{
                  backgroundColor: "#fef2f2",
                  color: "#ef4444",
                  border: "1px solid #fee2e2",
                  borderRadius: "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontWeight: 600,
                  boxShadow: "none",
                }}
              >
                Keluar <LogOut size={18} strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={handleMasuk}>
                Masuk
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/planner")}
              >
                Mulai Plan
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
