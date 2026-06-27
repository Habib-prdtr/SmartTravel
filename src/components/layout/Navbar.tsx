import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plane, Menu, X, ChevronRight, LogOut, User, Sun, Moon } from "lucide-react";
import "./Navbar.css";
import { clearSession, getUser, isAuthenticated } from "../../lib/session";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [user, setUser] = useState(getUser());
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const isDarkTheme = document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
    if (isDarkTheme) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    return isDarkTheme;
  });

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

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
    setShowLogoutPopup(true);
  };

  const confirmLogout = () => {
    clearSession();
    window.dispatchEvent(new Event("storage"));
    navigate("/auth");
    setShowLogoutPopup(false);
  };

  const handleMasuk = () => {
    navigate("/auth");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY) {
        setHidden(false);
      }
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
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
    <>
      <nav className={`navbar ${scrolled ? "nav-scrolled" : ""} ${hidden ? "nav-hidden" : ""}`}>
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
                  onClick={toggleTheme}
                  style={{ padding: 0, width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "none", background: "transparent", color: "var(--text-main)" }}
                  title="Ganti Tema"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
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
                  onClick={toggleTheme}
                  style={{ padding: 0, width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "none", background: "transparent", color: "var(--text-main)" }}
                  title="Ganti Tema"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
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
        </div>
      </nav>

      {/* Logout Popup Modal */}
      {showLogoutPopup && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem", animation: "fadeIn 0.2s ease-out" }}>
          <div className="card" style={{ width: "100%", maxWidth: "380px", padding: "1.75rem", animation: "slideUp 0.2s ease-out", backgroundColor: "var(--surface)", borderRadius: "20px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#fef2f2", color: "#ef4444", margin: "0 auto 1.25rem" }}>
              <LogOut size={24} strokeWidth={2.5} />
            </div>
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem", textAlign: "center", fontSize: "1.25rem", color: "var(--text-main)", fontWeight: 800 }}>Konfirmasi Keluar</h3>
            <p className="text-muted" style={{ marginBottom: "1.5rem", textAlign: "center", fontSize: "0.95rem", lineHeight: 1.5 }}>
              Apakah kamu yakin ingin keluar dari akun ini? Kamu harus masuk kembali untuk melihat rencana perjalananmu.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowLogoutPopup(false)} style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", fontWeight: 600 }}>Batal</button>
              <button type="button" className="btn" onClick={confirmLogout} style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", fontWeight: 600, backgroundColor: "#ef4444", color: "white", border: "none", cursor: "pointer" }}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
