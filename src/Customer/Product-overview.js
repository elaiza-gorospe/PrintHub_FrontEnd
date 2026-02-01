import React, { useMemo, useState, image } from "react";
import { useNavigate } from "react-router-dom";
import "./Product-overview.css";


function ProductOverview() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("Business");

  const allProducts = [
    {
      id: 1,
      category: "Business",
      title: "Business Cards (Calling Cards)",
      image: "/assets/product-overview/business-card.jpg", 
    },
    {
      id: 2,
      category: "Photo Products",
      title: "Mug Printing",
      image: "/assets/products/flyers.jpg",
    },
    {
      id: 3,
      category: "Clothing/Apparel",
      title: "T-shirt Printing",
      image: "/assets/products/posters.jpg",
    },
    {
      id: 4,
      category: "Labels & Packaging",
      title: "Sticker Printing",
      image: "/assets/products/letterhead.jpg",
    },
    {
      id: 5,
      category: "Photo Products",
      title: "Photo Printing",
      image: "/assets/products/envelopes.jpg",
    },
    {
      id: 6,
      category: "Clothing/Apparel",
      title: "DTF Printing",
      image: "/assets/products/postcards.jpg",
    },
    {
      id: 7,
      category: "Labels & Packaging",
      title: "PVC ID & Lanyards",
      image: "/assets/products/folders.jpg",
    },
    {
      id: 8,
      category: "Business",
      title: "Invitation Cards",
      image: "/assets/products/brochures.jpg",
    },

    // Add more categories later if you want:
    { id: 9, category: "Photo Products", title: "Shirts", image: "/assets/products/shirts.jpg" },
    { id: 10, category: "Cloting/Apparel", title: "Hoodies", image: "/assets/products/hoodies.jpg" },
    { id: 11, category: "Labels & Packaging", title: "Hoodies", image: "/assets/products/hoodies.jpg" },
    { id: 12, category: "Business", title: "Hoodies", image: "/assets/products/hoodies.jpg" },
  ];

  const categories = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.category));
    return Array.from(set);
  }, [allProducts]);

  const filtered = useMemo(() => {
    return allProducts.filter((p) => p.category === category);
  }, [allProducts, category]);

  return (
    <div className="po-page">
      {/* Top bar */}
      <div className="po-top">
        <button className="po-back" type="button" onClick={() => navigate("/user-home")}>
          ← Back
        </button>

        <h1 className="po-title">Product Overview</h1>
      </div>

      {/* Category dropdown */}
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

      {/* Grid */}
      <div className="po-grid">
        {filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            className="po-card"
            onClick={() => alert(`Open product: ${p.title} (you can route this later)`)}
          >
            <div className="po-img">
              <img src={p.image} alt={p.title} />
            </div>

            <div className="po-name">{p.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductOverview;
