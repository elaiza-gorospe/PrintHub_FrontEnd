import React, { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { FaIdCard, FaHeadset, FaCheck, FaCheckCircle } from "react-icons/fa";

import "./Product-detail.css";

import ReCAPTCHA from "react-google-recaptcha";

import { useCart } from "../hooks/useCart";

import { extractNumericPrice, formatPrice } from "../utils/priceUtils";

import Header from "../components/Header";

import { buildApiUrl } from "../config/api";

import AIBuilderPanel from "../components/AIBuilder/AIBuilderPanel";

/** Map a raw API product to the shape the component expects */

function mapApiProduct(data) {

const parseOptions = (arr) =>



(arr || []).map((opt) => {
  const idx = opt.indexOf("|");
  if (idx === -1) return { label: opt, price: "" };
  return { label: opt.slice(0, idx), price: opt.slice(idx + 1) };
});
return {



id: data.id,
category: data.print_type || "print",
title: data.name,
image: data.images?.[0] || "",
description: data.description || "",
gallery: data.images?.length > 0 ? data.images : [],
price: data.price,
sizes: data.size_options || [],
materials: data.material_options || [],
sides: data.side_options || [],
finishing: data.finishing_options || [],
colors: data.color_options || [],
processing: data.processing_options || [],
quantities: parseOptions(data.quantity_options),
shipping: parseOptions(data.shipping_options),
ai_prompt_rules: data.ai_prompt_rules || null,
quantity_mode: data.quantity_mode || "dropdown",
quantity_count: data.quantity_count || null,
};

}

// Comprehensive material prices mapping for ALL products
const materialPrices = {
  // T-Shirt materials
  "100% Cotton - 150gsm": 10,
  "100% Cotton - 180gsm": 15,
  "Cotton/Poly Blend - 160gsm": 12,
  "100% Polyester - 140gsm": 8,
  "Organic Cotton - 150gsm": 20,
  
  // Notebook/Card materials
  "Premium 80gsm Paper": 5,
  "Recycled 100gsm Paper": 8,
  "Glossy 120gsm Paper": 10,
  "Matte 100gsm Paper": 7,
  "Kraft Paper 80gsm": 6,
  
  // Tarpaulin/Banner materials
  "Standard Vinyl - 300gsm": 15,
  "Mesh Vinyl - 250gsm": 12,
  "Heavy Duty Vinyl - 500gsm": 25,
  "Frontlit Vinyl - 280gsm": 18,
  "Backlit Vinyl - 320gsm": 22,
  
  // Poster materials
  "Glossy Photo Paper - 170gsm": 8,
  "Matte Photo Paper - 170gsm": 7,
  "Satin Photo Paper - 200gsm": 10,
  "Canvas - 380gsm": 35,
  "Art Paper - 150gsm": 6,
  
  // Hang Tags materials
  "Premium Cardstock - 300gsm": 5,
  "Kraft Cardstock - 300gsm": 4,
  "Recycled Cardstock - 350gsm": 6,
  "Gloss Laminated Cardstock": 8,
  "Matte Laminated Cardstock": 7,
  
  // Stickers & Labels materials
  "Glossy Vinyl": 12,
  "Matte Vinyl": 10,
  "Clear Vinyl": 15,
  "Holographic Vinyl": 20,
  "Paper Sticker - 150gsm": 5,
  
  // Brochure materials
  "Glossy Paper - 150gsm": 8,
  "Matte Paper - 150gsm": 7,
  "Recycled Paper - 120gsm": 6,
  "Premium Silk Paper - 170gsm": 12,
  "Uncoated Paper - 130gsm": 5,
  
  // Flyer materials
  "Glossy Paper - 130gsm": 5,
  "Matte Paper - 130gsm": 4,
  "Recycled Paper - 100gsm": 3,
  "Premium Paper - 150gsm": 7,
  "Flyer Cardstock - 250gsm": 9,
  
  // Business Card materials
  "Standard Cardstock - 350gsm": 8,
  "Premium Cardstock - 400gsm": 12,
  "Recycled Cardstock - 350gsm": 7,
  "Plastic Cards - PVC": 25,
  "Foil Accent Cardstock": 18,
  
  // Default fallback
  "Standard": 5
};

// Finishing prices mapping
const finishingPrices = {
  "None": 0,
  "Heat Transfer": 50,
  "Embroidery": 100,
  "Puff Print": 75,
  "Foil": 60,
  "Rhinestone": 120,
  "Glow-in-the-Dark": 80,
  "Metallic Print": 70,
  "Lamination - Gloss": 15,
  "Lamination - Matte": 15,
  "UV Coating": 20,
  "Spot UV": 30,
  "Die Cut": 25,
  "Embossing": 40
};

// Print side prices mapping
const sidePrices = {
  "Front Chest": 0,
  "Back": 0,
  "Front & Back": 25,
  "Sleeve": 15,
  "Full Body Wrap": 100,
  "Single Side": 0,
  "Double Side": 20,
  "Full Color Both Sides": 30
};

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

product?.materials?.[0] || "",
);

