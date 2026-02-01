import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-home.css";


function UserHomePage() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
    //image: require("../assets/images/business-card.jpg"),
  },
  {
    id: 2,
    title: "Stickers & Labels",
    desc: "Accentuate your products with unique labels and stickers.",
    cta: "SHOP STICKERS & LABELS >>",
    //image: require("../assets/images/stick.png"),
  },
  {
    id: 3,
    title: "Product Hang Tags",
    desc: "Add more information about your products with hang tags.",
    cta: "SHOP HANG TAGS >>",
    //image: require("../assets/images/tag.png"),
  },
  {
    id: 4,
    title: "Note Cards",
    desc: "Thank-you cards are always welcome. Gain trust with customers.",
    cta: "SHOP THANK YOU CARDS >>",
    //image: require("../assets/images/note.jpg"),
  },
];


  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsProfileOpen(false);
    navigate("/user-login");
  };

  return (
    <div className="uh-page">
      {/* NAVBAR (same theme) */}
      <nav className="uh-nav">
        <div className="uh-logo" onClick={() => navigate("/user-home")}>
          <span className="uh-logo-text">PMG</span>
          <span className="uh-logo-sub">PRINTING HOUSE</span>
        </div>

        <div className="uh-search">
          <input type="text" placeholder="Search products or services" />
          <button className="uh-search-btn" type="button" aria-label="Search">
            🔍
          </button>
        </div>

        <div className="uh-actions">
          <button
            className="uh-icon-btn"
            type="button"
            title="Cart"
            onClick={() => navigate("/user-dashboard")}
          >
            🛒
          </button>

          <button className="uh-link" type="button">
            About
          </button>
          <button className="uh-link" type="button">
            Contact
          </button>

          {/* Profile dropdown */}
          <div className="uh-profile-wrap" ref={dropdownRef}>
            <button
              className="uh-profile"
              type="button"
              title="Account"
              onClick={() => setIsProfileOpen((v) => !v)}
            >
              👤
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
                      navigate("/user-reset-password");
                    }}
                  >
                    🔑 <span>Passwords and security</span>
                  </button>

                  <button
                    className="uh-dd-item"
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/user-dashboard");
                    }}
                  >
                    ⚙️ <span>Account settings</span>
                  </button>

                  <button
                    className="uh-dd-item"
                    type="button"
                    onClick={() => alert("Customize profile (add modal later)")}
                  >
                    ✏️ <span>Customize your profile</span>
                  </button>

                  <button
                    className="uh-dd-item"
                    type="button"
                    onClick={() => alert("Sync toggled (demo)")}
                  >
                    🔄 <span>Sync is on</span>
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
                  onClick={() => navigate("/Product-overview")}
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
