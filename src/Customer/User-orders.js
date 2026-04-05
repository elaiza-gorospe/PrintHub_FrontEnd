import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-orders.css";
import Header from "../components/Header";
import { FaArrowLeft } from "react-icons/fa";
import { buildApiUrl } from "../config/api";

function UserOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (!stored) {
          navigate("/user-login");
          return;
        }

        const user = JSON.parse(stored);
        if (!user?.id) {
          navigate("/user-login");
          return;
        }

        const res = await fetch(buildApiUrl(`/api/user/${user.id}/orders`));
        const data = await res.json();

        if (!res.ok) throw new Error(data?.message || "Failed to load orders");

        // Sort orders by date added in descending order (newest first)
        const sortedOrders = Array.isArray(data)
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        setOrders(sortedOrders);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatCurrency = (price) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ff9800";
      case "processing":
        return "#2196f3";
      case "shipped":
        return "#4caf50";
      case "delivered":
        return "#4caf50";
      case "cancelled":
        return "#f44336";
      default:
        return "#999";
    }
  };

  return (
    <>
      <Header />
      <div className="uo-page">
        <div className="uo-top">
          <button
            className="uo-back"
            type="button"
            onClick={() => navigate("/user-home")}
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="uo-title">My Orders</h1>
        </div>

        {loading && (
          <div className="uo-loading">
            <p>Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="uo-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="uo-empty">
            <p>No orders yet.</p>
            <button
              className="uo-shop-btn"
              type="button"
              onClick={() => navigate("/Product-overview")}
            >
              Start Shopping
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="uo-orders">
            {orders.map((order) => (
              <div key={order.id} className="uo-order-card">
                <div className="uo-order-header">
                  <div className="uo-order-info">
                    <h3>Order #{order.id}</h3>
                    <p className="uo-date">
                      {new Date(order.createdAt).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div
                    className="uo-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status?.charAt(0).toUpperCase() +
                      order.status?.slice(1)}
                  </div>
                </div>

                <div className="uo-items">
                  <h4>Items</h4>
                  {order.items && order.items.length > 0 ? (
                    <div className="uo-items-list">
                      {order.items.map((item) => (
                        <div key={item.id} className="uo-item-row">
                          <div className="uo-item-details">
                            <p className="uo-item-name">
                              Product ID: {item.productId}
                            </p>
                            <p className="uo-item-qty">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="uo-item-price">
                            {formatCurrency(item.unit_price)} x {item.quantity}{" "}
                            = {formatCurrency(item.total_price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="uo-no-items">No items in this order</p>
                  )}
                </div>

                {order.shipping_address && (
                  <div className="uo-shipping">
                    <h4>Shipping Address</h4>
                    <p>{order.shipping_address}</p>
                  </div>
                )}

                <div className="uo-order-footer">
                  <div className="uo-total">
                    <strong>Total:</strong>
                    <strong>{formatCurrency(order.total)}</strong>
                  </div>
                  {order.delivered_at && (
                    <p className="uo-delivered">
                      Delivered on{" "}
                      {new Date(order.delivered_at).toLocaleDateString("en-PH")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default UserOrders;
