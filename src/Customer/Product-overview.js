import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Product-overview.css";
import Header from "../components/Header";
import { buildApiUrl } from "../config/api";
import LoginRequiredModal from "../components/LoginRequiredModal"; // ✅ added

function ProductOverview() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false); // ✅ modal state

  // ✅ Check if user is logged in
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(buildApiUrl("/api/products?limit=100"));
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        const list = data.products || data;
        setProducts(list);
        // Set first category as default once loaded
        if (list.length > 0) {
          const cats = [...new Set(list.map((p) => p.print_type || "other"))];
          setCategory(cats[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map((p) => p.print_type || "other"))];
  const filtered = category
    ? products.filter((p) => (p.print_type || "other") === category)
    : products;
  const fallbackImage = "[via.placeholder.com](https://via.placeholder.com/300x200?text=No+Image)";

  // ✅ Handle view/buy click
  const handleViewProduct = (id) => {
    if (!user) {
      setShowLoginModal(true); // guest → show popup
    } else {
      navigate(`/product/${id}`);
    }
  };

  return (
    <>
      <Header />
      <div className="po-page">
        <div className="po-top">
          <button
            className="po-back"
            type="button"
            onClick={() => navigate("/user-home")}
          >
            ← Back
          </button>
          <h1 className="po-title">Product Overview</h1>
        </div>

        <div className="po-controls">
          <select
            className="po-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p style={{ padding: "20px", textAlign: "center" }}>
            Loading products...
          </p>
        )}
        {error && (
          <p style={{ padding: "20px", textAlign: "center", color: "#e74c3c" }}>
            {error}
          </p>
        )}

        <div className="po-grid">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              className="po-card"
              onClick={() => handleViewProduct(p.id)} // ✅ updated click
            >
              <div className="po-img">
                <img
                  src={p.images?.[0] || fallbackImage}
                  alt={p.name}
                  onError={(e) => {
                    e.target.src = fallbackImage;
                  }}
                />
              </div>
              <div className="po-name">{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Login required popup */}
      {showLoginModal && (
        <LoginRequiredModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            // ✅ Clear guest cart before redirecting
            localStorage.removeItem("cart");
            localStorage.removeItem("cartItems");
            localStorage.removeItem("userCart");
            setShowLoginModal(false);
            navigate("/user-login");
          }}
          onRegister={() => {
            // ✅ Clear guest cart before redirecting
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
