import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import "./Product-detail.css";
import { useCart } from "../hooks/useCart";
import { extractNumericPrice, formatPrice } from "../utils/priceUtils";
import Header from "../components/Header";
import { buildApiUrl } from "../config/api";
import AIBuilderPanel from "../components/AIBuilder/AIBuilderPanel";
import TshirtCustomizerPanel from "../components/TshirtCustomizer/TshirtCustomizerPanel";
import NotebookCustomizerPanel from "../components/NotebookCustomizer/NotebookCustomizerPanel";
import BusinessCardCustomizerPanel from "../components/BusinessCardCustomizer/BusinessCardCustomizerPanel";
import BrochureCustomizerPanel from "../components/BrochureCustomizer/BrochureCustomizerPanel";
import CapCustomizerPanel from "../components/CapCustomizer/CapCustomizerPanel";
import JerseyCustomizerPanel from "../components/JerseyCustomizer/JerseyCustomizerPanel";
import MugCustomizerPanel from "../components/MugCustomizer/MugCustomizerPanel";
import PosterCustomizerPanel from "../components/PosterCustomizer/PosterCustomizerPanel";
import FlyerCustomizerPanel from "../components/FlyerCustomizer/FlyerCustomizerPanel";
import ThankYouCardCustomizerPanel from "../components/ThankYouCardCustomizer/ThankYouCardCustomizerPanel";
import AppModal from "../components/AppModal";

const RECENTLY_VIEWED_KEY = "printhub_recently_viewed_products";
const RECENTLY_VIEWED_LIMIT = 8;

function formatRecentPrice(price) {
  if (price === null || price === undefined || price === "") return "";
  const numeric = Number(price);
  return Number.isFinite(numeric) ? `₱${numeric.toLocaleString()}` : String(price);
}

const DEFAULT_PRODUCT_ZONES = {

  notebook: ["front_cover", "back_cover"],
  tshirt: ["front", "back", "left_sleeve", "right_sleeve"],
  jersey: ["front", "back", "left_sleeve", "right_sleeve"],
  jersery: ["front", "back", "left_sleeve", "right_sleeve"],
  cap: ["front", "back", "left_sleeve", "right_sleeve"],
  mug: ["front", "back"],
  calling_card: ["front", "back"],
  business_card: ["front", "back"],
  brochures: ["front", "back"],
  flyers: ["front", "back"],
  poster: ["front"],
  posters: ["front"],
  thank_you_card: ["front", "back"],
  banners: ["front"],
  stickers: ["front"],
  hang_tags: ["front", "back"],
  other: ["front", "back"],
};

function getDefaultPrintZones(category) {
  const normalized = String(category || "other").toLowerCase();
  return DEFAULT_PRODUCT_ZONES[normalized] || DEFAULT_PRODUCT_ZONES.other;
}

function inferCustomizerCategory({ category, name, title }) {
  const rawCategory = String(category || "").toLowerCase();
  const label = `${name || ""} ${title || ""}`.toLowerCase();

  if (label.includes("flyer")) return "flyers";
  if (label.includes("poster")) return "posters";

  if (rawCategory && !["service", "print", "other"].includes(rawCategory)) {
    return rawCategory;
  }
  if (label.includes("business card") || label.includes("calling card")) {
    return "business_card";
  }
  if (label.includes("thank you")) return "thank_you_card";
  if (label.includes("brochure")) return "brochures";
  if (label.includes("notebook")) return "notebook";
  if (label.includes("jersey")) return "jersey";
  if (label.includes("cap") || label.includes("hat")) return "cap";
  if (label.includes("mug") || label.includes("cup")) return "mug";
  if (label.includes("shirt") || label.includes("t-shirt") || label.includes("tshirt")) {
    return "tshirt";
  }
  return rawCategory || "other";
}

