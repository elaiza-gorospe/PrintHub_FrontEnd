import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-home.css";
import Header from "../components/Header";

function UserHomePage() {
  const navigate = useNavigate();

  const products = [
    {
      id: 1,
      title: "Business Cards",
      desc: "Make first impressions last with premium business cards.",
      cta: "SHOP BUSINESS CARDS >>",
      image:
        "https://images.unsplash.com/photo-1718670013921-2f144aba173a?q=80&w=1360&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 2,
      title: "Stickers & Labels",
      desc: "Accentuate your products with unique labels and stickers.",
      cta: "SHOP STICKERS & LABELS >>",
      image:
        "https://images.unsplash.com/photo-1773904215704-139e9ff8c894?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 3,
      title: "Product Hang Tags",
      desc: "Add more information about your products with hang tags.",
      cta: "SHOP HANG TAGS >>",
      image:
        "https://images.unsplash.com/photo-1734467241447-44b43f8bc051?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 4,
      title: "Note Cards",
      desc: "Thank-you cards are always welcome. Gain trust with customers.",
      cta: "SHOP THANK YOU CARDS >>",
      image:
        "https://plus.unsplash.com/premium_photo-1726863046363-3b16359b9477?q=80&w=1381&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

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
                  src={p.image}
                  alt={p.title}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/600x400?text=Product+Image";
                  }}
                />
              </div>

              <div className="uh-card-body">
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <button
                  type="button"
                  className="uh-card-link"
                  onClick={() => navigate("/user-cart")}
                >
                  {p.cta}
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
