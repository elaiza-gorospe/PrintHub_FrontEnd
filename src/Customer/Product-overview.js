import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Product-overview.css";
import Header from "../components/Header";
import { buildApiUrl } from "../config/api";
import LoginRequiredModal from "../components/LoginRequiredModal.js";

function ProductOverview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const getCustomerUser = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem("user") || "null");
      const role = String(parsed?.role || "").toLowerCase();
      if (
        !parsed?.id ||
        role === "admin" ||
        role === "staff" ||
        role === "guest"
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") || "");
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(buildApiUrl("/api/products?limit=100"));
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        const list = data.products || data;
        setProducts(Array.isArray(list) ? list : []);
        setCategory("All");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categoryMapping = {
    Clothing: ["T-Shirt", "Jersey", "Mug", "Cap"],
    Business: [
      "Note Cards",
      "Brochure",
      "Flyer",
      "Business Card",
      "Hang Tags",
      "Poster",
      "Notebook",
      "Tarpaulin",
    ],
    Labels: ["Hang Tags", "stickers"],
  };

  const categories = ["All", ...Object.keys(categoryMapping)];
  const productGradients = [
    "po-gradient-cyan",
    "po-gradient-blue",
    "po-gradient-purple",
    "po-gradient-pink",
    "po-gradient-orange",
    "po-gradient-green",
  ];

  const getProductCategory = (product) => {
    const printType = product.print_type || "";
    const name = product.name || "";
    const matched = Object.entries(categoryMapping).find(([, items]) =>
      items.some(
        (item) =>
          printType.toLowerCase().includes(item.toLowerCase()) ||
          name.toLowerCase().includes(item.toLowerCase()),
      ),
    );
    return matched?.[0] || product.category || "Print";
  };

  const filtered = products.filter((product) => {
    const printType = product.print_type || "";
    const name = product.name || "";
    const matchesCategory =
      category === "All" ||
      categoryMapping[category]?.some(
        (item) =>
          printType.toLowerCase().includes(item.toLowerCase()) ||
          name.toLowerCase().includes(item.toLowerCase()),
      );
    const matchesSearch = name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const fallbackImage = "https://via.placeholder.com/300x200?text=No+Image";

  const formatProductPrice = (price) => {
    if (price === null || price === undefined || price === "") return "View price";
    const numeric = Number(price);
    return Number.isFinite(numeric) ? `₱${numeric.toLocaleString()}` : String(price);
  };

  const handleViewProduct = (id) => {
    if (!getCustomerUser()) {
      setShowLoginModal(true);
    } else {
      navigate(`/product/${id}`);
    }
  };

  return (
    <>
      <Header />
      <div className="po-page">
        <div className="po-shell">
          <div className="po-top">
            <div className="po-heading">
              <h1 className="po-title">
                Product <span>Overview</span>
              </h1>
              <p>Discover our complete collection</p>
            </div>
          </div>

          <div className="po-search-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="po-category-pills" aria-label="Product categories">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="po-controls">
            <select
              className="po-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="po-state">Loading products...</p>}
          {error && <p className="po-state po-state-error">{error}</p>}

          <div className="po-grid">
            {filtered.map((product, index) => (
              <button
                key={product.id}
                type="button"
                className="po-card"
                onClick={() => handleViewProduct(product.id)}
                style={{ "--po-delay": `${index * 0.05}s` }}
              >
                <div
                  className={`po-img ${
                    productGradients[index % productGradients.length]
                  }`}
                >
                  <img
                    src={product.images?.[0] || fallbackImage}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                  <span className="po-cart-bubble" aria-hidden="true">
                    🛒
                  </span>
                </div>

                <div className="po-card-body">
                  <div className="po-card-meta">
                    <span>{getProductCategory(product)}</span>
                    <strong>★ {(4.4 + (index % 6) / 10).toFixed(1)}</strong>
                  </div>
                  <div className="po-name">{product.name}</div>
                  <div className="po-price">
                    {formatProductPrice(product.price)}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {!loading && !error && filtered.length === 0 && (
            <div className="po-empty">No products found</div>
          )}
        </div>
      </div>

      {showLoginModal && (
        <LoginRequiredModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            localStorage.removeItem("cart");
            localStorage.removeItem("cartItems");
            localStorage.removeItem("userCart");
            setShowLoginModal(false);
            navigate("/user-login", {
              state: { from: `${location.pathname}${location.search}` },
            });
          }}
          onRegister={() => {
            localStorage.removeItem("cart");
            localStorage.removeItem("cartItems");
            localStorage.removeItem("userCart");
            setShowLoginModal(false);
            navigate("/user-register");
          }}
        />
      )}
    </>
  );
}

export default ProductOverview;