function getCustomizerPanel(category) {
  const normalized = String(category || "other").toLowerCase();
  if (normalized === "notebook") return NotebookCustomizerPanel;
  if (normalized === "business_card" || normalized === "calling_card") {
    return BusinessCardCustomizerPanel;
  }
  if (normalized === "brochures") return BrochureCustomizerPanel;
  if (normalized === "flyer" || normalized === "flyers") return FlyerCustomizerPanel;
  if (normalized === "poster" || normalized === "posters") return PosterCustomizerPanel;
  if (normalized === "thank_you_card") return ThankYouCardCustomizerPanel;
  if (normalized === "cap") return CapCustomizerPanel;
  if (normalized === "jersey" || normalized === "jersery") return JerseyCustomizerPanel;
  if (normalized === "mug") return MugCustomizerPanel;
  return TshirtCustomizerPanel;
}

/** Map a raw API product to the shape the component expects */
function mapApiProduct(data) {
  const parseOptions = (arr) =>
    (arr || []).map((opt) => {
      const value = String(opt || "");
      const idx = value.indexOf("|");
      if (idx === -1) return { label: value, price: "" };
      return { label: value.slice(0, idx), price: value.slice(idx + 1) };
    });


  const dbCategory = inferCustomizerCategory({
    category: data.category,
    name: data.name,
  });
  const printZones =
    data.print_zones?.length > 0
      ? data.print_zones
      : getDefaultPrintZones(dbCategory);

  return {
    id: data.id,
    category: data.print_type || "print",
    title: data.name,
    image: data.images?.[0] || "",
    description: data.description || "",
    images: data.images || [],
    gallery: data.images?.length > 0 ? data.images : [],
    price: data.price,
    sizes: data.size_options || [],
    materials: parseOptions(data.material_options),
    sides: data.side_options || [],
    finishing: data.finishing_options || [],
    colors: data.color_options || [],
    processing: data.processing_options || [],
    quantities: parseOptions(data.quantity_options),
    ai_prompt_rules: data.ai_prompt_rules || null,
    print_zones: printZones,
    dbCategory,
    rawCategory: data.category || "other",
    quantity_mode: data.quantity_mode || "dropdown",
    quantity_count: data.quantity_count || null,
  };
}

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const quoteRef = useRef(null);
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setProductLoading(true);
    setProductError(null);
    fetch(buildApiUrl(`/api/products/${id}`))
      .then((r) => {
        if (!r.ok) throw new Error("Product not found");
        return r.json();
      })
      .then((data) => setProduct(mapApiProduct(data)))
      .catch((err) => setProductError(err.message))
      .finally(() => setProductLoading(false));
  }, [id]);

  const [selectedImage, setSelectedImage] = useState(
    product?.gallery?.[0] || "",
  );
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "");
  const [selectedMaterial, setSelectedMaterial] = useState(
    product?.materials?.[0] || null,
  );
  const [selectedSide, setSelectedSide] = useState(product?.sides?.[0] || "");
  const [selectedFinish, setSelectedFinish] = useState(
    product?.finishing?.[0] || "",
  );
  const [selectedQty, setSelectedQty] = useState(
    product?.quantities?.[0] || null,
  );
  const [customQty, setCustomQty] = useState("");
  const [activeTab, setActiveTab] = useState("product");
  const [successMessage, setSuccessMessage] = useState("");
  const [customSizeSelected, setCustomSizeSelected] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [noticeModal, setNoticeModal] = useState(null);

  // AI Builder
  const [activeDesign, setActiveDesign] = useState(null); // designMeta | null
  const storedUser = useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("user") || "null");
      const role = String(parsed?.role || "").toLowerCase();
      if (!parsed?.id || role === "admin" || role === "staff" || role === "guest") {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, []);
  const [quoteForm, setQuoteForm] = useState({
    subject: "",
    name: "",
    email: "",
    quantity: "",
    size: "",
    color: "",
    material: "",
    finishing: "",
    printing: "",
    processing: "",
    other: "",
  });

  useEffect(() => {
    if (!product) return;

    setSelectedImage(product.gallery?.[0] || "");
    setSelectedSize(product.sizes?.[0] || "");
    setSelectedMaterial(product.materials?.[0] || null);
    setSelectedSide(product.sides?.[0] || "");
    setSelectedFinish(product.finishing?.[0] || "");
    setSelectedQty(product.quantities?.[0] || null);
    setCustomQty("");
    setCustomSizeSelected(false);

    setQuoteForm({
      subject: `Request a quote for ${product.title}`,
      name: "",
      email: "",
      quantity:
        product.quantity_mode === "text"
          ? ""
          : product.quantities?.[0]?.label || "",
      size: product.sizes?.[0] || "",
      color: product.colors?.[0] || "",
      material: product.materials?.[0]?.label || "",
      finishing: product.finishing?.[0] || "",
      printing: product.sides?.[0] || "",
      processing: product.processing?.[0] || "",
      other: "",
    });


  }, [product]);

  useEffect(() => {
    if (!product?.id) return;

    try {
      const viewed = JSON.parse(
        localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]",
      );
      const recentProduct = {
        id: product.id,
        name: product.title,
        images: product.gallery?.length ? product.gallery : product.images || [],
        image: product.image,
        price: product.price,
        viewedAt: Date.now(),
      };
      const nextViewed = [
        recentProduct,
        ...(Array.isArray(viewed)
          ? viewed.filter((item) => String(item.id) !== String(product.id))
          : []),
      ].slice(0, RECENTLY_VIEWED_LIMIT);

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(nextViewed));
      setRecentlyViewed(
        nextViewed.filter((item) => String(item.id) !== String(product.id)),
      );
    } catch {
      // Recently viewed is a convenience feature; product viewing should still work.
    }
  }, [product]);

  // Keep quote form quantity in sync with the selected quantity control
  useEffect(() => {
    if (!product) return;
    if (product.quantity_mode === "text") {
      // For text mode, prefer the numeric customQty
      setQuoteForm((prev) => ({ ...prev, quantity: customQty || "" }));
    } else {
      // For dropdown mode, mirror the selectedQty label
      setQuoteForm((prev) => ({ ...prev, quantity: selectedQty?.label || "" }));
    }
  }, [selectedQty, customQty, product]);

  const materialSurcharge = useMemo(
    () => extractNumericPrice(selectedMaterial?.price),
    [selectedMaterial],
  );

  const quantityPrice = useMemo(
    () => extractNumericPrice(selectedQty?.price),
    [selectedQty],
  );

  const grandTotal = useMemo(
    () => quantityPrice + materialSurcharge,
    [quantityPrice, materialSurcharge],
  );

  const materialDisplayPrice = useMemo(() => {
    if (!selectedMaterial?.price) return "Included";
    const numeric = extractNumericPrice(selectedMaterial.price);
    if (!numeric) return "Included";
    return `+ ${formatPrice(numeric)}`;
  }, [selectedMaterial]);

  const handleQuoteChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();

    setQuoteSubmitting(true);
    setQuoteError("");

    try {
      const userId = storedUser?.id || null;

      const res = await fetch(buildApiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          product_title: product.title,
          subject: quoteForm.subject,
          name: quoteForm.name,
          email: quoteForm.email,
          quantity: quoteForm.quantity,
          size: quoteForm.size,
          color: quoteForm.color,
          material: quoteForm.material,
          finishing: quoteForm.finishing,
          printing: quoteForm.printing,
          processing: quoteForm.processing,
          other: quoteForm.other,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");

      setQuoteSuccess(true);
      setQuoteForm((prev) => ({
        ...prev,
        name: "",
        email: "",
        other: "",
      }));
    } catch (err) {
      setQuoteError(err.message || "Something went wrong. Please try again.");
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const scrollToQuote = () => {
    // Select the Contact Us / custom size option when user requests a quote
    setCustomSizeSelected(true);
    quoteRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleAddToCart = () => {
    if (!selectedQty) {
      setNoticeModal({
        title: "Complete your options",
        message: "Please select quantity before adding to cart.",
        tone: "info",
      });
      return;
    }

    addToCart({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: grandTotal,
      size: selectedSize,
      material: {
        label: selectedMaterial?.label || "",
        price: selectedMaterial?.price || "",
      },
      sides: selectedSide,
      finishing: selectedFinish,
      quantity: selectedQty,
      design: activeDesign || null,
      images: product.images,
    });


    setSuccessMessage("✓ Added to cart!");
    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  };

  if (productLoading) {
    return (
      <div>
        <Header />
        <div style={{ padding: "30px", maxWidth: "1400px", margin: "0 auto" }}>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div>
        <Header />
        <div style={{ padding: "30px", maxWidth: "1400px", margin: "0 auto" }}>
          <button onClick={() => navigate(-1)}>← Back</button>
          <h2>{productError || "Product not found"}</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="pd-page">
        <div className="pd-breadcrumb">
          <span onClick={() => navigate("/user-home")}>Home</span>
          <span>›</span>
          <span onClick={() => navigate(-1)}>{product.category}</span>
          <span>›</span>
          <span>{product.title}</span>
        </div>

        <div className="pd-top">
          <div className="pd-gallery">
            <div className="pd-thumbs">
              {product.gallery.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  className={`pd-thumb ${selectedImage === img ? "active" : ""}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`${product.title} ${index + 1}`} />
                </button>
              ))}
            </div>

            <div className="pd-main-image">
              <img src={selectedImage} alt={product.title} />
            </div>
          </div>

          <div className="pd-info">
            <h1>{product.title}</h1>

            <div className="pd-tabs">
              <button
                type="button"
                className={activeTab === "product" ? "active" : ""}
                onClick={() => setActiveTab("product")}
              >
                PRODUCT
              </button>
              <button
                type="button"
                className={activeTab === "templates" ? "active" : ""}
                onClick={() => setActiveTab("templates")}
              >
                TEMPLATES
              </button>
              <button
                type="button"
                className={activeTab === "specs" ? "active" : ""}
                onClick={() => setActiveTab("specs")}
              >
                SPECIFICATIONS
              </button>
              {/* <button
                type="button"
                className={activeTab === "aibuilder" ? "active" : ""}
                onClick={() => setActiveTab("aibuilder")}
              >
                AI BUILDER
              </button> */}
              {product.print_zones?.length > 0 && (
                <button
                  type="button"
                  className={activeTab === "customize" ? "active" : ""}
                  onClick={() => setActiveTab("customize")}
                >
                  CUSTOMIZE
                </button>
              )}
            </div>

            {activeTab === "product" && (
              <div className="pd-tab-content">
                <ul className="pd-features">
                  <li>
                    <strong>Fast in-store pickup</strong>
                  </li>
                  <li>Printed locally with premium finish</li>
                  <li>Choose from premium print options</li>
                </ul>

                <p className="pd-description">{product.description}</p>

                <p className="pd-extra-link">
                  Additional wishes?{" "}
                  <button
                    type="button"
                    className="pd-inline-link"
                    onClick={scrollToQuote}
                  >
                    Request a quote
                  </button>
                </p>
              </div>
            )}

            {activeTab === "templates" && (
              <div className="pd-tab-content">
                <p>Available template size:</p>
                <div className="pd-template-box">
                  <strong>{product.sizes[0]}</strong>
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="pd-tab-content">
                <ul className="pd-features">
                  <li>Use high-resolution images</li>
                  <li>Submit files in correct size</li>
                  <li>Use bleed for print-safe layout</li>
                </ul>
              </div>
            )}

            {activeTab === "aibuilder" && (
              <div className="pd-tab-content pd-tab-builder-inline">
                <AIBuilderPanel
                  product={product}
                  productImage={selectedImage}
                  activeDesign={activeDesign}
                  ai_prompt_rules={product?.ai_prompt_rules}
                  onDesignReady={(meta) => {
                    setActiveDesign(meta);
                  }}
                  onClear={() => setActiveDesign(null)}
                />
              </div>
            )}

            {activeTab === "customize" && (
              <div className="pd-tab-content pd-tab-builder-inline">
                {(() => {
                  const CustomizerPanel = getCustomizerPanel(product.dbCategory);
                  return (
                    <CustomizerPanel
                    product={product}
                    activeDesign={activeDesign}
                    onDesignReady={(meta) => setActiveDesign(meta)}
                    onClear={() => setActiveDesign(null)}
                  />
                  );
                })()}
              </div>
            )}


          </div>
        </div>

        <div className="pd-sections">
          <section className="pd-section">
            <h2>1. Select size</h2>

            <div className="pd-line-options">
              {product.sizes.map((size) => (
                <label
                  key={size}
                  className={`pd-line-option ${selectedSize === size && !customSizeSelected ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="size"
                    value={size}
                    checked={selectedSize === size && !customSizeSelected}
                    onChange={() => {
                      setSelectedSize(size);
                      setCustomSizeSelected(false);
                    }}
                  />
                  <span>
                    {size.includes("(")
                      ? size.split("(")[1].replace(")", "")
                      : size}
                  </span>
                </label>
              ))}

              <label
                className={`pd-line-option pd-size-contact-option ${customSizeSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="size"
                  checked={customSizeSelected}
                  onChange={() => {
                    setCustomSizeSelected(true);
                    scrollToQuote();
                  }}
                />
                <span>Looking for something else? Contact Us!</span>
              </label>
            </div>
          </section>

          {!customSizeSelected && (
            <>
              <section className="pd-section">
                <h2>2. Select material</h2>
                {product.materials.map((material) => (
                  <label
                    key={`${material.label}-${material.price}`}
                    className={`pd-line-option pd-price-option ${selectedMaterial?.label === material.label ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="material"
                      value={material.label}
                      checked={selectedMaterial?.label === material.label}
                      onChange={() => setSelectedMaterial(material)}
                    />
                    <span>{material.label}</span>
                    <strong>
                      {material.price
                        ? `+ ${formatPrice(extractNumericPrice(material.price))}`
                        : "Included"}
                    </strong>
                  </label>
                ))}
              </section>

              <section className="pd-section">
                <h2>3. Select printed sides</h2>
                {product.sides.map((side) => (
                  <label
                    key={side}
                    className={`pd-line-option ${selectedSide === side ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="side"
                      value={side}
                      checked={selectedSide === side}
                      onChange={() => setSelectedSide(side)}
                    />
                    <span>{side}</span>
                  </label>
                ))}
              </section>

              <section className="pd-section">
                <h2>4. Select finishing</h2>
                {product.finishing.map((finish) => (
                  <label
                    key={finish}
                    className={`pd-line-option ${selectedFinish === finish ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="finish"
                      value={finish}
                      checked={selectedFinish === finish}
                      onChange={() => setSelectedFinish(finish)}
                    />
                    <span>{finish}</span>
                  </label>
                ))}
              </section>

              <section className="pd-section pd-quantity-stage">
                <div className="pd-quantity-head">
                  <h2>5. Select quantity</h2>
                  <span className="pd-stage-pill">Final step before cart</span>
                </div>

                {product.quantity_mode === "text" ? (
                  <div className="pd-qty-custom-wrap">
                    <input
                      type="number"
                      min={1}
                      className="pd-qty-custom-input"
                      value={customQty}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCustomQty(v);
                        const n = parseInt(v, 10) || 0;
                        if (n <= 0) return;

                        if (product.quantity_count && n > product.quantity_count) {
                          setCustomSizeSelected(true);
                          scrollToQuote();
                        } else {
                          setSelectedQty({
                            label: `${n} pcs`,
                            price: formatPrice(extractNumericPrice(product.price) * n),
                            quantityNumber: n,
                          });
                          setCustomSizeSelected(false);
                        }
                      }}
                      placeholder="Enter quantity (e.g., 10)"
                    />
                    {product.quantity_count ? (
                      <div className="pd-qty-note">
                        Quantities greater than {product.quantity_count} will be handled via
                        Quote/Contact.
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="pd-qty-grid">
                    {product.quantities.map((qty) => (
                      <label
                        key={qty.label}
                        className={`pd-line-option pd-price-option ${
                          selectedQty?.label === qty.label ? "selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="quantity"
                          checked={selectedQty?.label === qty.label}
                          onChange={() => setSelectedQty(qty)}
                        />
                        <span>{qty.label}</span>
                        <strong>{qty.price}</strong>
                      </label>
                    ))}
                  </div>
                )}

                <div className="pd-order-card pd-order-card-inline">
                  <div className="pd-order-head">
                    <span>Ready to print</span>
                    <strong>{formatPrice(grandTotal)}</strong>
                  </div>

                  <div className="pd-order-details">
                    <span>
                      <strong>Size</strong>
                      {selectedSize || "Select one"}
                    </span>
                    <span>
                      <strong>Material</strong>
                      {selectedMaterial?.label || "Select one"}
                    </span>
                    <span>
                      <strong>Print</strong>
                      {selectedSide || "Select one"}
                    </span>
                    <span>
                      <strong>Qty</strong>
                      {selectedQty?.label || customQty || "Select one"}
                    </span>
                  </div>

                  <div className="pd-order-price-lines">
                    <p>
                      <span>Quantity price</span>
                      <strong>{selectedQty?.price || formatPrice(0)}</strong>
                    </p>
                    <p>
                      <span>Material add-on</span>
                      <strong>{materialDisplayPrice}</strong>
                    </p>
                    <p className="pd-order-total-line">
                      <span>Total</span>
                      <strong>{formatPrice(grandTotal)}</strong>
                    </p>
                  </div>

                  {successMessage && (
                    <div className="pd-success-message">
                      <FaCheckCircle /> {successMessage}
                    </div>
                  )}

                  {activeDesign && (
                    <div className="pd-design-attached">
                      {Object.values(activeDesign.zones || {})
                        .filter((z) => z?.imageUrl)
                        .map((z, i) => (
                          <img
                            key={i}
                            src={z.imageUrl}
                            alt={`design zone ${i + 1}`}
                            className="pd-design-thumb"
                          />
                        ))}
                      {!Object.values(activeDesign.zones || {}).some((z) => z?.imageUrl) &&
                        activeDesign.generatedImageUrl && (
                          <img
                            src={activeDesign.generatedImageUrl}
                            alt="design preview"
                            className="pd-design-thumb"
                          />
                        )}
                      <span>AI design attached</span>
                      <button
                        type="button"
                        className="pd-design-remove"
                        onClick={() => setActiveDesign(null)}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <button type="button" className="pd-cart-btn" onClick={handleAddToCart}>
                    ADD TO CART
                  </button>
                </div>
              </section>
            </>
          )}

          {customSizeSelected && (
            <section className="pd-section pd-quote-section" ref={quoteRef}>
              <h2 className="pd-quote-title">Request a quote.</h2>
                <p className="pd-quote-desc">
                  Are you looking for a product that is not on our website? Or
                  have you found a product on our website, but it doesn't quite
                  fit your needs? Let our team of experts send you a quote that
                  matches your expectations in terms of price and quality.
                  Simply fill in the form below and we will quickly send you a
                  quote.
                </p>


              <form className="pd-quote-box" onSubmit={handleQuoteSubmit}>
                <div className="pd-quote-row pd-quote-row-wide">
                  <label htmlFor="subject">Subject:</label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={quoteForm.subject}
                    onChange={handleQuoteChange}
                  />
                </div>

                <div className="pd-quote-row">
                  <label htmlFor="name">Your Name:</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={quoteForm.name}
                    onChange={handleQuoteChange}
                  />
                </div>

                <div className="pd-quote-row">
                  <label htmlFor="email">Your Email:</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={quoteForm.email}
                    onChange={handleQuoteChange}
                  />
                </div>

                <div className="pd-quote-row">
                  <label>Product:</label>
                  <div className="pd-quote-readonly">{product.title}</div>
                </div>

                <div className="pd-quote-row">
                  <label htmlFor="quantity">Quantity:</label>
                  {product.quantity_mode === "text" ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min={1}
                        value={quoteForm.quantity}
                        onChange={handleQuoteChange}
                        placeholder="Enter quantity"
                      />
                      {product.quantity_count ? (
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          Quantities greater than {product.quantity_count} will
                          be handled via Quote/Contact.
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <select
                      id="quantity"
                      name="quantity"
                      value={quoteForm.quantity}
                      onChange={handleQuoteChange}
                    >
                      {product.quantities.map((q) => (
                        <option key={q.label} value={q.label}>
                          {q.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="pd-quote-row">
                  <label htmlFor="size">Size:</label>
                  <select
                    id="size"
                    name="size"
                    value={quoteForm.size}
                    onChange={handleQuoteChange}
                  >
                    {product.sizes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pd-quote-row">
                  <label htmlFor="color">Color:</label>
                  <select
                    id="color"
                    name="color"
                    value={quoteForm.color}
                    onChange={handleQuoteChange}
                  >
                    {(product.colors || []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pd-quote-row">
                  <label htmlFor="material">Material:</label>
                  <select
                    id="material"
                    name="material"
                    value={quoteForm.material}
                    onChange={handleQuoteChange}
                  >
                    {product.materials.map((m) => (
                      <option key={m.label} value={m.label}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pd-quote-row">
                  <label htmlFor="finishing">Finishing:</label>
                  <select
                    id="finishing"
                    name="finishing"
                    value={quoteForm.finishing}
                    onChange={handleQuoteChange}
                  >
                    {product.finishing.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pd-quote-row">
                  <label htmlFor="printing">Printing:</label>
                  <select
                    id="printing"
                    name="printing"
                    value={quoteForm.printing}
                    onChange={handleQuoteChange}
                  >
                    {product.sides.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pd-quote-row">
                  <label htmlFor="processing">Processing:</label>
                  <select
                    id="processing"
                    name="processing"
                    value={quoteForm.processing}
                    onChange={handleQuoteChange}
                  >
                    {(product.processing || []).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="pd-quote-row pd-quote-row-wide pd-quote-row-top">
                  <label htmlFor="other">Other:</label>
                  <textarea
                    id="other"
                    name="other"
                    rows="4"
                    value={quoteForm.other}
                    onChange={handleQuoteChange}
                    placeholder="Special instructions or additional requests..."
                  />
                </div>

                <div className="pd-quote-actions">
                  {quoteSuccess && (
                    <div className="pd-quote-success">
                      <FaCheckCircle /> Your quote request has been submitted!
                      We'll get back to you shortly.
                    </div>
                  )}
                  {quoteError && (
                    <div className="pd-quote-error">{quoteError}</div>
                  )}
                  <button
                    type="submit"
                    className="pd-quote-btn"
                    disabled={quoteSubmitting}
                  >
                    {quoteSubmitting ? "SUBMITTING..." : "REQUEST QUOTE"}
                  </button>
                </div>
              </form>
            </section>
          )}

        </div>

        {recentlyViewed.length > 0 && (
          <section className="pd-recently-viewed">
            <div className="pd-recently-head">
              <h2>Your recently viewed items</h2>
              <p>Products you opened earlier will stay here for quick access.</p>
            </div>
            <div className="pd-recently-grid">
              {recentlyViewed.slice(0, 4).map((item) => {
                const image =
                  item.images?.[0] ||
                  item.image ||
                  "https://via.placeholder.com/300x200?text=No+Image";
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="pd-recent-card"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    <span className="pd-recent-heart" aria-hidden="true">
                      ♡
                    </span>
                    <img
                      src={image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                    <strong>{item.name}</strong>
                    {formatRecentPrice(item.price) ? (
                      <span>From {formatRecentPrice(item.price)}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
      <AppModal
        open={Boolean(noticeModal)}
        title={noticeModal?.title}
        message={noticeModal?.message}
        tone={noticeModal?.tone}
        onConfirm={() => setNoticeModal(null)}
      />
    </div>
  );
}

export default ProductDetail;