const [selectedSide, setSelectedSide] = useState(product?.sides?.[0] || "");

const [selectedFinish, setSelectedFinish] = useState(

product?.finishing?.[0] || "",
);

const [selectedQty, setSelectedQty] = useState(

product?.quantities?.[0] || null,
);

const [customQty, setCustomQty] = useState("");

const [selectedShipping, setSelectedShipping] = useState(

product?.shipping?.[0] || null,
);

const [activeTab, setActiveTab] = useState("product");

const [successMessage, setSuccessMessage] = useState("");

const [customSizeSelected, setCustomSizeSelected] = useState(false);

const [quoteSuccess, setQuoteSuccess] = useState(false);

const [quoteError, setQuoteError] = useState("");

const [quoteSubmitting, setQuoteSubmitting] = useState(false);

// AI Builder

const [activeDesign, setActiveDesign] = useState(null); // designMeta | null

const storedUser = useMemo(() => {



try {
  return JSON.parse(localStorage.getItem("user"));
} catch {
  return null;
}
}, []);

const isLoggedIn = Boolean(storedUser?.id);

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
delivery: "",
other: "",
});

const [isVerified, setIsVerified] = useState(false);

// Helper function to get material price with fallback
const getMaterialPrice = (material) => {
  return materialPrices[material] || 5; // Default to ₱5 if material not found
};

// Calculate additional costs
const materialAdditionalCost = product ? getMaterialPrice(selectedMaterial) : 0;
const finishingAdditionalCost = finishingPrices[selectedFinish] || 0;
const sideAdditionalCost = sidePrices[selectedSide] || 0;

// Calculate total price including all additions
const totalAdditionalCost = materialAdditionalCost + finishingAdditionalCost + sideAdditionalCost;
const productBasePrice = extractNumericPrice(selectedQty?.price) || 0;
const productTotalPrice = productBasePrice + totalAdditionalCost;
const grandTotalPrice = productTotalPrice + (extractNumericPrice(selectedShipping?.price) || 0);

useEffect(() => {



if (!product) return;
setSelectedImage(product.gallery?.[0] || "");
setSelectedSize(product.sizes?.[0] || "");
setSelectedMaterial(product.materials?.[0] || "");
setSelectedSide(product.sides?.[0] || "");
setSelectedFinish(product.finishing?.[0] || "");
setSelectedQty(product.quantities?.[0] || null);
setCustomQty("");
setSelectedShipping(product.shipping?.[0] || null);
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
  material: product.materials?.[0] || "",
  finishing: product.finishing?.[0] || "",
  printing: product.sides?.[0] || "",
  processing: product.processing?.[0] || "",
  delivery: product.shipping?.[0]?.label || "",
  other: "",
});
setIsVerified(false);
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
}, [selectedQty, customQty, product?.quantity_mode]);

const handleQuoteChange = (e) => {



const { name, value } = e.target;
setQuoteForm((prev) => ({
  ...prev,
  [name]: value,
}));
};

