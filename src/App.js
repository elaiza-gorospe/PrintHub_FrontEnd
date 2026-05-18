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
import PrintHubChatbot from './components/PrintHubChatbot';
import pmgWebsiteLogo from "./assets/brand/pmg-mark.png";
import pmgNavLogo from "./assets/brand/pmg-printing-house.png";

const RECENTLY_VIEWED_KEY = "printhub_recently_viewed_products";
const fallbackProductImage = "https://via.placeholder.com/300x200?text=No+Image";
const homeHeroWords = ["Vision", "Packaging", "Merch", "Marketing"];

function AnimatedWords({ text, highlight = "" }) {
  return (
    <>
      {text.split(" ").map((word, index) => {
        const cleanWord = word.replace(/[!.,]/g, "");
        const isHighlight = cleanWord.toLowerCase() === highlight.toLowerCase();
        return (
          <span
            className={`kinetic-word ${isHighlight ? "kinetic-highlight" : ""}`}
            key={`${word}-${index}`}
            style={{ "--word-delay": `${index * 0.075}s` }}
          >
            {word}
          </span>
        );
      })}
    </>
  );
}

function formatHomePrice(price) {
  if (price === null || price === undefined || price === "") return "";
  const numeric = Number(price);
  return Number.isFinite(numeric) ? `₱${numeric.toLocaleString()}` : String(price);
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

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return sessionStorage.getItem("pmg_splash_seen") !== "true";
    } catch {
      return true;
    }
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem("pmg_splash_seen", "true");
    } catch {
      // Splash state is cosmetic only.
    }
  };

  return (
    <CartProvider>
      <BrowserRouter>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
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
          <Route path="/user-payments" element={<UserPayments />} />
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
          <span className="navbar-logo-mark brand-image">
            <img src={pmgNavLogo} alt="PMG Printing House" />
          </span>
        </div>

        <ul className="navbar-menu">
          <li>
            <button className="navlink-btn" onClick={() => navigate("/")}>
              <span aria-hidden="true">⌂</span> Home
            </button>
          </li>

          <li>
            <button
              className="navlink-btn"
              onClick={() => navigate("/product-overview")}
            >
              <span aria-hidden="true">▧</span> Products
            </button>
          </li>

          <li>
            <button
              className="navlink-btn"
              onClick={() => navigate("/user-orders")}
            >
              <span aria-hidden="true">🛒</span> Orders
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
            <button type="button" onClick={() => moveRail("prev")} aria-label="Previous products">
              ‹
            </button>
            <button type="button" onClick={() => moveRail("next")} aria-label="Next products">
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
                <div className="product-card-price">From {formatHomePrice(item.price)}</div>
              ) : null}
              <div className="product-card-action">View details</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SplashScreen({ onComplete }) {
  const colors = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];
  const splatters = [
    { x: -44, y: 48, size: 16 },
    { x: -26, y: 74, size: 24 },
    { x: 8, y: 62, size: 14 },
    { x: 34, y: 88, size: 20 },
    { x: 52, y: 54, size: 12 },
    { x: -58, y: 92, size: 11 },
    { x: 20, y: 116, size: 15 },
    { x: 66, y: 102, size: 18 },
  ];
  const floatingDrops = [
    { left: 8, top: 18, size: 14, color: colors[0] },
    { left: 18, top: 78, size: 22, color: colors[1] },
    { left: 31, top: 12, size: 16, color: colors[2] },
    { left: 43, top: 84, size: 12, color: colors[3] },
    { left: 56, top: 22, size: 26, color: colors[4] },
    { left: 68, top: 72, size: 18, color: colors[0] },
    { left: 79, top: 16, size: 12, color: colors[1] },
    { left: 88, top: 64, size: 24, color: colors[2] },
    { left: 14, top: 42, size: 10, color: colors[3] },
    { left: 36, top: 58, size: 18, color: colors[4] },
    { left: 72, top: 38, size: 14, color: colors[0] },
    { left: 94, top: 28, size: 20, color: colors[3] },
  ];

  return (
    <div className="pmg-paint-splash" role="status" aria-label="Loading PMG Printing">
      <div className="pmg-paint-drips" aria-hidden="true">
        {colors.map((color, index) => (
          <div
            key={color}
            className="pmg-paint-drip"
            style={{
              "--paint-color": color,
              "--paint-left": `${15 + index * 18}%`,
              "--paint-delay": `${index * 0.15}s`,
            }}
          >
            <span className="pmg-paint-drop" />
            {splatters.map((splatter, splatterIndex) => (
              <span
                key={splatterIndex}
                className="pmg-paint-splatter"
                style={{
                  "--splatter-x": `${splatter.x}px`,
                  "--splatter-y": `${splatter.y}px`,
                  "--splatter-size": `${splatter.size}px`,
                  "--splatter-delay": `${index * 0.15 + 1.2}s`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {floatingDrops.map((drop, index) => (
        <span
          key={index}
          className="pmg-floating-drop"
          aria-hidden="true"
          style={{
            "--drop-color": drop.color,
            "--drop-left": `${drop.left}%`,
            "--drop-top": `${drop.top}%`,
            "--drop-size": `${drop.size}px`,
            "--drop-delay": `${1 + index * 0.06}s`,
          }}
        />
      ))}

      <div className="pmg-splash-center">
        <div className="pmg-splash-icon" aria-hidden="true">
          <img src={pmgWebsiteLogo} alt="" />
        </div>
        <h1>PMG PRINTING</h1>
        <p>YOUR ONE STOP PRINTING SHOP</p>
        <div className="pmg-splash-loading" aria-hidden="true">
          <span onAnimationEnd={onComplete} />
        </div>
      </div>
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
    <section className="content-section bestseller-section reveal-on-scroll bestseller-cinematic">
      <div className="bestseller-bg-type" aria-hidden="true">
        <span>BEST</span>
        <span>SELLERS</span>
      </div>
      <div className="bestseller-lighting" aria-hidden="true" />
      <div className="bestseller-floaters" aria-hidden="true">
        <span className="seller-tag">Fast pickup</span>
        <span className="seller-tag">Premium finish</span>
        <span className="seller-swatch" />
        <span className="seller-swatch" />
      </div>
      <div className="bestseller-copy">
        <span>Top 4 Best Sellers</span>
        <h2>
          {["Customer", "favorites", "ready for your", "next print run."].map((line, index) => (
            <b key={line} style={{ "--line-delay": `${index * 0.09}s` }}>{line}</b>
          ))}
        </h2>
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

        <div className="bestseller-card" key={activeProduct.id}>
          <div className="bestseller-image">
            <span className="product-aura" aria-hidden="true" />
            <span className="product-reflection" aria-hidden="true" />
            <img
              src={activeProduct.images?.[0] || fallbackProductImage}
              alt={activeProduct.name}
              onError={(e) => {
                e.target.src = fallbackProductImage;
              }}
            />
          </div>
          <div className="bestseller-info">
            <div className="bestseller-rank">Best seller #{activeIndex + 1}</div>
            <h3>{activeProduct.name}</h3>
            <p>
              A reliable pick for fast custom printing, everyday branding, and
              polished customer-ready output.
            </p>
            <div className="bestseller-meta">
              <span>{activeProduct.stock ? `${activeProduct.stock} in stock` : "Made to order"}</span>
              {formatHomePrice(activeProduct.price) ? <span>Starts at {formatHomePrice(activeProduct.price)}</span> : null}
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
          >
            <img
              src={item.images?.[0] || fallbackProductImage}
              alt=""
              onError={(e) => {
                e.target.src = fallbackProductImage;
              }}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

function ServicesSection() {
  const services = [
    {
      icon: "P",
      title: "Custom Apparel",
      text: "T-shirts, hoodies, and jerseys with your unique designs",
      tone: "cyan",
    },
    {
      icon: "C",
      title: "Marketing Materials",
      text: "Business cards, flyers, and promotional items",
      tone: "violet",
    },
    {
      icon: "B",
      title: "Packaging Design",
      text: "Custom boxes, labels, and branded packaging",
      tone: "orange",
    },
    {
      icon: "*",
      title: "Large Format",
      text: "Posters, banners, and exhibition displays",
      tone: "green",
    },
  ];

  return (
    <section className="home-services reveal-on-scroll cinematic-scene" data-scene-word="PRINT">
      <div className="scene-floaters" aria-hidden="true">
        <span className="mockup-shirt" />
        <span className="mockup-card" />
        <span className="mockup-sticker" />
      </div>
      <div className="home-section-intro">
        <h2><AnimatedWords text="Our Services" /></h2>
        <p>Everything you need to make your brand stand out</p>
      </div>

      <div className="home-service-grid">
        {services.map((service, index) => (
          <article
            className={`home-service-card service-${service.tone}`}
            key={service.title}
            style={{ "--card-delay": `${index * 0.1}s` }}
          >
            <span className="card-light" aria-hidden="true" />
            <span className="service-spill" aria-hidden="true" />
            <div className="home-service-icon" aria-hidden="true">
              {service.icon}
            </div>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PopularProductsSection({ navigate }) {
  const popular = [
    { label: "Business Cards", icon: "BC" },
    { label: "T-Shirts", icon: "TS" },
    { label: "Posters", icon: "PT" },
    { label: "Notebooks", icon: "NB" },
    { label: "Stickers", icon: "ST" },
    { label: "Banners", icon: "BN" },
  ];

  return (
    <section className="home-popular reveal-on-scroll cinematic-scene" data-scene-word="CUSTOMIZE">
      <div className="scene-floaters" aria-hidden="true">
        <span className="mockup-sheet" />
        <span className="mockup-card" />
        <span className="mockup-dieline" />
        <span className="mockup-jersey-outline" />
        <span className="mockup-brochure" />
      </div>
      <div className="home-section-intro dark">
        <h2><AnimatedWords text="Popular Products" /></h2>
        <p>Explore our most loved printing options</p>
      </div>

      <div className="home-popular-grid">
        {popular.map((item, index) => (
          <button
            type="button"
            key={item.label}
            className="home-popular-card"
            onClick={() => navigate("/product-overview")}
            style={{ "--card-delay": `${index * 0.06}s` }}
          >
            <span className="card-light" aria-hidden="true" />
            <span className="popular-print-line" aria-hidden="true" />
            <span className="popular-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "Z",
      title: "Fast Turnaround",
      text: "Express delivery in 24-48 hours",
    },
    {
      icon: "S",
      title: "Quality Guaranteed",
      text: "100% satisfaction or your money back",
    },
    {
      icon: "24",
      title: "24/7 Support",
      text: "We're here whenever you need us",
    },
  ];

  return (
    <section className="home-features reveal-on-scroll cinematic-scene" data-scene-word="CREATE">
      <div className="scene-floaters" aria-hidden="true">
        <span className="mockup-card" />
        <span className="mockup-sticker" />
      </div>
      <div className="home-feature-grid">
        {features.map((feature, index) => (
          <article
            className="home-feature-card"
            key={feature.title}
            style={{ "--card-delay": `${index * 0.12}s` }}
          >
            <span className="card-light" aria-hidden="true" />
            <div className="home-feature-icon" aria-hidden="true">
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeroWord, setActiveHeroWord] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress(totalScroll > 0 ? currentScroll / totalScroll : 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePointerMove = (event) => {
    setPointer({
      x: (event.clientX / window.innerWidth - 0.5) * 2,
      y: (event.clientY / window.innerHeight - 0.5) * 2,
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroWord((current) => (current + 1) % homeHeroWords.length);
    }, 2700);
    return () => clearInterval(timer);
  }, []);

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
  }, [products]);

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
      } catch (err) {
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div
      className="App"
      onMouseMove={handlePointerMove}
      style={{ "--mouse-x": pointer.x, "--mouse-y": pointer.y }}
    >
      <div
        className="home-scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />
      <NavbarComponent />

      {/* HERO */}
      <header className="App-header">
        <div className="hero-ink-drops" aria-hidden="true">
          {[
            ["#06b6d4", 8, -8, 46, 0],
            ["#3b82f6", 18, -14, 52, 1.2],
            ["#8b5cf6", 34, -6, 38, 2.1],
            ["#ec4899", 52, -18, 58, 0.5],
            ["#f59e0b", 74, -10, 42, 1.8],
            ["#06b6d4", 86, -12, 64, 2.7],
            ["#8b5cf6", 12, 48, 44, 3],
            ["#3b82f6", 68, 38, 62, 1],
            ["#ec4899", 80, 58, 50, 2.4],
            ["#f59e0b", 26, 26, 36, 1.6],
          ].map(([color, left, top, size, delay], index) => (
            <span
              key={index}
              style={{
                "--ink-color": color,
                "--ink-left": `${left}%`,
                "--ink-top": `${top}%`,
                "--ink-size": `${size}px`,
                "--ink-delay": `${delay}s`,
              }}
            />
          ))}
        </div>

        <div className="hero-paper" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((line) => (
            <span key={line} style={{ "--paper-delay": `${line * 0.2}s` }} />
          ))}
        </div>

        <div className="hero-palette" aria-hidden="true">
          {["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"].map(
            (color, index) => (
              <span
                key={color}
                style={{ backgroundColor: color, "--palette-delay": `${index * 0.2}s` }}
              />
            ),
          )}
        </div>

        <div className="hero-copy">
          <h1>
            Print Your{" "}
            <span key={homeHeroWords[activeHeroWord]} className="home-hero-word">
              {homeHeroWords[activeHeroWord]}
            </span>
          </h1>
          <p>
            Premium printing services that bring every idea to life with
            animated depth, sharp color, and production-ready precision.
          </p>
          <button
            type="button"
            className="hero-cta"
            onClick={() => navigate("/product-overview")}
          >
            Start Creating <span aria-hidden="true">→</span>
          </button>
        </div>
      </header>

      <ServicesSection />

      <main className="main-content">
        {/* HOW TO ORDER (HTML/CSS) */}
        <section className="howto-wrap reveal-on-scroll">
          <div className="howto-journey-line" aria-hidden="true" />
          <div className="scene-floaters" aria-hidden="true">
            <span className="mockup-card" />
            <span className="mockup-sheet" />
          </div>
          <div className="home-section-intro howto-intro">
            <h2>
              <AnimatedWords text="Print Your Own Design With PMG!" highlight="PMG" />
            </h2>
            <p>A quick path from idea to finished print.</p>
          </div>

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
                <div className="howto-step" key={idx} style={{ "--card-delay": `${idx * 0.06}s` }}>
                  <span className="card-light" aria-hidden="true" />
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

        <BestSellerCarousel products={products} navigate={navigate} />

        <PopularProductsSection navigate={navigate} />

        <FeaturesSection />

        {/* ✅ ABOUT */}
        <section className="about-showcase reveal-on-scroll cinematic-scene" id="about" data-scene-word="DESIGN">
          <div className="scene-floaters" aria-hidden="true">
            <span className="mockup-shirt" />
            <span className="mockup-sheet" />
          </div>
          <div className="home-section-intro about-intro">
            <h2><AnimatedWords text="About PMG Printing House" highlight="PMG" /></h2>
            <p>Your trusted one-stop printing shop</p>
          </div>

          <div className="about-story-grid">
            <article className="about-story-card about-main-card">
              <span className="card-light" aria-hidden="true" />
              <span className="about-card-kicker">PMG</span>
              <h3>Printing made easy, complete, and reliable.</h3>
              <p>
                Whether you need a single calling card or 500 fully sublimated
                jerseys, we have the equipment, expertise, and supplies to get
                it done.
              </p>
              <p>
                We also provide printing machines and consumables as a straight
                authorized dealer, so even fellow printing businesses trust us.
              </p>
            </article>

            <article className="about-story-card">
              <span className="card-light" aria-hidden="true" />
              <span className="about-card-kicker">Prints</span>
              <h3>What We Print And More</h3>
              <ul className="home-info-list">
                <li>T-shirt printing: DTF, sublimation, screen print</li>
                <li>Cut & sew full custom apparel</li>
                <li>Flyers, trifolds, invitations, stickers</li>
                <li>Tarpaulin, sintra board, plaque</li>
                <li>Calling cards, PVC ID, lanyards, mugs, caps</li>
                <li>Embroidery and signage installation</li>
              </ul>
            </article>

            <article className="about-story-card">
              <span className="card-light" aria-hidden="true" />
              <span className="about-card-kicker">Why PMG</span>
              <h3>Why Customers Come Back</h3>
              <ul className="home-info-list">
                <li>
                  <strong>One-stop convenience</strong> - no need to go to five
                  different shops.
                </li>
                <li>
                  <strong>Machines + supplies</strong> - we help you print and
                  run your own printing business.
                </li>
                <li>
                  <strong>Fast, local, and hands-on</strong> - real people who
                  answer calls and messages.
                </li>
              </ul>
            </article>
          </div>
        </section>

        {/* ✅ CONTACT */}
        <section className="contact-showcase reveal-on-scroll cinematic-scene" id="contact" data-scene-word="CONNECT">
          <div className="home-section-intro contact-intro">
            <h2><AnimatedWords text="Contact" /></h2>
            <p>Message PMG and start your next print project.</p>
          </div>
          <div className="contact-links">
            <a href="tel:09389343337090">
              <span>Call</span>
              0938-934-3337090
            </a>
            <a href="tel:09081858988091">
              <span>Call</span>
              0908-185-8988091
            </a>
            <a href="tel:09122043818">
              <span>Call</span>
              0912-204-3818
            </a>
            <a href="mailto:pmg.prints@gmail.com">
              <span>Email</span>
              pmg.prints@gmail.com
            </a>
          </div>
        </section>

        {recentlyViewed.length > 0 && (
          <section className="content-section recently-viewed-section reveal-on-scroll">
            <HomeProductRail
              title="Your Recently Viewed Items"
              subtitle="Pick up where you left off."
              products={recentlyViewed}
              emptyText="Viewed products will appear here."
              navigate={navigate}
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
