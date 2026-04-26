import React, { useState } from "react";
import { Plane, Mail, Lock, User, ArrowRight, Globe, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../lib/api";
import { saveSession } from "../lib/session";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const payload = isLogin
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password };

      const result = isLogin ? await login(payload) : await register(payload);
      saveSession(result);
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.85rem 1rem",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    fontSize: "1rem",
    color: "var(--text-main)",
    backgroundColor: "var(--bg-color)",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit"
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "var(--text-main)",
    marginBottom: "0.5rem"
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "var(--primary)";
    e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "var(--border-color)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <div
        className="auth-visual"
        style={{
          flex: 1,
          display: "none",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3rem",
          background: "linear-gradient(145deg, #1e40af 0%, #3b82f6 55%, #60a5fa 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          minWidth: "420px"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-15%",
            right: "-15%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.07)"
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "-15%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.1)"
          }}
        />

        <Link
          to="/"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", color: "white", textDecoration: "none", zIndex: 1 }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.3)"
            }}
          >
            <Plane size={24} />
          </div>
          <div className="brand-text-styled light" style={{ fontSize: "1.5rem" }}>
            <span className="smart">Smart</span>
            <span className="travel">Travel</span>
          </div>
        </Link>

        <div style={{ zIndex: 1 }}>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              opacity: 0.65,
              marginBottom: "1.25rem"
            }}
          >
            {isLogin ? "Selamat Kembali" : "Mulai Perjalanan"}
          </div>
          <h2 style={{ fontSize: "2.6rem", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-1px", marginBottom: "1.25rem", whiteSpace: "pre-line" }}>
            {isLogin ? "Rencanakan\nPerjalananmu\nLagi." : "Bergabunglah\nBersama\nPelancong Dunia."}
          </h2>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          backgroundColor: "var(--bg-color)",
          position: "relative",
          overflowY: "auto"
        }}
      >
        <Link
          to="/"
          className="mobile-auth-back"
          style={{
            position: "absolute",
            top: "1.5rem",
            left: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            fontWeight: 600,
            textDecoration: "none"
          }}
        >
          <Plane size={16} /> Beranda
        </Link>

        <div style={{ width: "100%", maxWidth: "420px" }}>
          <Link
            to="/"
            className="mobile-only-logo"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
              marginBottom: "2.5rem",
              alignSelf: "flex-start"
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)"
              }}
            >
              <Plane size={20} color="white" />
            </div>
            <div className="brand-text-styled" style={{ fontSize: "1.4rem" }}>
              <span className="smart">Smart</span>
              <span className="travel">Travel</span>
            </div>
          </Link>

          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem", letterSpacing: "-0.5px" }}>
              {isLogin ? "Masuk ke Akun" : "Buat Akun Baru"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
              <button
                onClick={toggleAuthMode}
                style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: "0.95rem" }}
              >
                {isLogin ? "Daftar gratis" : "Masuk di sini"}
              </button>
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "0.9rem"
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {!isLogin && (
              <div>
                <label htmlFor="name" style={labelStyle}>
                  Nama Lengkap
                </label>
                <div style={{ position: "relative" }}>
                  <User size={17} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", pointerEvents: "none" }} />
                  <input
                    id="name"
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "2.65rem" }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" style={labelStyle}>
                Alamat Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={17} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", pointerEvents: "none" }} />
                <input
                  id="email"
                  type="email"
                  placeholder="contoh@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: "2.65rem" }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label htmlFor="password" style={{ ...labelStyle, margin: 0 }}>
                  Kata Sandi
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={17} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", pointerEvents: "none" }} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: "2.65rem", paddingRight: "2.75rem" }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-light)", padding: 0, display: "flex", alignItems: "center" }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: "100%", padding: "0.9rem", marginTop: "0.25rem", justifyContent: "center", fontSize: "1rem", fontWeight: 700 }}>
              {isSubmitting ? "Memproses..." : isLogin ? "Masuk Sekarang" : "Buat Akun"}
              <ArrowRight size={18} style={{ marginLeft: "0.5rem" }} />
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", margin: "1.75rem 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
            <span style={{ padding: "0 1rem", fontSize: "0.82rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>atau lanjutkan dengan</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center", padding: "0.75rem", gap: "0.5rem" }}>
              <Globe size={17} /> Google
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center", padding: "0.75rem", gap: "0.5rem" }}>
              <span style={{ fontWeight: 900, fontSize: "1.1rem", lineHeight: 1 }}>A</span> Apple
            </button>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (min-width: 992px) {
          .auth-visual { display: flex !important; }
          .mobile-auth-back { display: none !important; }
          .mobile-only-logo { display: none !important; }
        }
      `
        }}
      />
    </div>
  );
}
