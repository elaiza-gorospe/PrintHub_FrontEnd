import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-home.css";
import Header from "../components/Header";
import { buildApiUrl } from "../config/api";

function UserHomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(buildApiUrl("/api/products?limit=4"))
      .then((r) => r.json())
      .then((data) =>
        setProducts(
          Array.isArray(data.products)
            ? data.products
            : Array.isArray(data)
              ? data
              : [],
        ),
      )
      .catch(() => {});
  }, []);

  return (
    <div className="uh-page">
      <Header />

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

      <section className="uh-section">
        <div className="uh-section-title">
          <h2>Popular Print Products</h2>
          <p>Discover our bestselling print essentials for your business.</p>
        </div>

        <div className="uh-cards">
          {products.map((p) => (
            <div key={p.id} className="uh-card">
              <div className="uh-card-img">
                <img
                  src={
                    p.images?.[0] ||
                    "https://via.placeholder.com/600x400?text=Product+Image"
                  }
                  alt={p.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/600x400?text=Product+Image";
                  }}
                />
              </div>

              <div className="uh-card-body">
                <h3>{p.name}</h3>
                <p>{p.description || ""}</p>
                <button
                  type="button"
                  className="uh-card-link"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  SHOP NOW &gt;&gt;
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
