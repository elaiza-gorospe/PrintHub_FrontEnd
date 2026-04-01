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
  const shipping = 50;
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
    alert(`Order #${orderData.id} placed successfully!`);
    navigate("/user-dashboard");
  };

  if (cartItems.length === 0 && !showCheckout) {
    return (
      <div className="ucart-page">
        <div className="ucart-topbar">
          <button
            className="ucart-back"
            type="button"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Back
          </button>
          <div className="ucart-title">
            <FaShoppingCart className="ucart-title-icon" />
            <h1>Your Cart</h1>
          </div>
        </div>
        <div className="ucart-wrap">
          <div
            className="ucart-card"
            style={{ textAlign: "center", padding: "60px 20px" }}
          >
            <p
              style={{ fontSize: "18px", color: "#666", marginBottom: "20px" }}
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
    );
  }

  return (
    <div className="ucart-page">
      {/* TOP BAR */}
      <div className="ucart-topbar">
        <button
          className="ucart-back"
          type="button"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> Back
        </button>

        <div className="ucart-title">
          <FaShoppingCart className="ucart-title-icon" />
          <h1>Your Cart</h1>
        </div>
      </div>

      <div className="ucart-wrap">
        {/* LEFT: CART ITEMS */}
        <div className="ucart-card">
          <h2 className="ucart-section-title">Items ({cartItems.length})</h2>

          {cartItems.map((item) => (
            <div key={item.id} className="ucart-item">
              <div className="ucart-thumb" />

              <div className="ucart-info">
                <div className="ucart-name">{item.title}</div>
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
  );
}

export default UserCartPage;
