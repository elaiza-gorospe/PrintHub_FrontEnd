import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-cart.css";
import {
  FaArrowLeft,
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
} from "react-icons/fa";
import CheckoutModal from "./CheckoutModal";
import { useCart } from "../hooks/useCart";
import { extractNumericPrice } from "../utils/priceUtils";
import Header from "../components/Header";

function UserCartPage() {
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  // Get user ID from localStorage (set during login)
  const userId = parseInt(localStorage.getItem("userId")) || null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  // Get shipping cost from first item's customizations (all items should have same shipping)
  let shipping = 0;
  if (cartItems.length > 0) {
    const shippingPrice = cartItems[0].customizations?.shippingPrice;
    shipping = extractNumericPrice(shippingPrice);
    // Ensure shipping is a valid number, not NaN
    if (isNaN(shipping)) {
      shipping = 0;
    }
  }
  const total = subtotal + shipping;

  const formatPeso = (n) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(n);

  // CART FUNCTIONS
  const updateQty = (id, newQty) => {
    updateQuantity(id, newQty);
  };

  const removeItem = (id) => {
    removeFromCart(id);
  };

  const handleCheckoutClick = () => {
    if (!userId) {
      alert("Please login first");
      navigate("/user-login");
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutComplete = (orderData) => {
    // Order placed successfully
    clearCart();
    setShowCheckout(false);
    // Navigate to orders page to see the new order
    navigate("/user-orders");
  };

  if (cartItems.length === 0 && !showCheckout) {
    return (
      <div>
        <Header />
        <div className="ucart-page">
          <div className="ucart-topbar-alt">
            <button class="uo-back" type="button" onClick={() => navigate(-1)}>
              <svg
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 448 512"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"></path>
              </svg>{" "}
              Back
            </button>
            <h1 class="uo-title">My Orders</h1>
          </div>
          <div className="ucart-wrap">
            <div
              className="ucart-card"
              style={{ textAlign: "center", padding: "60px 20px" }}
            >
              <p
                style={{
                  fontSize: "18px",
                  color: "#666",
                  marginBottom: "20px",
                }}
              >
                Your cart is empty
              </p>
              <button
                className="ucart-continue"
                type="button"
                onClick={() => navigate("/product-overview")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="ucart-page">
        {/* TOP BAR */}
        <div className="ucart-topbar-alt">
          <button
            className="ucart-back"
            type="button"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Back
          </button>

          <h1>Your Cart</h1>
        </div>

        <div className="ucart-wrap">
          {/* LEFT: CART ITEMS */}
          <div className="ucart-card">
            <h2 className="ucart-section-title">Items ({cartItems.length})</h2>

            {cartItems.map((item) => (
              <div key={item.id} className="ucart-item">
                <div className="ucart-thumb">
                  {item.customizations?.design?.generatedImageUrl ||
                  item.productImage ||
                  item.images?.[0] ||
                  item.product?.images?.[0] ||
                  item.customizations?.design?.sourceAssetUrls?.[0] ? (
                    <img
                      src={
                        item.customizations?.design?.generatedImageUrl ||
                        item.productImage ||
                        item.images?.[0] ||
                        item.product?.images?.[0] ||
                        item.customizations?.design?.sourceAssetUrls?.[0]
                      }
                      alt={item.title || "Product image"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : null}
                </div>

                <div className="ucart-info">
                  <div className="ucart-name">
                    {item.title}
                    {item.customizations?.design && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          background: "#455073",
                          color: "#fff",
                          borderRadius: 20,
                          padding: "2px 8px",
                          fontWeight: 700,
                          letterSpacing: "0.4px",
                          verticalAlign: "middle",
                        }}
                      >
                        AI Design
                      </span>
                    )}
                  </div>
                  <div className="ucart-desc">
                    {item.desc ||
                      (item.customizations && (
                        <>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            Size: {item.customizations.size}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {item.customizations.quantity}
                          </div>
                          {item.customizations.design?.prompt && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#888",
                                marginTop: 2,
                              }}
                            >
                              Prompt: "
                              {item.customizations.design.prompt.slice(0, 60)}
                              {item.customizations.design.prompt.length > 60
                                ? "…"
                                : ""}
                              "
                            </div>
                          )}
                        </>
                      ))}
                  </div>
                  <div className="ucart-price">{formatPeso(item.price)}</div>
                </div>

                <div className="ucart-controls">
                  <div className="ucart-qty">
                    <button
                      className="ucart-qty-btn"
                      type="button"
                      title="Decrease"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                    >
                      <FaMinus />
                    </button>
                    <span className="ucart-qty-num">{item.qty}</span>
                    <button
                      className="ucart-qty-btn"
                      type="button"
                      title="Increase"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <button
                    className="ucart-remove"
                    type="button"
                    title="Remove item"
                    onClick={() => removeItem(item.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="ucart-summary">
            <h2 className="ucart-section-title">Order Summary</h2>

            <div className="ucart-row">
              <span>Subtotal</span>
              <span>{formatPeso(subtotal)}</span>
            </div>

            <div className="ucart-row">
              <span>Shipping</span>
              <span>{formatPeso(shipping)}</span>
            </div>

            <div className="ucart-divider" />

            <div className="ucart-total">
              <span>Total</span>
              <span>{formatPeso(total)}</span>
            </div>

            <button
              className="ucart-checkout"
              type="button"
              onClick={handleCheckoutClick}
            >
              Proceed to Checkout
            </button>

            <button
              className="ucart-continue"
              type="button"
              onClick={() => navigate("/product-overview")}
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* CHECKOUT MODAL */}
        {showCheckout && (
          <CheckoutModal
            userId={userId}
            cartItems={cartItems}
            total={total}
            shipping={shipping}
            subtotal={subtotal}
            onClose={() => setShowCheckout(false)}
            onSuccess={handleCheckoutComplete}
          />
        )}
      </div>
    </div>
  );
}

export default UserCartPage;
