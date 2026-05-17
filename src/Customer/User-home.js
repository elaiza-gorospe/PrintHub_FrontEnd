import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-home.css";
import Header from "../components/Header";
import { buildApiUrl } from "../config/api";

function UserHomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeBestSeller, setActiveBestSeller] = useState(0);

  useEffect(() => {
    fetch(buildApiUrl("/api/products?limit=8"))
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

  const bestSellers = products.slice(0, 4);
  const activeProduct = bestSellers[activeBestSeller] || bestSellers[0];
  const fallbackImage = "https://via.placeholder.com/600x400?text=Product+Image";

  useEffect(() => {
    if (bestSellers.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveBestSeller((current) => (current + 1) % bestSellers.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [bestSellers.length]);

  const moveBestSeller = (direction) => {
    if (!bestSellers.length) return;
    setActiveBestSeller((current) =>
      direction === "next"
        ? (current + 1) % bestSellers.length
        : (current - 1 + bestSellers.length) % bestSellers.length,
    );
  };

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
          <span>Top 4 Best Sellers</span>
          <h2>Customer favorites ready for your next print run.</h2>
          <p>Swipe through PMG's most requested products and jump straight to the product page.</p>
        </div>

        {activeProduct && (
          <div className="uh-bestseller-showcase">
            <div className="uh-bestseller-copy">
              <span>Best seller #{activeBestSeller + 1}</span>
              <h3>{activeProduct.name}</h3>
              <p>
                A reliable pick for everyday branding, custom gifts, business
                essentials, and polished customer-ready output.
              </p>
              <div className="uh-bestseller-tags">
                <span>{activeProduct.stock ? `${activeProduct.stock} in stock` : "Made to order"}</span>
                <span>Starts at ₱{Number(activeProduct.price || 0).toLocaleString()}</span>
              </div>
              <button
                type="button"
                className="uh-bestseller-cta"
                onClick={() => navigate(`/product/${activeProduct.id}`)}
              >
                View Product
              </button>
            </div>

            <button
              className="uh-carousel-arrow"
              type="button"
              onClick={() => moveBestSeller("prev")}
              aria-label="Previous best seller"
            >
              ‹
            </button>

            <div className="uh-bestseller-media">
              <img
                src={activeProduct.images?.[0] || fallbackImage}
                alt={activeProduct.name}
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
              />
            </div>

            <button
              className="uh-carousel-arrow"
              type="button"
              onClick={() => moveBestSeller("next")}
              aria-label="Next best seller"
            >
              ›
            </button>
          </div>
        )}

        <div className="uh-bestseller-dots">
          {bestSellers.map((product, index) => (
            <button
              key={product.id}
              type="button"
              className={activeBestSeller === index ? "active" : ""}
              onClick={() => setActiveBestSeller(index)}
              aria-label={`Show ${product.name}`}
            />
          ))}
        </div>
      </section>

      <section className="uh-explore-strip">
        <div className="uh-section-title">
          <span>Quick browse</span>
          <h2>Choose what you want to create today.</h2>
        </div>
        <div className="uh-quick-grid">
          {[
            ["Apparel", "T-shirts, jerseys, caps"],
            ["Business", "Cards, flyers, brochures"],
            ["Packaging", "Tags, labels, stickers"],
            ["Large Format", "Posters and tarpaulins"],
          ].map(([title, text], index) => (
            <button
              key={title}
              type="button"
              className="uh-quick-card"
              style={{ "--quick-delay": `${index * 0.08}s` }}
              onClick={() => navigate("/product-overview")}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <small>{text}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="uh-lineup-section">
        <div className="uh-section-title">
          <span>Product lineup</span>
          <h2>Tap a product and start customizing.</h2>
        </div>

        <div className="uh-cards">
          {products.map((p, index) => (
            <div key={p.id} className="uh-card" style={{ "--card-delay": `${index * 0.06}s` }}>
              <div className="uh-card-img">
                <img
                  src={
                    p.images?.[0] ||
                    fallbackImage
                  }
                  alt={p.name}
                  onError={(e) => {
                    e.currentTarget.src = fallbackImage;
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
