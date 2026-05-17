import "./App.css";
import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import MobileFooterNav from "./components/MobileFooterNav";

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
import UserPayments from "./Customer/User-payments";
import UserInquiries from "./Customer/User-inquiries";
import UserPasswordSecurityPage from "./Customer/User-password-security";
import ProductDetail from "./Customer/Product-detail";
import { buildApiUrl } from "./config/api";
import PrintHubChatbot from "./components/PrintHubChatbot";

const RECENTLY_VIEWED_KEY = "printhub_recently_viewed_products";
const fallbackProductImage =
  "https://via.placeholder.com/300x200?text=No+Image";

function formatHomePrice(price) {
  if (price === null || price === undefined || price === "") return "";
  const numeric = Number(price);
  return Number.isFinite(numeric)
    ? `₱${numeric.toLocaleString()}`
    : String(price);
}

// ✅ PROTECTED ROUTE - Only admins and staff can access
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

  // Allow both admin AND staff
  if (!storedUser || (role !== "admin" && role !== "staff")) {
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

// Routes where the mobile footer nav should appear (authenticated customer area)
const CUSTOMER_ROUTES = [
  "/user-home",
  "/user-cart",
  "/user-orders",
  "/user-inquiries",
  "/user-dashboard",
  "/user-customize-profile",
  "/user-account-settings",
  "/user-password-security",
  "/product-overview",
  "/payment/return",
];

function AppInner() {
  const location = useLocation();
  const showFooterNav =
    CUSTOMER_ROUTES.includes(location.pathname) ||
    location.pathname.startsWith("/product/");

  return (
    <>
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
      {showFooterNav && <MobileFooterNav />}
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppInner />
        <ChatbotRouteGate />
      </BrowserRouter>
    </CartProvider>
  );
}

function ChatbotRouteGate() {
  const location = useLocation();
  const hiddenRoutes = [
    "/user-login",
    "/user-register",
    "/user-otp",
    "/user-forgot-otp",
  ];

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return <PrintHubChatbot />;
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

function HomeProductRail({ title, subtitle, products, emptyText, navigate }) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;
  const canMove = products.length > visibleCount;
  const visibleProducts = useMemo(() => {
    if (products.length <= visibleCount) return products;
    return Array.from({ length: visibleCount }, (_, offset) => {
      const index = (startIndex + offset) % products.length;
      return products[index];
    });
  }, [products, startIndex]);

  useEffect(() => {
    setStartIndex(0);
  }, [products.length]);

  const moveRail = (direction) => {
    if (!canMove) return;
    setStartIndex((current) =>
      direction === "next"
        ? (current + 1) % products.length
        : (current - 1 + products.length) % products.length,
    );
  };

  return (
    <div className="home-product-rail">
      <div className="home-rail-heading">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {canMove && (
          <div className="home-rail-controls" aria-label={`${title} controls`}>
            <button
              type="button"
              onClick={() => moveRail("prev")}
              aria-label="Previous products"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => moveRail("next")}
              aria-label="Next products"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <p className="home-rail-empty">{emptyText}</p>
      ) : (
        <div className="home-rail-window">
          {visibleProducts.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/product/${item.id}`)}
              className="product-card"
            >
              <div className="product-card-media">
                <img
                  src={item.images?.[0] || item.image || fallbackProductImage}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = fallbackProductImage;
                  }}
                />
              </div>
              <div className="product-card-title">{item.name}</div>
              {formatHomePrice(item.price) ? (
                <div className="product-card-price">
                  From {formatHomePrice(item.price)}
                </div>
              ) : null}
              <div className="product-card-action">View details</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BestSellerCarousel({ products, navigate }) {
  const bestSellers = useMemo(() => products.slice(0, 4), [products]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProduct = bestSellers[activeIndex] || null;

  useEffect(() => {
    setActiveIndex(0);
  }, [bestSellers.length]);

  if (!activeProduct) return null;

  const moveSlide = (direction) => {
    setActiveIndex((current) =>
      direction === "next"
        ? (current + 1) % bestSellers.length
        : (current - 1 + bestSellers.length) % bestSellers.length,
    );
  };

  return (
    <section className="content-section bestseller-section reveal-on-scroll">
      <div className="bestseller-copy">
        <span>Top 4 Best Sellers</span>
        <h2>Customer favorites ready for your next print run.</h2>
        <p>
          Browse PMG's most requested products, compare the quick notes, then
          jump straight to the product page when one fits your order.
        </p>
      </div>

      <div className="bestseller-carousel">
        <button
          type="button"
          className="bestseller-arrow"
          onClick={() => moveSlide("prev")}
          aria-label="Previous best seller"
        >
          ‹
        </button>

        <div className="bestseller-card">
          <div className="bestseller-image">
            <img
              src={activeProduct.images?.[0] || fallbackProductImage}
              alt={activeProduct.name}
              onError={(e) => {
                e.target.src = fallbackProductImage;
              }}
            />
          </div>
          <div className="bestseller-info">
            <div className="bestseller-rank">
              Best seller #{activeIndex + 1}
            </div>
            <h3>{activeProduct.name}</h3>
            <p>
              A reliable pick for fast custom printing, everyday branding, and
              polished customer-ready output.
            </p>
            <div className="bestseller-meta">
              <span>
                {activeProduct.stock
                  ? `${activeProduct.stock} in stock`
                  : "Made to order"}
              </span>
              {formatHomePrice(activeProduct.price) ? (
                <span>Starts at {formatHomePrice(activeProduct.price)}</span>
              ) : null}
            </div>
            <button
              type="button"
              className="bestseller-button"
              onClick={() => navigate(`/product/${activeProduct.id}`)}
            >
              View Product
            </button>
          </div>
        </div>

        <button
          type="button"
          className="bestseller-arrow"
          onClick={() => moveSlide("next")}
          aria-label="Next best seller"
        >
          ›
        </button>
      </div>

      <div className="bestseller-dots">
        {bestSellers.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={activeIndex === index ? "active" : ""}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show ${item.name}`}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------- HOME ---------- */
function HomePage() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const revealItems = document.querySelectorAll(".reveal-on-scroll");
    if (!revealItems.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [products, loadingProducts, productsError]);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const viewed = JSON.parse(
          localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]",
        );
        setRecentlyViewed(Array.isArray(viewed) ? viewed.slice(0, 8) : []);
      } catch {
        setRecentlyViewed([]);
      }
    };

    loadRecentlyViewed();
    window.addEventListener("focus", loadRecentlyViewed);
    window.addEventListener("storage", loadRecentlyViewed);

    return () => {
      window.removeEventListener("focus", loadRecentlyViewed);
      window.removeEventListener("storage", loadRecentlyViewed);
    };
  }, [location.pathname]);

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
      <header className="App-header">
        <div className="hero-copy">
          <span className="hero-kicker">PMG Printing House</span>
          <h1>Print-ready ideas, made local.</h1>
          <p>
            Custom shirts, signage, paper prints, IDs, mugs, machines, and
            supplies in one hands-on printing shop.
          </p>
          <button
            type="button"
            className="hero-cta"
            onClick={() => navigate("/product-overview")}
          >
            Explore Products
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* HOW TO ORDER (HTML/CSS) */}
        <section className="content-section howto-wrap reveal-on-scroll">
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
                  {/* Desktop: STEP label + arrow */}
                  <div className="howto-step-top">
                    <span className="howto-step-label">{s.step}</span>
                    {idx !== 5 && <span className="howto-arrow">▶</span>}
                  </div>
                  {/* Mobile: numbered circle + vertical connector */}
                  <div className="howto-step-indicator">
                    <div className="howto-step-circle">{idx + 1}</div>
                    {idx !== 5 && <div className="howto-step-connector" />}
                  </div>
                  <div className="howto-step-body">
                    <div className="howto-step-title">{s.title}</div>
                    <div className="howto-step-text">{s.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <BestSellerCarousel products={products} navigate={navigate} />

        {/* ✅ PRODUCT CATALOG */}
        <section className="content-section reveal-on-scroll">
          <h2>Product Catalog</h2>
          <p>Discover our bestselling print essentials for your business.</p>

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
            <HomeProductRail
              title="Explore all categories"
              subtitle="Tap the arrows to browse without a long page scroll."
              products={products}
              emptyText="No products available yet."
              navigate={navigate}
            />
          )}
        </section>

        {recentlyViewed.length > 0 && (
          <section className="content-section reveal-on-scroll">
            <HomeProductRail
              title="Your Recently Viewed Items"
              subtitle="Pick up where you left off."
              products={recentlyViewed}
              emptyText="Viewed products will appear here."
              navigate={navigate}
            />
          </section>
        )}

        {/* ✅ ABOUT */}
        <section className="content-section reveal-on-scroll" id="about">
          <h2>About PMG Printing House</h2>
          <p>
            <strong>Your trusted one-stop printing shop</strong>
          </p>
          <p>
            PMG Printing House was built for one reason: to make printing easy,
            complete, and reliable. Whether you need a single calling card or
            500 fully sublimated jerseys, we have the equipment, expertise, and
            supplies to get it done.
          </p>
          <p>
            We don't just print. We also provide printing machines and
            consumables as a straight authorized dealer, so even fellow printing
            businesses trust us.
          </p>

          <h3>What We Print And More</h3>
          <ul className="home-info-list">
            <li>T-shirt printing (DTF, sublimation, screen print)</li>
            <li>Cut & sew (full custom apparel)</li>
            <li>Digital printing: flyers, trifolds, invitations, stickers</li>
            <li>Large format: tarpaulin, sintra board, plaque</li>
            <li>
              Office & event essentials: calling cards, PVC ID & lanyards, mug
              printing, cap printing
            </li>
            <li>Embroidery & signage installation</li>
          </ul>

          <h3>Why Customers Come Back</h3>
          <ul className="home-info-list">
            <li>
              <strong>One-stop convenience</strong> - No need to go to five
              different shops.
            </li>
            <li>
              <strong>Machines + supplies</strong> - We help you print and run
              your own printing business.
            </li>
            <li>
              <strong>Fast, local, and hands-on</strong> - Real people who
              answer calls and messages.
            </li>
          </ul>
        </section>

        {/* ✅ CONTACT */}
        <section
          className="content-section contact-section reveal-on-scroll"
          id="contact"
        >
          <h2>Contact</h2>
          <div className="contact-links">
            <a href="tel:09389343337090">0938-934-3337090</a>
            <a href="tel:09081858988091">0908-185-8988091</a>
            <a href="tel:09122043818">0912-204-3818</a>
            <a href="mailto:pmg.prints@gmail.com">pmg.prints@gmail.com</a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
