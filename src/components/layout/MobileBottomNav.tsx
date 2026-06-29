import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Map, Wallet, User } from "lucide-react";

export default function MobileBottomNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
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

  const navItems = [
    { path: "/", label: "Home", icon: <Home size={22} /> },
    { path: "/planner", label: "Planner", icon: <Calendar size={22} /> },
    { path: "/map", label: "Map", icon: <Map size={22} /> },
    { path: "/budget", label: "Budget", icon: <Wallet size={22} /> },
    { path: "/profile", label: "Profil", icon: <User size={22} /> },
  ];

  return (
    <nav className={`mobile-bottom-nav ${hidden ? "nav-hidden-bottom" : ""}`}>
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
