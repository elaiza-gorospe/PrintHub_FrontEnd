import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-home.css";
import Header from "../components/Header";
import { buildApiUrl } from "../config/api";
import pmgHeroBg from "../assets/images/pmg-herobg.png";
import pmgPressImage from "../assets/images/pmg-image.jpg";
import pmgMobileImage from "../assets/images/pmg-mobile.jpg";
import businessCardImage from "../assets/images/dashboard/business-card.jpg";
import stickerImage from "../assets/images/dashboard/stick.png";
import tagImage from "../assets/images/dashboard/tag.png";

const heroSlides = [
  {
    eyebrow: "Business Cards",
    word: "Business Cards",
    title: "Elevate Your Brand With",
    text: "Premium cards with crisp color, clean cuts, and finishes that make every first impression feel intentional.",
    image: businessCardImage,
    accent: "#06b6d4",
  },
  {
    eyebrow: "Packaging & Labels",
    word: "Packaging",
    title: "Elevate Your Brand With",
    text: "Custom labels, hang tags, sleeves, and packaging details built for launches, gifts, and retail shelves.",
    image: tagImage,
    accent: "#f59e0b",
  },
  {
    eyebrow: "T-Shirts & Apparel",
    word: "Merchandise",
    title: "Elevate Your Brand With",
    text: "Wearable prints for teams, events, shops, and creator merch with colors that stay confident.",
    image: pmgMobileImage,
    accent: "#a855f7",
  },
  {
    eyebrow: "Stickers & Vinyl",
    word: "Stickers",
    title: "Elevate Your Brand With",
    text: "Durable decals, product stickers, and vinyl graphics made to turn small surfaces into brand moments.",
    image: stickerImage,
    accent: "#22c55e",
  },
  {
    eyebrow: "Large Format Tarpaulin",
    word: "Tarpaulins",
    title: "Elevate Your Brand With",
    text: "Large format prints for storefronts, events, promotions, and outdoor campaigns that need to be seen.",
    image: pmgHeroBg,
    accent: "#ef4444",
  },
  {
    eyebrow: "Corporate Branding",
    word: "Brand Kits",
    title: "Elevate Your Brand With",
    text: "Coordinated print packages for teams that need business cards, apparel, signage, and packaging in one place.",
    image: pmgPressImage,
    accent: "#38bdf8",
  },
];

const homeAnimatedWords = ["print run", "brand drop", "merch batch", "packaging launch"];

function UserHomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeBestSeller, setActiveBestSeller] = useState(0);
  const [activeHero, setActiveHero] = useState(0);
  const [activeTextWord, setActiveTextWord] = useState(0);
  const [heroPointer, setHeroPointer] = useState({ x: 0, y: 0 });

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
  const currentHero = heroSlides[activeHero];

  useEffect(() => {
    if (bestSellers.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveBestSeller((current) => (current + 1) % bestSellers.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [bestSellers.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHero((current) => (current + 1) % heroSlides.length);
    }, 5600);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTextWord((current) => (current + 1) % homeAnimatedWords.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  const handleHeroPointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setHeroPointer({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
    });
  };

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

      <section
        className="uh-hero uh-hero-modern"
        onMouseMove={handleHeroPointerMove}
        onMouseLeave={() => setHeroPointer({ x: 0, y: 0 })}
        style={{
          "--hero-x": heroPointer.x,
          "--hero-y": heroPointer.y,
          "--hero-accent": currentHero.accent,
        }}
      >
        <div className="uh-hero-carousel" aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.eyebrow}
              className={`uh-hero-slide ${activeHero === index ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}
        </div>
        <div className="uh-hero-video-glow" aria-hidden="true" />
        <div className="uh-hero-overlay" />
        <div className="uh-hero-particles" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, index) => (
            <span
              key={index}
              style={{
                "--particle-index": index,
                "--particle-left": `${8 + ((index * 13) % 84)}%`,
                "--particle-top": `${10 + ((index * 17) % 76)}%`,
                "--particle-size": `${4 + (index % 4) * 2}px`,
              }}
            />
          ))}
        </div>
        <div className="uh-floating-sheets" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="uh-hero-content">
          <span className="uh-hero-kicker">{currentHero.eyebrow}</span>
          <h1 key={currentHero.word}>
            {currentHero.title}
            <span>{currentHero.word}</span>
          </h1>
          <p>{currentHero.text}</p>

          <div className="uh-hero-actions">
            <button
              className="uh-hero-btn"
              type="button"
              onClick={() => navigate("/Product-overview")}
            >
              SHOP NOW
            </button>
            <button
              className="uh-hero-ghost"
              type="button"
              onClick={() => navigate("/product-overview")}
            >
              Browse Services
            </button>
          </div>
        </div>

        <div className="uh-hero-preview" aria-label="Featured print categories">
          <div className="uh-product-mockup" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="uh-preview-list">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.eyebrow}
                type="button"
                className={activeHero === index ? "active" : ""}
                onMouseEnter={() => setActiveHero(index)}
                onFocus={() => setActiveHero(index)}
                onClick={() => setActiveHero(index)}
              >
                <span>{slide.eyebrow}</span>
              </button>
            ))}
          </div>
        </div>

      </section>

      <section className="uh-section">
        <div className="uh-section-title">
          <span>Top 4 Best Sellers</span>
          <h2>
            Customer favorites ready for your next{" "}
            <strong key={homeAnimatedWords[activeTextWord]} className="uh-animated-word">
              {homeAnimatedWords[activeTextWord]}
            </strong>
            .
          </h2>
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
          <h2>
            Choose what you want to{" "}
            <strong key={`create-${activeTextWord}`} className="uh-animated-word">
              create today
            </strong>
            .
          </h2>
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
          <h2>
            Tap a product and start{" "}
            <strong key={`custom-${activeTextWord}`} className="uh-animated-word">
              customizing
            </strong>
            .
          </h2>
        </div>

        <div className="uh-cards">
          {products.map((p, index) => (
            <button
              key={p.id}
              type="button"
              className="uh-card"
              style={{ "--card-delay": `${index * 0.06}s` }}
              onClick={() => navigate(`/product/${p.id}`)}
            >
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
                <span className="uh-card-cta">
                  Customize <b aria-hidden="true">›</b>
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default UserHomePage;