const handleQuoteSubmit = async (e) => {



e.preventDefault();
setQuoteSubmitting(true);
setQuoteError("");
try {
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).id : null;
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
      delivery: quoteForm.delivery,
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



if (!selectedQty || !selectedShipping) {
  alert("Please select quantity and shipping before adding to cart.");
  return;
}
addToCart({
  id: product.id,
  productId: product.id,
  title: product.title,
  price: productTotalPrice,
  size: selectedSize,
  material: selectedMaterial,
  sides: selectedSide,
  finishing: selectedFinish,
  quantity: selectedQty,
  shipping: selectedShipping,
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
            className={activeTab === "specs" ? "active" : ""}
            onClick={() => setActiveTab("specs")}
          >
            SPECIFICATIONS
          </button>
          <button
            type="button"
            className={activeTab === "aibuilder" ? "active" : ""}
            onClick={() => setActiveTab("aibuilder")}
          >
            AI BUILDER
          </button>
        </div>
        {activeTab === "product" && (
          <div className="pd-tab-content">
            <ul className="pd-features">
              <li>
                <strong>Free delivery</strong>
              </li>
              <li>Printed locally, fast delivery</li>
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
            
            {/* MOVED SELECT SIZE SECTION HERE */}
            <div className="pd-size-section-in-tab">
              <h3 style={{ marginTop: '20px', fontSize: '18px' }}>1. Select size</h3>
              <div className="pd-card-options">
                {product.sizes.map((size) => (
                  <label
                    key={size}
                    className={`pd-option-card ${selectedSize === size && !customSizeSelected ? "selected" : ""}`}
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
                    <div className="pd-option-inner">
                      <div className="pd-option-logo">
                        <FaIdCard />
                      </div>
                      <div className="pd-option-title">Standard</div>
                      <div className="pd-option-sub">
                        {size.includes("(")
                          ? size.split("(")[1].replace(")", "")
                          : size}
                      </div>
                    </div>
                    {selectedSize === size && !customSizeSelected && (
                      <div className="pd-check-badge">
                        <FaCheck />
                      </div>
                    )}
                  </label>
                ))}
                <button
                  type="button"
                  className={`pd-option-card pd-option-card-contact ${customSizeSelected ? "selected" : ""}`}
                  onClick={() => {
                    setCustomSizeSelected(true);
                    scrollToQuote();
                  }}
                >
                  <div className="pd-option-inner">
                    <div className="pd-option-logo pd-option-logo-contact">
                      <FaHeadset />
                    </div>
                    <div className="pd-option-title">
                      Looking for something else? ...
                    </div>
                    <div className="pd-option-sub pd-option-sub-strong">
                      Contact Us!
                    </div>
                  </div>
                  {customSizeSelected && (
                    <div className="pd-check-badge">
                      <FaCheck />
                    </div>
                  )}
                </button>
              </div>
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
      </div>
    </div>
    <div className="pd-sections">
      {/* REMOVED SELECT SIZE SECTION FROM HERE - it's now moved to the PRODUCT tab */}
      {!customSizeSelected && (
        <>
          <section className="pd-section">
            <h2>2. Select material</h2>
            {product.materials.map((material) => (
              <label
                key={material}
                className={`pd-line-option pd-price-option ${selectedMaterial === material ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="material"
                  value={material}
                  checked={selectedMaterial === material}
                  onChange={() => setSelectedMaterial(material)}
                />
                <span>{material}</span>
                <strong>+₱{getMaterialPrice(material)}</strong>
              </label>
            ))}
          </section>
          <section className="pd-section">
            <h2>3. Select printed sides</h2>
            {product.sides.map((side) => (
              <label
                key={side}
                className={`pd-line-option pd-price-option ${selectedSide === side ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="side"
                  value={side}
                  checked={selectedSide === side}
                  onChange={() => setSelectedSide(side)}
                />
                <span>{side}</span>
                <strong>+₱{sidePrices[side] || 0}</strong>
              </label>
            ))}
          </section>
          <section className="pd-section">
            <h2>4. Select finishing</h2>
            {product.finishing.map((finish) => (
              <label
                key={finish}
                className={`pd-line-option pd-price-option ${selectedFinish === finish ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="finish"
                  value={finish}
                  checked={selectedFinish === finish}
                  onChange={() => setSelectedFinish(finish)}
                />
                <span>{finish}</span>
                <strong>+₱{finishingPrices[finish] || 0}</strong>
              </label>
            ))}
          </section>
          <section className="pd-section">
            <h2>5. Select quantity</h2>
            {product.quantity_mode === "text" ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <input
                  type="number"
                  min={1}
                  value={customQty}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomQty(v);
                    const n = parseInt(v) || 0;
                    if (n <= 0) return;
                    // If threshold is set and exceeded -> auto-select contact/quote
                    if (
                      product.quantity_count &&
                      n > product.quantity_count
                    ) {
                      setCustomSizeSelected(true);
                      scrollToQuote();
                    } else {
                      // synthesize a selectedQty object so summary and add-to-cart work
                      setSelectedQty({
                        label: `${n} pcs`,
                        price: formatPrice((product.price || 0) * n),
                        quantityNumber: n,
                      });
                      setCustomSizeSelected(false);
                    }
                  }}
                  placeholder="Enter quantity (e.g., 10)"
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
                {product.quantity_count ? (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Quantities greater than {product.quantity_count} will be
                    handled via Quote/Contact.
                  </div>
                ) : null}
              </div>
            ) : (
              product.quantities.map((qty) => (
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
              ))
            )}
          </section>
          <section className="pd-section">
            <h2>6. Select shipping</h2>
            {product.shipping.map((ship) => (
              <label
                key={ship.label}
                className={`pd-line-option pd-price-option ${
                  selectedShipping?.label === ship.label ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={selectedShipping?.label === ship.label}
                  onChange={() => setSelectedShipping(ship)}
                />
                <span>{ship.label}</span>
                <strong>{ship.price}</strong>
              </label>
            ))}
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
            matches your expectations in terms of price, quality and
            delivery time. Simply fill in the form below and we will quickly
            send you a quote.
          </p>
          <form className="pd-quote-box" onSubmit={handleQuoteSubmit}>
            <div className="pd-quote-row">
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
                  <option key={m} value={m}>
                    {m} (+₱{getMaterialPrice(m)})
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
                    {f} (+₱{finishingPrices[f] || 0})
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
                    {s} (+₱{sidePrices[s] || 0})
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
            <div className="pd-quote-row">
              <label htmlFor="delivery">Delivery:</label>
              <select
                id="delivery"
                name="delivery"
                value={quoteForm.delivery}
                onChange={handleQuoteChange}
              >
                {product.shipping.map((s) => (
                  <option key={s.label} value={s.label}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="pd-quote-row pd-quote-row-top">
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
      {!customSizeSelected && (
        <section className="pd-summary">
          <h2>Your product</h2>
          <div className="pd-summary-box">
            <div>
              <h3>{product.title}</h3>
              <p>
                <strong>Size:</strong> {selectedSize}
              </p>
              <p>
                <strong>Material:</strong> {selectedMaterial} (+₱{materialAdditionalCost})
              </p>
              <p>
                <strong>Print:</strong> {selectedSide} (+₱{sideAdditionalCost})
              </p>
              <p>
                <strong>Finishing:</strong> {selectedFinish} (+₱{finishingAdditionalCost})
              </p>
              <p>
                <strong>Quantity:</strong> {selectedQty?.label}
              </p>
              <p>
                <strong>Shipping:</strong> {selectedShipping?.label}
              </p>
            </div>
            <div className="pd-total">
              <p>
                <span>Product Base</span>
                <strong>{selectedQty?.price}</strong>
              </p>
              {materialAdditionalCost > 0 && (
                <p>
                  <span>Material Upgrade</span>
                  <strong>+₱{materialAdditionalCost}</strong>
                </p>
              )}
              {sideAdditionalCost > 0 && (
                <p>
                  <span>Print Upgrade</span>
                  <strong>+₱{sideAdditionalCost}</strong>
                </p>
              )}
              {finishingAdditionalCost > 0 && (
                <p>
                  <span>Finishing Upgrade</span>
                  <strong>+₱{finishingAdditionalCost}</strong>
                </p>
              )}
              <hr />
              <p>
                <span>Subtotal</span>
                <strong>{formatPrice(productTotalPrice)}</strong>
              </p>
              <p>
                <span>Delivery</span>
                <strong>{selectedShipping?.price}</strong>
              </p>
              <hr />
              <p className="grand-total">
                <span>Total</span>
                <strong>{formatPrice(grandTotalPrice)}</strong>
              </p>
              {successMessage && (
                <div className="pd-success-message">
                  <FaCheckCircle /> {successMessage}
                </div>
              )}
              {activeDesign && (
                <div className="pd-design-attached">
                  <img
                    src={activeDesign.generatedImageUrl}
                    alt="design preview"
                    className="pd-design-thumb"
                  />
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
              <button
                type="button"
                className="pd-cart-btn"
                onClick={handleAddToCart}
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  </div>
</div>
);

}

export default ProductDetail;