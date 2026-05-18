import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./User-cart.css";
import {
  FaArrowLeft,
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingBag,
} from "react-icons/fa";
import CheckoutModal from "./CheckoutModal";
import { useCart } from "../hooks/useCart";
import Header from "../components/Header";

function UserCartPage() {
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCheckoutAuthModal, setShowCheckoutAuthModal] = useState(false);
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  // Local edit state for quantity inputs (keeps typing from immediately mutating global cart)
  const [editQtyMap, setEditQtyMap] = useState({});

  // Initialize local qty map when cart items change
  useEffect(() => {
    const next = {};
    cartItems.forEach((it) => {
      next[it.id] =
        typeof editQtyMap[it.id] !== "undefined"
          ? editQtyMap[it.id]
          : String(it.qty);
    });
    setEditQtyMap((prev) => ({ ...next, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const storedUser = getStoredUser();
  const userRole = String(storedUser?.role || "").toLowerCase();
  const isCustomer = Boolean(
    storedUser?.id &&
    userRole !== "admin" &&
    userRole !== "staff" &&
    userRole !== "guest",
  );
  const userId = isCustomer ? parseInt(storedUser.id, 10) : null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const total = subtotal;

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
    if (!isCustomer) {
      setShowCheckoutAuthModal(true);
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutAuthConfirm = () => {
    setShowCheckoutAuthModal(false);
    navigate("/user-register");
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
          <div className="ucart-moving-bg" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="ucart-topbar-alt">
            <button className="ucart-back" type="button" onClick={() => navigate(-1)}>
              <FaArrowLeft />
              Back
            </button>
            <h1 className="ucart-empty-title">My Cart</h1>
          </div>
          <div className="ucart-empty-wrap">
            <div className="ucart-empty-card">
              <div className="ucart-empty-icon">
                <FaShoppingBag />
              </div>
              <h2>Your cart is empty</h2>
              <p>Start adding products to your cart and they will appear here.</p>
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
        <div className="ucart-moving-bg" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        {/* TOP BAR */}
        <div className="ucart-topbar-alt">
          <button className="uo-back" type="button" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
          <h1 className="uo-title">My Cart</h1>
        </div>

        <div className="ucart-wrap">
          {/* Cart items */}
          <div className="ucart-card">
            <h2 className="ucart-section-title">
              Cart Items ({cartItems.length})
            </h2>

            {cartItems.map((item) => (
              <div key={item.id} className="ucart-item">
                <img
                  className="ucart-thumb"
                  src={
                    item.image ||
                    item.images?.[0] ||
                    "https://via.placeholder.com/70"
                  }
                  alt={item.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/70";
                  }}
                />
                <div className="ucart-info">
                  <div className="ucart-name">{item.name}</div>
                  {item.customizations && (
                    <div className="ucart-desc">
                      {[
                        item.customizations.size &&
                          `Size: ${item.customizations.size}`,
                        item.customizations.material &&
                          `Material: ${item.customizations.material}`,
                        item.customizations.finish &&
                          `Finish: ${item.customizations.finish}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  )}
                  <div className="ucart-price">{formatPeso(item.price)}</div>
                </div>
                <div className="ucart-controls">
                  <div className="ucart-qty">
                    <button
                      className="ucart-qty-btn"
                      type="button"
                      onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                    >
                      <FaMinus />
                    </button>
                    <input
                      className="ucart-qty-num"
                      type="number"
                      min="1"
                      value={editQtyMap[item.id] ?? item.qty}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditQtyMap((prev) => ({ ...prev, [item.id]: val }));
                      }}
                      onBlur={(e) => {
                        const num = parseInt(e.target.value, 10);
                        if (num >= 1) updateQty(item.id, num);
                        else
                          setEditQtyMap((prev) => ({
                            ...prev,
                            [item.id]: String(item.qty),
                          }));
                      }}
                    />
                    <button
                      className="ucart-qty-btn"
                      type="button"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <button
                    className="ucart-remove"
                    type="button"
                    onClick={() => removeItem(item.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="ucart-summary">
            <h2 className="ucart-section-title">Order Summary</h2>
            <div className="ucart-row">
              <span>Subtotal</span>
              <span>{formatPeso(subtotal)}</span>
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

        {/* Checkout modal */}
        {showCheckout && (
          <CheckoutModal
            userId={userId}
            cartItems={cartItems}
            total={total}
            subtotal={subtotal}
            onClose={() => setShowCheckout(false)}
            onSuccess={handleCheckoutComplete}
          />
        )}

        {/* Auth prompt modal */}
        {showCheckoutAuthModal && (
          <div className="ucart-auth-modal-overlay">
            <div className="ucart-auth-modal">
              <h2>Sign in to checkout</h2>
              <p>
                You need an account to place an order. Register or log in to
                continue.
              </p>
              <div className="ucart-auth-modal-actions">
                <button
                  className="ucart-auth-modal-cancel"
                  type="button"
                  onClick={() => setShowCheckoutAuthModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="ucart-auth-modal-primary"
                  type="button"
                  onClick={handleCheckoutAuthConfirm}
                >
                  Register / Login
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserCartPage;
