import React, { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,
  FaUserCircle,
  FaKey,
  FaCog,
  FaEdit,
  FaBoxOpen,
  FaFileInvoiceDollar,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useCart } from "../hooks/useCart";
import "./Header.css";
import { buildApiUrl } from "../config/api";

function Header() {
  const localAvatar = localStorage.getItem('userAvatar');
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { cartItems } = useCart();

  const [user, setUser] = useState({
    name: "",
    email: "",
    avatarUrl: localAvatar || "",
  });

  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setUser(prev => ({ ...prev, avatarUrl: savedAvatar }));
    }
  }, []);

  // Get logged-in user from localStorage
  const isLoggedIn = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // Calculate total cart items count with useMemo to ensure updates
  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.qty, 0),
    [cartItems],
  );

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    let u;
    try {
      u = JSON.parse(stored);
    } catch {
      return;
    }

    if (!u?.id) return;

    setUser((prev) => ({
      ...prev,
      name: u.firstName || u.name || "",
      email: u.email || "",
    }));

    fetch(buildApiUrl(`/api/user-profile/${u.id}`))
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load profile");

        // Check localStorage first, then fallback to backend
        const localAvatar = localStorage.getItem('userAvatar');

        setUser((prev) => ({
          ...prev,
          name: data.name || prev.name || u.firstName || "User",
          email: data.email || u.email || prev.email || "",
          avatarUrl: localAvatar || data.avatar_url || prev.avatarUrl || "",
        }));
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // Listen for avatar changes
  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      if (event.detail?.avatarUrl) {
        setUser(prev => ({ ...prev, avatarUrl: event.detail.avatarUrl }));
      }
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, []);

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
    <nav className="uh-nav">
      <div className="uh-logo" onClick={() => navigate("/user-home")}>
        <span className="uh-logo-text">PMG</span>
        <span className="uh-logo-sub">PRINTING HOUSE</span>
      </div>

      <div className="uh-search">
        <input type="text" placeholder="Search products or services" />
        <button className="uh-search-btn" type="button" aria-label="Search">
          <FaSearch />
        </button>
      </div>

      <div className="uh-actions">
        <button
          className="uh-icon-btn uh-cart-btn"
          type="button"
          title="Cart"
          onClick={() => navigate("/user-cart")}
        >
          <FaShoppingCart />
          {cartCount > 0 && <span className="uh-cart-badge">{cartCount}</span>}
        </button>

        <button className="uh-link uh-desktop-only" type="button">
          About
        </button>
        <button className="uh-link uh-desktop-only" type="button">
          Contact
        </button>

        <button
          className="uh-icon-btn uh-mobile-only"
          type="button"
          aria-label="Menu"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="uh-profile-wrap" ref={dropdownRef}>
          {isLoggedIn ? (
            <>
              <button
                className="uh-profile"
                type="button"
                title="Account"
                onClick={() => {
                  setIsProfileOpen((v) => !v);
                  setIsMobileMenuOpen(false);
                }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Profile"
                    className="uh-profile-img"
                  />
                ) : (
                  <FaUserCircle />
                )}
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
                      <div className="uh-dd-name">{user.name || "User"}</div>
                      <div className="uh-dd-email">{user.email || ""}</div>
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
                        navigate("/user-customize-profile");
                      }}
                    >
                      <FaEdit /> <span>Customize your profile</span>
                    </button>

                    <button
                      className="uh-dd-item"
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/user-orders");
                      }}
                    >
                      <FaBoxOpen /> <span>Orders</span>
                    </button>

                    <button
                      className="uh-dd-item"
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/user-inquiries");
                      }}
                    >
                      <FaFileInvoiceDollar /> <span>My Inquiries</span>
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
            </>
          ) : (
            <button
              className="uh-login-btn"
              type="button"
              onClick={() => navigate("/user-login")}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
