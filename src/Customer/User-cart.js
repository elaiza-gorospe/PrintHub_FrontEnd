import React from "react";
import { useNavigate } from "react-router-dom";
import "./User-cart.css";
import { FaArrowLeft, FaTrash, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";

function UserCartPage() {
  const navigate = useNavigate();

  // ✅ STATIC DATA (dummy cart items)
  const cartItems = [
    {
      id: 1,
      title: "Business Cards",
      desc: "Premium matte finish, 100pcs",
      price: 250,
      qty: 2,
    },
    {
      id: 2,
      title: "Stickers & Labels",
      desc: "Waterproof vinyl, 50pcs",
      price: 180,
      qty: 1,
    },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = 50; // static
  const total = subtotal + shipping;

  const formatPeso = (n) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);

  return (
    <div className="ucart-page">
      {/* TOP BAR */}
      <div className="ucart-topbar">
        <button className="ucart-back" type="button" onClick={() => navigate(-1)}>
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
          <h2 className="ucart-section-title">Items</h2>

          {cartItems.map((item) => (
            <div key={item.id} className="ucart-item">
              <div className="ucart-thumb" />

              <div className="ucart-info">
                <div className="ucart-name">{item.title}</div>
                <div className="ucart-desc">{item.desc}</div>
                <div className="ucart-price">{formatPeso(item.price)}</div>
              </div>

              <div className="ucart-controls">
                {/* STATIC buttons (no logic yet) */}
                <div className="ucart-qty">
                  <button className="ucart-qty-btn" type="button" title="Decrease">
                    <FaMinus />
                  </button>
                  <span className="ucart-qty-num">{item.qty}</span>
                  <button className="ucart-qty-btn" type="button" title="Increase">
                    <FaPlus />
                  </button>
                </div>

                <button className="ucart-remove" type="button" title="Remove item">
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
            onClick={() => alert("Checkout page later (static demo)")}
          >
            Proceed to Checkout
          </button>

          <button className="ucart-continue" type="button" onClick={() => navigate("/Product-overview")}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserCartPage;
