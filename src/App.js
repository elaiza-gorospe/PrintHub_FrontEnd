import "./App.css";
import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import AdminLoginPage from "./Admin/Admin-login";
import AdminRegistrationPage from "./Admin/Admin-registration";
import AdminDashboard from "./Admin/Admin-dashboard";
import AdminProfile from "./Admin/Admin-profile";
import AdminManageAccounts from "./Admin/Admin-manageacc";

import UserLoginPage from "./Customer/User-login";
import UserRegistrationPage from "./Customer/User-regis";
import UserHomePage from "./Customer/User-home";
import UserOtpPage from "./Customer/User-otp";
import CustomerDashboard from "./Customer/User-dashboard";
import UserForgotOtpPage from "./Customer/User-forgot-otp";
import UserResetPasswordPage from "./Customer/User-reset-password";
import ProductOverview from "./Customer/Product-overview";
import UserCustomizeProfile from "./Customer/User-customize-profile";
import UserAccountSettings from "./Customer/User-account-settings";
import UserCartPage from "./Customer/User-cart";
import UserPasswordSecurityPage from "./Customer/User-password-security";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin-register" element={<AdminRegistrationPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/admin-manageaccount" element={<AdminManageAccounts />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/user-register" element={<UserRegistrationPage />} />
        <Route path="/user-forgot-otp" element={<UserForgotOtpPage />} />
        <Route path="/user-reset-password" element={<UserResetPasswordPage />} />
        <Route path="/user-otp" element={<UserOtpPage />} />
        <Route path="/user-home" element={<UserHomePage />} />
        <Route path="/user-password-security" element={<UserPasswordSecurityPage />} />
        <Route path="/user-cart" element={<UserCartPage />} />
        <Route path="/user-dashboard" element={<CustomerDashboard />} />
        <Route path="/product-overview" element={<ProductOverview />} />
        <Route path="/user-customize-profile" element={<UserCustomizeProfile />} />
        <Route path="/user-account-settings" element={<UserAccountSettings />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ---------- NAVBAR ---------- */
function NavbarComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavToSection = (id) => {
    if (location.pathname === "/") {
      scrollToSection(id);
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          PMG
        </div>

        <ul className="navbar-menu">
          <li>
            <button className="navlink-btn" onClick={() => navigate("/")}>
              Home
            </button>
          </li>

          <li>
            <button
              className="navlink-btn"
              onClick={() => handleNavToSection("about")}
            >
              About
            </button>
          </li>

          <li>
            <button
              className="navlink-btn"
              onClick={() => handleNavToSection("contact")}
            >
              Contact
            </button>
          </li>

          <li>
            <button
              className="navbar-login"
              onClick={() => navigate("/user-login")}
            >
              Login
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

/* ---------- HOME ---------- */
function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="App">
      <NavbarComponent />

      {/* HERO */}
      <header className="App-header"></header>

      <main className="main-content">

        {/* HOW TO ORDER (HTML/CSS) */}
<section className="content-section howto-wrap">
  <h2 className="howto-title">
    Print Your Own Design With <span>PMG</span>!
  </h2>

  <div className="howto-box">
    <div className="howto-steps">
      {[
        {
          step: "STEP 1",
          title: "Choose your product",
          text: "Pick an item and select size/quantity.",
        },
        {
          step: "STEP 2",
          title: "Upload or create design",
          text: "Upload your file or create your design.",
        },
        {
          step: "STEP 3",
          title: "Check guidelines",
          text: "We verify quality and printable format.",
        },
        {
          step: "STEP 4",
          title: "Printing starts",
          text: "Your order is queued and printed.",
        },
        {
          step: "STEP 5",
          title: "Pay securely",
          text: "Pay via your selected payment method.",
        },
        {
          step: "STEP 6",
          title: "Claim / delivery",
          text: "Pick up your item or choose delivery.",
        },
      ].map((s, idx) => (
        <div className="howto-step" key={idx}>
          <div className="howto-step-top">
            <span className="howto-step-label">{s.step}</span>
            {idx !== 5 && <span className="howto-arrow">▶</span>}
          </div>
          <div className="howto-step-title">{s.title}</div>
          <div className="howto-step-text">{s.text}</div>
        </div>
      ))}
    </div>
  </div>
</section>


        {/* ✅ PRODUCT CATALOG */}
        <section className="content-section">
          <h2>Product Catalog</h2>
          <p>Discover our bestselling print essentials for your business.</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "24px",
              marginTop: "30px",
            }}
          >
            {products.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  padding: "30px 20px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                }}
              >
                <h3 style={{ color: "#0f352a", marginBottom: "10px" }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: "14px", marginBottom: "20px" }}>
                  {item.desc}
                </p>

                <span
                  style={{
                    color: "#a37e2d",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  {item.cta}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ ABOUT */}
        <section className="content-section" id="about">
          <h2>About PMG</h2>
          <p>
            PMG is your one stop printhing shop.
          </p>
        </section>

        {/* ✅ CONTACT */}
        <section className="content-section" id="contact">
          <h2>Contact</h2>
          <p>Email: printhub@gmail.com</p>
          <p>Phone: +63 900 000 0000</p>
          <p>Address: Your City, Philippines</p>
        </section>
      </main>
    </div>
  );
}

export default App;
