import React, { useState } from "react";
import { FaTimes, FaSpinner, FaCheckCircle } from "react-icons/fa";
import "./CheckoutModal.css";

function CheckoutModal({
  userId,
  cartItems,
  total,
  shipping,
  subtotal,
  onClose,
  onSuccess,
}) {
  const [step, setStep] = useState("address"); // address | review | success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    shipping_address: "",
    billing_address: "",
    sameAddress: true,
  });

  const [orderData, setOrderData] = useState(null);

  const formatPeso = (n) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(n);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressNext = () => {
    const { shipping_address, billing_address, sameAddress } = formData;

    if (!shipping_address.trim()) {
      setError("Shipping address is required");
      return;
    }

    if (!sameAddress && !billing_address.trim()) {
      setError("Billing address is required");
      return;
    }

    setError("");
    setStep("review");
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");

    try {
      // Prepare order items from cart (include prices)
      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.qty,
        unitPrice: item.price, // Include the unit price for each item
      }));

      // Calculate order total: sum of all item prices (including qty) + shipping
      const orderSubtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
      );

      // Extract numeric shipping cost
      const shippingCost =
        typeof shipping === "number"
          ? shipping
          : parseFloat(String(shipping).replace(/[^\d.]/g, "")) || 0;

      const orderTotal = orderSubtotal + shippingCost;

      const payload = {
        userId,
        items,
        shippingCost,
        shipping_address: formData.shipping_address,
        billing_address: formData.sameAddress
          ? formData.shipping_address
          : formData.billing_address,
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      // Ensure the order total is correct
      if (data.order && data.order.total < orderTotal * 0.9) {
        console.warn(
          "Backend calculated total seems incorrect, using local calculation",
        );
        data.order.total = orderTotal;
      }

      setOrderData(data.order);
      setStep("success");

      // Callback to parent after 2 seconds
      setTimeout(() => {
        onSuccess(data.order);
      }, 2000);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal">
        {/* HEADER */}
        <div className="checkout-header">
          <h2>Checkout</h2>
          <button className="checkout-close" type="button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* STEP 1: ADDRESS */}
        {step === "address" && (
          <div className="checkout-content">
            <div className="checkout-progress">
              Step 1 of 3: Shipping Address
            </div>

            {error && <div className="checkout-error">{error}</div>}

            <div className="checkout-form">
              <label className="checkout-label">
                Shipping Address <span className="required">*</span>
              </label>
              <textarea
                name="shipping_address"
                className="checkout-textarea"
                placeholder="Enter your full shipping address (street, city, postal code)"
                rows="4"
                value={formData.shipping_address}
                onChange={handleInputChange}
              />

              <label className="checkout-checkbox">
                <input
                  type="checkbox"
                  name="sameAddress"
                  checked={formData.sameAddress}
                  onChange={handleInputChange}
                />
                <span>Billing address is the same as shipping</span>
              </label>

              {!formData.sameAddress && (
                <>
                  <label
                    className="checkout-label"
                    style={{ marginTop: "20px" }}
                  >
                    Billing Address <span className="required">*</span>
                  </label>
                  <textarea
                    name="billing_address"
                    className="checkout-textarea"
                    placeholder="Enter your billing address"
                    rows="4"
                    value={formData.billing_address}
                    onChange={handleInputChange}
                  />
                </>
              )}
            </div>

            <div className="checkout-actions">
              <button
                className="checkout-btn-cancel"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="checkout-btn-next"
                type="button"
                onClick={handleAddressNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW */}
        {step === "review" && (
          <div className="checkout-content">
            <div className="checkout-progress">Step 2 of 3: Review Order</div>

            {error && <div className="checkout-error">{error}</div>}

            <div className="checkout-review">
              <div className="review-section">
                <h3>Order Items</h3>
                {cartItems.map((item) => (
                  <div key={item.id} className="review-item">
                    <div className="review-item-name">
                      {item.title}{" "}
                      <span className="review-qty">x{item.qty}</span>
                    </div>
                    <div className="review-item-price">
                      {formatPeso(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="review-divider" />

              <div className="review-summary">
                <div className="review-row">
                  <span>Subtotal</span>
                  <span>{formatPeso(subtotal)}</span>
                </div>
                <div className="review-row">
                  <span>Shipping</span>
                  <span>{formatPeso(shipping)}</span>
                </div>
                <div className="review-total">
                  <span>Total Amount</span>
                  <span>{formatPeso(total)}</span>
                </div>
              </div>

              <div className="review-divider" />

              <div className="review-section">
                <h3>Shipping Address</h3>
                <p className="review-address">{formData.shipping_address}</p>
              </div>

              {!formData.sameAddress && (
                <div className="review-section">
                  <h3>Billing Address</h3>
                  <p className="review-address">{formData.billing_address}</p>
                </div>
              )}
            </div>

            <div className="checkout-actions">
              <button
                className="checkout-btn-cancel"
                type="button"
                onClick={() => setStep("address")}
                disabled={loading}
              >
                Back
              </button>
              <button
                className="checkout-btn-place"
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" /> Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === "success" && (
          <div className="checkout-content checkout-success">
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            <h2 className="success-title">Order Placed Successfully!</h2>
            <p className="success-message">
              Order ID: <strong>#{orderData?.id}</strong>
            </p>
            <p className="success-amount">
              Total: <strong>{formatPeso(orderData?.total)}</strong>
            </p>
            <p className="success-note">
              You will be redirected to your dashboard shortly...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutModal;
