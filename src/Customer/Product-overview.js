import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Product-overview.css";
import productsData from "./Products-data";

function ProductOverview() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("Business");

  const allProducts = productsData;
    

  const categories = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.category));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    return allProducts.filter((p) => p.category === category);
  }, [category]);

  const fallbackImage =
    "https://via.placeholder.com/300x200?text=No+Image";

  return (
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
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="po-grid">
        {filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            className="po-card"
            onClick={() => navigate(`/product/${p.id}`)}
>
          
            <div className="po-img">
              <img
                src={p.image}
                alt={p.title}
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />
            </div>
            <div className="po-name">{p.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductOverview;