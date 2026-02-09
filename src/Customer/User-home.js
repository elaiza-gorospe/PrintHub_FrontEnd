import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-home.css";

// ✅ ICONS
import {
  FaSearch,
  FaShoppingCart,
  FaUserCircle,
  FaKey,
  FaCog,
  FaEdit,
  FaBoxOpen,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function UserHomePage() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // demo user (replace later with localStorage/user data)
  const user = {
    name: "Kathleen",
    email: "kathbuhay@gmail.com",
    avatarUrl: "",
  };

  const products = [
    {
      id: 1,
      title: "Business Cards",
      desc: "Make first impressions last with premium business cards.",
      cta: "SHOP BUSINESS CARDS >>",
    },
    {
      id: 2,
      title: "Stickers & Labels",
      desc: "Accentuate your products with unique labels and stickers.",
      cta: "SHOP STICKERS & LABELS >>",
    },
    {
      id: 3,
      title: "Product Hang Tags",
      desc: "Add more information about your products with hang tags.",
      cta: "SHOP HANG TAGS >>",
    },
    {
      id: 4,
      title: "Note Cards",
      desc: "Thank-you cards are always welcome. Gain trust with customers.",
      cta: "SHOP THANK YOU CARDS >>",
    },
  ];

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <div className="uh-page">
      {/* NAVBAR */}
      <nav className="uh-nav">
        <div className="uh-logo" onClick={() => navigate("/user-home")}>
          <span className="uh-logo-text">PMG</span>
          <span className="uh-logo-sub">PRINTING HOUSE</span>
        </div>

        {/* SEARCH */}
        <div className="uh-search">
          <input type="text" placeholder="Search products or services" />
          <button className="uh-search-btn" type="button" aria-label="Search">
            <FaSearch />
          </button>
        </div>

        <div className="uh-actions">
          {/* CART */}
          <button
            className="uh-icon-btn"
            type="button"
            title="Cart"
            onClick={() => navigate("/user-cart")}
          >
            <FaShoppingCart />
          </button>

          {/* Desktop links */}
          <button className="uh-link uh-desktop-only" type="button">
            About
          </button>
          <button className="uh-link uh-desktop-only" type="button">
            Contact
          </button>

          {/* Mobile menu toggle */}
          <button
            className="uh-icon-btn uh-mobile-only"
            type="button"
            aria-label="Menu"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* PROFILE DROPDOWN */}
          <div className="uh-profile-wrap" ref={dropdownRef}>
            <button
              className="uh-profile"
              type="button"
              title="Account"
              onClick={() => {
                setIsProfileOpen((v) => !v);
                setIsMobileMenuOpen(false);
              }}
            >
              <FaUserCircle />
            </button>

            {isProfileOpen && (
              <div className="uh-dropdown">
                <div className="uh-dd-top">
                  <div className="uh-dd-avatar">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Profile" />
                    ) : (
                      <span>{user.name?.[0]?.toUpperCase() || "U"}</span>
                    )}
                  </div>

                  <div className="uh-dd-info">
                    <div className="uh-dd-name">{user.name}</div>
                    <div className="uh-dd-email">{user.email}</div>
                  </div>
                </div>

                <div className="uh-dd-menu">
                  <button
                    className="uh-dd-item"
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/user-password-security");
                    }}
                  >
                    <FaKey /> <span>Passwords and security</span>
                  </button>

                  <button
                    className="uh-dd-item"
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/user-account-settings");
                    }}
                  >
                    <FaCog /> <span>Account settings</span>
                  </button>

                  <button
                    className="uh-dd-item"
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/user-customize-profile");
                    }}
                  >
                    <FaEdit /> <span>Customize your profile</span>
                  </button>

                  <button
                    className="uh-dd-item"
                    type="button"
                    onClick={() => alert("Orders (demo)")}
                  >
                    <FaBoxOpen /> <span>Orders</span>
                  </button>
                </div>

                <div className="uh-dd-divider" />

                <div className="uh-dd-bottom">
                  <button
                    className="uh-dd-logout"
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Mobile menu dropdown (About/Contact) */}
            {isMobileMenuOpen && (
              <div className="uh-mobile-menu">
                <button className="uh-mobile-item" type="button">
                  About
                </button>
                <button className="uh-mobile-item" type="button">
                  Contact
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="uh-hero">
        <div className="uh-hero-overlay" />
        <div className="uh-hero-content">
          <h1>Elevate Your Brand with Print and Packaging Essentials.</h1>
          <p>
            Make your business stand out with stunning print and packaging
            products. Print for your brand in the Philippines.
          </p>

          <button
            className="uh-hero-btn"
            type="button"
            onClick={() => navigate("/Product-overview")}
          >
            SHOP NOW &gt;&gt;
          </button>
        </div>
      </section>

      {/* POPULAR PRODUCTS */}
      <section className="uh-section">
        <div className="uh-section-title">
          <h2>Popular Print Products</h2>
          <p>Discover our bestselling print essentials for your business.</p>
        </div>

        <div className="uh-cards">
          {products.map((p) => (
            <div key={p.id} className="uh-card">
              <div className="uh-card-img" />
              <div className="uh-card-body">
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <button
                  type="button"
                  className="uh-card-link"
                  onClick={() => navigate("/user-cart")}
                >
                  {p.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default UserHomePage;
