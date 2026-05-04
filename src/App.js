import "./App.css";
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";

import AdminLoginPage from "./Admin/Admin-login";
import AdminRegistrationPage from "./Admin/Admin-registration";
import AdminDashboard from "./Admin/Admin-dashboard";
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
import UserOrders from "./Customer/User-orders";
import UserPaymentReturn from "./Customer/User-payment-return";
import UserInquiries from "./Customer/User-inquiries";
import UserPasswordSecurityPage from "./Customer/User-password-security";
import ProductDetail from "./Customer/Product-detail";
import { buildApiUrl } from "./config/api";

// ✅ PROTECTED ROUTE - Only admins can access
function ProtectedAdminRoute({ children }) {
  const storedUser = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("adminUser")) ||
        JSON.parse(localStorage.getItem("user")) ||
        null
      );
    } catch {
      return null;
    }
  })();

  const role = storedUser?.role || "user";

  if (!storedUser || role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ✅ PREVENT LOGGED-IN ADMINS FROM ACCESSING LOGIN/REGISTER
function AdminLoginRegisterGuard({ children }) {
  const storedUser = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("adminUser")) ||
        JSON.parse(localStorage.getItem("user")) ||
        null
      );
    } catch {
      return null;
    }
  })();

  const role = storedUser?.role || "user";

  // If admin is already logged in, redirect to dashboard
  if (storedUser && role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/admin-login"
            element={
              <AdminLoginRegisterGuard>
                <AdminLoginPage />
              </AdminLoginRegisterGuard>
            }
          />
          <Route
            path="/admin-register"
            element={
              <AdminLoginRegisterGuard>
                <AdminRegistrationPage />
              </AdminLoginRegisterGuard>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin-manageaccount"
            element={
              <ProtectedAdminRoute>
                <AdminManageAccounts />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/user-login" element={<UserLoginPage />} />
          <Route path="/user-register" element={<UserRegistrationPage />} />
          <Route path="/user-forgot-otp" element={<UserForgotOtpPage />} />
          <Route
            path="/user-reset-password"
            element={<UserResetPasswordPage />}
          />
          <Route path="/user-otp" element={<UserOtpPage />} />
          <Route path="/user-home" element={<UserHomePage />} />
          <Route
            path="/user-password-security"
            element={<UserPasswordSecurityPage />}
          />
          <Route path="/user-cart" element={<UserCartPage />} />
          <Route path="/user-orders" element={<UserOrders />} />
          <Route path="/payment/return" element={<UserPaymentReturn />} />
          <Route path="/user-inquiries" element={<UserInquiries />} />
          <Route path="/user-dashboard" element={<CustomerDashboard />} />
          <Route path="/product-overview" element={<ProductOverview />} />
          <Route
            path="/user-customize-profile"
            element={<UserCustomizeProfile />}
          />
          <Route
            path="/user-account-settings"
            element={<UserAccountSettings />}
          />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
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
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  // Fetch home product list (minimal cards)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await fetch(buildApiUrl("/api/products?limit=8"));
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        const list = (data.products || data).map((p) => ({
          id: p.id,
          name: p.name || p.title || "Untitled",
          images: p.images || [],
          price: p.price,
          stock: p.stock,
        }));
        setProducts(list);
        setProductsError(null);
      } catch (err) {
        setProductsError(err.message || "Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

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
            {loadingProducts ? (
              <p style={{ padding: "20px", textAlign: "center" }}>
                Loading products...
              </p>
            ) : productsError ? (
              <p
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#e74c3c",
                }}
              >
                {productsError}
              </p>
            ) : (
              products.map((item) => {
                const fallbackImage =
                  "https://via.placeholder.com/300x200?text=No+Image";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/product/${item.id}`)}
                    style={{
                      background: "#fff",
                      padding: "20px",
                      borderRadius: "10px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                      textAlign: "left",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        height: 160,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f8fafc",
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                    >
                      <img
                        src={item.images?.[0] || fallbackImage}
                        alt={item.name}
                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                        onError={(e) => {
                          e.target.src = fallbackImage;
                        }}
                      />
                    </div>
                    <div style={{ color: "#0f352a", fontWeight: 600 }}>
                      {item.name}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* ✅ ABOUT */}
        <section className="content-section" id="about">
          <h2>About PMG</h2>
          <p>PMG is your one stop printhing shop.</p>
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
