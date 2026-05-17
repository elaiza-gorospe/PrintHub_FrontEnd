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
                  {(() => {
                    const zoneImgs = Object.values(
                      item.customizations?.design?.zones || {},
                    )
                      .filter((z) => z?.imageUrl)
                      .map((z) => z.imageUrl);
                    const fallback =
                      item.customizations?.design?.generatedImageUrl ||
                      item.productImage ||
                      item.images?.[0] ||
                      item.product?.images?.[0] ||
                      item.customizations?.design?.sourceAssetUrls?.[0];
                    const imgs = zoneImgs.length
                      ? zoneImgs
                      : fallback
                        ? [fallback]
                        : [];
                    if (!imgs.length) return null;
                    if (imgs.length === 1) {
                      return (
                        <img
                          src={imgs[0]}
                          alt={item.title || "Design"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 10,
                          }}
                        />
                      );
                    }
                    return (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gridTemplateRows: "1fr 1fr",
                          width: "100%",
                          height: "100%",
                          borderRadius: 10,
                          overflow: "hidden",
                          gap: 1,
                        }}
                      >
                        {imgs.slice(0, 4).map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={`zone ${i + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ))}
                      </div>
                    );
                  })()}
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
                      onClick={() => {
                        const newQty = Math.max(1, item.qty - 1);
                        updateQty(item.id, newQty);
                        setEditQtyMap((m) => ({
                          ...m,
                          [item.id]: String(newQty),
                        }));
                      }}
                    >
                      <FaMinus />
                    </button>

                    <input
                      className="ucart-qty-num"
                      type="number"
                      min="1"
                      step="1"
                      value={editQtyMap[item.id] ?? String(item.qty)}
                      onChange={(e) => {
                        const v = e.target.value;
                        // allow empty string while typing
                        setEditQtyMap((m) => ({ ...m, [item.id]: v }));
                      }}
                      onBlur={() => {
                        const raw = editQtyMap[item.id];
                        const parsed = parseInt(String(raw), 10);
                        const final =
                          isNaN(parsed) || parsed < 1 ? 1 : Math.floor(parsed);
                        updateQty(item.id, final);
                        setEditQtyMap((m) => ({
                          ...m,
                          [item.id]: String(final),
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                        if (e.key === "Escape") {
                          // revert to current item.qty
                          setEditQtyMap((m) => ({
                            ...m,
                            [item.id]: String(item.qty),
                          }));
                        }
                      }}
                    />

                    <button
                      className="ucart-qty-btn"
                      type="button"
                      title="Increase"
                      onClick={() => {
                        const newQty = item.qty + 1;
                        updateQty(item.id, newQty);
                        setEditQtyMap((m) => ({
                          ...m,
                          [item.id]: String(newQty),
                        }));
                      }}
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
            subtotal={subtotal}
            onClose={() => setShowCheckout(false)}
            onSuccess={handleCheckoutComplete}
          />
        )}

        {showCheckoutAuthModal && (
          <div className="ucart-auth-modal-overlay" role="presentation">
            <div
              className="ucart-auth-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ucart-auth-modal-title"
            >
              <h2 id="ucart-auth-modal-title">Checkout requires an account</h2>
              <p>Log in or register to proceed to checkout.</p>

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
                  Register
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
