import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaIdCard, FaHeadset, FaCheck, FaCheckCircle } from "react-icons/fa";
import "./Product-detail.css";
import ReCAPTCHA from "react-google-recaptcha";
import productsData from "./Products-data";
import { useCart } from "../hooks/useCart";

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const quoteRef = useRef(null);
  const { addToCart } = useCart();

  const allProducts = useMemo(() => productsData, []);

  const product = useMemo(
    () => allProducts.find((item) => item.id === Number(id)),
    [id, allProducts],
  );

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
  const [selectedShipping, setSelectedShipping] = useState(
    product?.shipping?.[0] || null,
  );
  const [activeTab, setActiveTab] = useState("product");
  const [successMessage, setSuccessMessage] = useState("");

  const [quoteForm, setQuoteForm] = useState({
    subject: "",
    name: "",
    email: "",
    request: "",
  });

  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!product) return;

    setSelectedImage(product.gallery?.[0] || "");
    setSelectedSize(product.sizes?.[0] || "");
    setSelectedMaterial(product.materials?.[0] || "");
    setSelectedSide(product.sides?.[0] || "");
    setSelectedFinish(product.finishing?.[0] || "");
    setSelectedQty(product.quantities?.[0] || null);
    setSelectedShipping(product.shipping?.[0] || null);

    setQuoteForm({
      subject: `Request a quote for ${product.title}`,
      name: "",
      email: "",
      request: "",
    });

    setIsVerified(false);
  }, [product]);

  const handleQuoteChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();

    if (!isVerified) {
      alert("Please verify that you are not a robot.");
      return;
    }

    alert("Quote request submitted!");
  };

  const scrollToQuote = () => {
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

    // Extract numeric price from formatted string (e.g., "₱1,270.50" => 1270.50)
    const extractPrice = (priceStr) => {
      if (typeof priceStr === "number") return priceStr;
      if (!priceStr) return 0;
      return parseFloat(String(priceStr).replace(/[^\d.]/g, "")) || 0;
    };

    addToCart({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: extractPrice(selectedQty.price),
      size: selectedSize,
      material: selectedMaterial,
      sides: selectedSide,
      finishing: selectedFinish,
      quantity: selectedQty,
      shipping: selectedShipping,
    });

    setSuccessMessage("✓ Added to cart!");
    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  };

  if (!product) {
    return (
      <div style={{ padding: "30px" }}>
        <button onClick={() => navigate(-1)}>← Back</button>
        <h2>Product not found</h2>
      </div>
    );
  }

  return (
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
        </div>
      </div>

      <div className="pd-sections">
        <section className="pd-section">
          <h2>1. Select size</h2>

          <div className="pd-card-options">
            {product.sizes.map((size) => (
              <label
                key={size}
                className={`pd-option-card ${selectedSize === size ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="size"
                  value={size}
                  checked={selectedSize === size}
                  onChange={() => setSelectedSize(size)}
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

                {selectedSize === size && (
                  <div className="pd-check-badge">
                    <FaCheck />
                  </div>
                )}
              </label>
            ))}

            <button
              type="button"
              className="pd-option-card pd-option-card-contact"
              onClick={scrollToQuote}
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
            </button>
          </div>
        </section>

        <section className="pd-section">
          <h2>2. Select material</h2>
          {product.materials.map((material) => (
            <label
              key={material}
              className={`pd-line-option ${selectedMaterial === material ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="material"
                value={material}
                checked={selectedMaterial === material}
                onChange={() => setSelectedMaterial(material)}
              />
              <span>{material}</span>
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

        <section className="pd-section">
          <h2>5. Select quantity</h2>
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

        <section className="pd-section pd-quote-section" ref={quoteRef}>
          <h2 className="pd-quote-title">Request a quote.</h2>
          <p className="pd-quote-desc">
            Are you looking for a product that is not on our website? Or have
            you found a product on our website, but it doesn't quite fit your
            needs? Let our team of experts send you a quote that matches your
            expectations in terms of price, quality and delivery time. Simply
            fill in the form below and we will quickly send you a quote.
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

            <div className="pd-quote-row pd-quote-row-top">
              <label htmlFor="request">Request:</label>
              <textarea
                id="request"
                name="request"
                rows="12"
                value={quoteForm.request}
                onChange={handleQuoteChange}
                placeholder={`Product: ${product.title}
Quantity: (e.g. 100 pieces)
Size: (e.g. 3.5 x 2 inches)
Color: (e.g. Full color / Black and white)
Material: (e.g. Paper type / Card type / GSM)
Finishing: (e.g. Matte laminate / Gloss / None)
Printing: (e.g. One-sided / Two-sided)
Processing: (e.g. Cutting / Binding / Packaging)
Delivery: (e.g. Standard / Urgent / Requested date)
Other: (special instructions)`}
              />
            </div>

            <div className="pd-recaptcha-box">
              <ReCAPTCHA
                sitekey="6Lf2sp0sAAAAAAjoItsAePYOJ2frepHwizuc4I5j"
                onChange={(value) => setIsVerified(!!value)}
              />
            </div>

            <div className="pd-quote-actions">
              <button type="submit" className="pd-quote-btn">
                REQUEST QUOTE
              </button>
            </div>
          </form>
        </section>

        <section className="pd-summary">
          <h2>Your product</h2>
          <div className="pd-summary-box">
            <div>
              <h3>{product.title}</h3>
              <p>
                <strong>Size:</strong> {selectedSize}
              </p>
              <p>
                <strong>Material:</strong> {selectedMaterial}
              </p>
              <p>
                <strong>Print:</strong> {selectedSide}
              </p>
              <p>
                <strong>Finishing:</strong> {selectedFinish}
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
                <span>Product</span>
                <strong>{selectedQty?.price}</strong>
              </p>
              <p>
                <span>Delivery</span>
                <strong>{selectedShipping?.price}</strong>
              </p>
              <hr />
              <p className="grand-total">
                <span>Total</span>
                <strong>{selectedQty?.price}</strong>
              </p>
              {successMessage && (
                <div className="pd-success-message">
                  <FaCheckCircle /> {successMessage}
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
      </div>
    </div>
  );
}

export default ProductDetail;
