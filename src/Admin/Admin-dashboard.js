// Admin-dashboard.js (FULL UPDATED FILE — adds Logout confirmation modal ONLY, no other UI/layout changes)
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin-dashboard.css";
import AdminProfile from "./Admin-profile";
import AdminManageAccounts from "./Admin-manageacc";
import AdminOrders from "./AdminOrders";
import AdminInquiries from "./AdminInquiries";
import AdminProducts from "./AdminProducts";
import { buildApiUrl } from "../config/api";
import { CATEGORY_DEFAULTS, CATEGORY_NAMES } from "../config/categoryDefaults";

// ✅ Icons (only keep unused, but needed)
import {
  FaMoneyBillWave,
  FaUserPlus,
  FaShoppingBag,
  FaChartLine,
  FaCog,
  FaPlus,
  FaCheckCircle,
} from "react-icons/fa";

function AdminDashboard() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  // ✅ Mobile sidebar drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [settingsTab, setSettingsTab] = useState("general");

  // ✅ NEW: Logout confirm modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ✅ NEW: Add Product modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [refreshProductsKey, setRefreshProductsKey] = useState(0);
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    print_type: "offset",
    material: "",
    description: "",
    ai_prompt_rules: "",
    images: [],
    color_options: [],
    size_options: [],
    material_options: [],
    side_options: [],
    finishing_options: [],
    processing_options: [],
    delivery_options: [],
    quantity_options: [],
    shipping_options: [],
  });
  const [addTagInputs, setAddTagInputs] = useState({
    color_options: "",
    size_options: "",
    material_options: "",
    side_options: "",
    finishing_options: "",
    processing_options: "",
    delivery_options: "",
    quantity_options: "",
    shipping_options: "",
  });
  const [addImageUploading, setAddImageUploading] = useState(false);
  const [addImageError, setAddImageError] = useState("");

  // ✅ NEW: Dashboard stats from API
  const [dashStats, setDashStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  // Low stock state
  const [lowStock, setLowStock] = useState({ products: [], pagination: {} });
  const [lowStockLoading, setLowStockLoading] = useState(true);
  const [lowStockFilter, setLowStockFilter] = useState(null);

  // ✅ close mobile sidebar if resized to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setIsMobileSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Fetch low-stock products for dashboard
  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        setLowStockLoading(true);
        const threshold = 10; // default threshold
        const limit = 5; // show top 5 on dashboard
        const res = await fetch(
          buildApiUrl(
            `/api/admin/low-stock?threshold=${threshold}&limit=${limit}`,
          ),
        );
        if (!res.ok) throw new Error("Failed to fetch low-stock");
        const data = await res.json();
        setLowStock({
          products: data.products || [],
          pagination: data.pagination || {},
        });
      } catch (err) {
        console.error("Error fetching low-stock:", err);
      } finally {
        setLowStockLoading(false);
      }
    };

    fetchLowStock();
    const lsInterval = setInterval(fetchLowStock, 30000);
    return () => clearInterval(lsInterval);
  }, []);

  // ✅ NEW: Fetch dashboard stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const [ordersRes, usersRes] = await Promise.all([
          fetch(buildApiUrl("/api/admin/orders")),
          fetch(buildApiUrl("/api/admin/users")),
        ]);

        const ordersData = await ordersRes.json();
        const usersData = await usersRes.json();

        // Calculate stats
        const totalOrders = ordersData.length;
        const pendingOrders = ordersData.filter(
          (o) => o.status === "pending",
        ).length;
        const totalRevenue = ordersData.reduce(
          (sum, o) => sum + parseFloat(o.total || 0),
          0,
        );
        const totalUsers = Array.isArray(usersData)
          ? usersData.length
          : (usersData?.users?.length ?? 0);

        setDashStats({
          totalRevenue,
          totalOrders,
          pendingOrders,
          totalUsers,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const storedUser = useMemo(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("adminUser")) ||
        null
      );
    } catch {
      return null;
    }
  }, []);

  const [sidebarUser, setSidebarUser] = useState(storedUser);
  const [sidebarAvatarUploading, setSidebarAvatarUploading] = useState(false);
  const [sidebarAvatarError, setSidebarAvatarError] = useState("");

  // ✅ Listen for profile updates from Admin-profile.js
  useEffect(() => {
    const handleProfileUpdate = () => {
      const updatedUser =
        JSON.parse(localStorage.getItem("adminUser")) ||
        JSON.parse(localStorage.getItem("user"));
      if (updatedUser) {
        setSidebarUser(updatedUser);
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  const role = sidebarUser?.role || "user";

  // ✅ ROLE-BASED ACCESS CONTROL: Only admins can access admin pages
  useEffect(() => {
    if (!sidebarUser || role !== "admin") {
      // Redirect non-admin users to home page
      navigate("/");
      return;
    }
  }, [sidebarUser, role, navigate]);

  const menuItems = useMemo(() => {
    const base = [
      {
        id: "dashboard",
        label: "Dashboard",
      },
      { id: "orders", label: "Orders" },
      { id: "inquiries", label: "Inquiries" },
      { id: "products", label: "Products" },
      { id: "customers", label: "Manage Accounts" },
      { id: "settings", label: "Settings" },
      {
        id: "profile",
        label: "Profile",
      },
    ];

    // Staff: remove Manage Accounts
    if (role === "staff") {
      return base.filter((i) => i.id !== "customers");
    }

    return base;
  }, [role]);

  const handleMenuItemClick = (item) => {
    // Extra safety: staff can't open Manage Accounts even if forced
    if (role === "staff" && item.id === "customers") return;

    setActiveItem(item.id);
    setIsMobileSidebarOpen(false);
  };

  // ✅ unchanged logout logic moved here (same behavior)
  const doLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    sessionStorage.clear();

    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setIsMobileSidebarOpen(false);
    setShowLogoutModal(false);
    setTimeout(() => navigate("/"), 100);
    alert("You have been logged out successfully!");
  };

  // ✅ NEW: open confirm modal instead of immediate logout
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // ✅ NEW: Open add product modal
  const handleAddProduct = () => {
    setProductForm({
      name: "",
      sku: "",
      price: "",
      stock: "",
      print_type: "offset",
      material: "",
      description: "",
      ai_prompt_rules: "",
      images: [],
      color_options: [],
      size_options: [],
      material_options: [],
      side_options: [],
      finishing_options: [],
      processing_options: [],
      delivery_options: [],
      quantity_options: [],
      shipping_options: [],
    });
    setAddTagInputs({
      color_options: "",
      size_options: "",
      material_options: "",
      side_options: "",
      finishing_options: "",
      processing_options: "",
      delivery_options: "",
      quantity_options: "",
      shipping_options: "",
    });
    setAddImageError("");
    setShowAddProductModal(true);
  };

  // Apply category template to productForm
  const applyAddTemplate = (categoryName) => {
    if (!categoryName) return;
    const defaults = CATEGORY_DEFAULTS[categoryName];
    if (!defaults) return;
    setProductForm((prev) => ({
      ...prev,
      print_type: defaults.print_type || prev.print_type,
      material: defaults.material || prev.material,
      ai_prompt_rules: defaults.ai_prompt_rules || prev.ai_prompt_rules,
      color_options: [...(defaults.color_options || [])],
      size_options: [...(defaults.size_options || [])],
      material_options: [...(defaults.material_options || [])],
      side_options: [...(defaults.side_options || [])],
      finishing_options: [...(defaults.finishing_options || [])],
      processing_options: [...(defaults.processing_options || [])],
      delivery_options: [...(defaults.delivery_options || [])],
      quantity_options: [...(defaults.quantity_options || [])],
      shipping_options: [...(defaults.shipping_options || [])],
    }));
  };

  // Tag helpers for Add Product modal
  const addAddTag = (field) => {
    const val = addTagInputs[field].trim();
    if (!val || productForm[field].includes(val)) return;
    setProductForm((prev) => ({ ...prev, [field]: [...prev[field], val] }));
    setAddTagInputs((prev) => ({ ...prev, [field]: "" }));
  };

  const removeAddTag = (field, index) => {
    setProductForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Upload image for Add Product modal
  const handleAddImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setAddImageError("Image must be 3MB or smaller.");
      e.target.value = "";
      return;
    }
    setAddImageError("");
    setAddImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(buildApiUrl("/api/products/upload"), {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images, data.url],
      }));
    } catch (err) {
      setAddImageError(err.message || "Upload failed");
    } finally {
      setAddImageUploading(false);
      e.target.value = "";
    }
  };

  // ✅ NEW: Submit add product form
  const submitAddProduct = async (e) => {
    e.preventDefault();

    if (!productForm.name.trim()) return alert("Product name is required");
    if (!productForm.sku.trim()) return alert("SKU is required");
    if (!productForm.price || productForm.price <= 0)
      return alert("Price must be greater than 0");

    try {
      const res = await fetch(buildApiUrl("/api/products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productForm.name,
          sku: productForm.sku,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock) || 0,
          print_type: productForm.print_type,
          material: productForm.material,
          description: productForm.description,
          ai_prompt_rules: productForm.ai_prompt_rules,
          images: productForm.images,
          color_options: productForm.color_options,
          size_options: productForm.size_options,
          material_options: productForm.material_options,
          side_options: productForm.side_options,
          finishing_options: productForm.finishing_options,
          processing_options: productForm.processing_options,
          delivery_options: productForm.delivery_options,
          quantity_options: productForm.quantity_options,
          shipping_options: productForm.shipping_options,
          active: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to add product");

      setShowAddProductModal(false);
      alert("Product added successfully!");
      // ✅ Ensure we stay on/go to products view to see the new product
      setActiveItem("products");
      // ✅ Trigger refresh of products list
      setRefreshProductsKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert(err.message || "Error adding product");
    }
  };

  // If staff somehow lands on customers, kick back to dashboard
  if (role === "staff" && activeItem === "customers") {
    setActiveItem("dashboard");
  }

  const pageTitle = useMemo(() => {
    if (activeItem === "dashboard") return "Dashboard";
    if (activeItem === "profile") return "Profile";
    if (activeItem === "customers") return "Manage Accounts";
    if (activeItem === "orders") return "Orders";
    if (activeItem === "inquiries") return "Inquiries";
    if (activeItem === "products") return "Products";
    if (activeItem === "settings") return "Settings";
    return "Dashboard";
  }, [activeItem]);

  return (
    <div className="admin-dashboard">
      {/* ✅ Mobile overlay when sidebar open */}
      {isMobileSidebarOpen && (
        <button
          className="mobile-overlay"
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ✅ NEW: Logout confirmation modal */}
      {showLogoutModal && (
        <div
          className="ad-logout-overlay"
          onMouseDown={() => setShowLogoutModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="ad-logout-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3 className="ad-logout-title">Log out?</h3>
            <p className="ad-logout-text">Are you sure you want to logout?</p>

            <div className="ad-logout-actions">
              <button
                type="button"
                className="ad-logout-btn ghost"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="ad-logout-btn danger"
                onClick={doLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Add Product modal */}
      {showAddProductModal && (
        <div
          className="ad-logout-overlay"
          onMouseDown={() => setShowAddProductModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="ad-logout-modal"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ maxHeight: "90vh", overflowY: "auto", maxWidth: "500px" }}
          >
            <h3 className="ad-logout-title">Add New Product</h3>
            <p
              style={{
                color: "#7f8c8d",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              Fill in the product details below
            </p>

            <form onSubmit={submitAddProduct}>
              {/* Category Template */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Category Template{" "}
                  <span style={{ color: "#9ca3af", fontWeight: "400" }}>
                    (auto-fills options)
                  </span>
                </label>
                <select
                  defaultValue=""
                  onChange={(e) => applyAddTemplate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">— Select a template —</option>
                  {CATEGORY_NAMES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    placeholder="e.g., Business Cards"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) =>
                      setProductForm({ ...productForm, sku: e.target.value })
                    }
                    placeholder="e.g., BC-001"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Price (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    placeholder="0.00"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Stock
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: e.target.value })
                    }
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Print Type
                  </label>
                  <select
                    value={productForm.print_type}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        print_type: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="offset">Offset Print</option>
                    <option value="digital">Digital Print</option>
                    <option value="service">Service</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Material
                  </label>
                  <input
                    type="text"
                    value={productForm.material}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        material: e.target.value,
                      })
                    }
                    placeholder="e.g., Matte Paper"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Product description..."
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "Arial, sans-serif",
                  }}
                />
              </div>

              {/* AI Prompt Rules */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  AI Prompt Rules{" "}
                  <span style={{ color: "#9ca3af", fontWeight: "400" }}>
                    (instructions the AI must follow strictly)
                  </span>
                </label>
                <textarea
                  value={productForm.ai_prompt_rules}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      ai_prompt_rules: e.target.value,
                    })
                  }
                  placeholder="e.g., Always use 300dpi. Bleed must be 0.125in. No clipart..."
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontFamily: "Arial, sans-serif",
                    background: "#f9fafb",
                  }}
                />
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Product Image{" "}
                  <span style={{ color: "#9ca3af", fontWeight: "400" }}>
                    (max 3MB)
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAddImageUpload}
                  disabled={addImageUploading}
                  style={{ fontSize: "13px" }}
                />
                {addImageUploading && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "4px",
                    }}
                  >
                    Uploading...
                  </p>
                )}
                {addImageError && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#e74c3c",
                      marginTop: "4px",
                    }}
                  >
                    {addImageError}
                  </p>
                )}
                {productForm.images.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "8px",
                    }}
                  >
                    {productForm.images.map((url, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img
                          src={url}
                          alt={`upload-${i}`}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            border: "1px solid #d1d5db",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setProductForm((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, idx) => idx !== i),
                            }))
                          }
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            background: "#e74c3c",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "16px",
                            height: "16px",
                            fontSize: "10px",
                            cursor: "pointer",
                            lineHeight: 1,
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr
                style={{
                  margin: "4px 0 12px",
                  border: "none",
                  borderTop: "1px solid #e5e7eb",
                }}
              />
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "12px",
                }}
              >
                Quote form options — define selectable choices for each field
              </p>

              {[
                { field: "color_options", label: "Color Options" },
                { field: "size_options", label: "Size Options" },
                { field: "material_options", label: "Material Options" },
                { field: "side_options", label: "Printing (Sides) Options" },
                { field: "finishing_options", label: "Finishing Options" },
                { field: "processing_options", label: "Processing Options" },
                { field: "delivery_options", label: "Delivery Options" },
                {
                  field: "quantity_options",
                  label: "Quantity Options",
                  hint: "format: label|price (e.g. 100 pcs|₱1,270.50)",
                },
                {
                  field: "shipping_options",
                  label: "Shipping Options",
                  hint: "format: label|price (e.g. Standard|Free)",
                },
              ].map(({ field, label, hint }) => (
                <div key={field} style={{ marginBottom: "12px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {label}
                    {hint && (
                      <span
                        style={{
                          color: "#9ca3af",
                          fontWeight: "400",
                          fontSize: "11px",
                        }}
                      >
                        {" "}
                        — {hint}
                      </span>
                    )}
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "6px",
                      minHeight: "28px",
                    }}
                  >
                    {productForm[field].map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          background: "#e8f0fe",
                          border: "1px solid #b3c6f7",
                          borderRadius: "4px",
                          padding: "2px 8px",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeAddTag(field, i)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#666",
                            fontSize: "14px",
                            lineHeight: 1,
                            padding: "0 2px",
                          }}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      value={addTagInputs[field]}
                      onChange={(e) =>
                        setAddTagInputs((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAddTag(field);
                        }
                      }}
                      placeholder={`Add ${label.toLowerCase()} option...`}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "13px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addAddTag(field)}
                      style={{
                        padding: "6px 12px",
                        background: "#1b3f6e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}

              <div className="ad-logout-actions">
                <button
                  type="button"
                  className="ad-logout-btn ghost"
                  onClick={() => setShowAddProductModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ad-logout-btn"
                  style={{
                    background: "#1b3f6e",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          isMobileSidebarOpen ? "mobile-open" : ""
        }`}
      >
        <div className="sidebar-header">
          {!isCollapsed && <h2 className="sidebar-title">Admin Panel</h2>}
          <button
            type="button"
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>

        {!isCollapsed && (
          <div className="user-info">
            <div className="user-avatar">
              <div className="avatar-circle">
              {sidebarUser?.avatar_url ? (
                <img
                  src={sidebarUser.avatar_url}
                  alt="avatar"
                />
              ) : (
                <div>AD</div>
              )}
            </div>
            </div>
            <div className="user-details">
              <h4 className="user-name">
                {sidebarUser?.firstName || "Admin User"}
              </h4>
              <p className="user-role">
                {role === "admin"
                  ? "Administrator"
                  : role === "staff"
                    ? "Staff"
                    : "Customer"}
              </p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="user-collapsed">
            <div className="avatar-small">
            {sidebarUser?.avatar_url ? (
              <img
                src={sidebarUser.avatar_url}
                alt="avatar"
              />
            ) : (
              <div>A</div>
            )}
          </div>
          </div>
        )}

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`menu-item ${activeItem === item.id ? "active" : ""}`}
              onClick={() => handleMenuItemClick(item)}
            >
              {!isCollapsed && <span className="menu-label">{item.label}</span>}
              {isCollapsed && (
                <span className="menu-label-collapsed">
                  {item.label.charAt(0)}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button type="button" className="logout-btn" onClick={handleLogout}>
            {!isCollapsed && "Logout"}
          </button>
        </div>
      </div>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-left">
            {/* ✅ Mobile hamburger + title row */}
            <div className="mobile-header-row">
              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open menu"
              >
                ☰
              </button>

              <div className="page-title-wrap">
                <h1 className="page-title">{pageTitle}</h1>
                <p className="subtitle">
                  Welcome back
                  {sidebarUser?.firstName ? `, ${sidebarUser.firstName}` : ""}!
                </p>
              </div>
            </div>
          </div>

          {/* ✅ top button ONLY (this is the one you want to keep) */}
          {/* <div className="header-actions">
            {activeItem === "products" && (
              <button
                className="header-pill"
                type="button"
                onClick={handleAddProduct}
              >
                <FaPlus /> New Product
              </button>
            )}
          </div> */}
        </header>

        <div className="content-wrapper">
          {/* ✅ DASHBOARD (UNCHANGED) */}
          {activeItem === "dashboard" && (
            <>
              <div className="dash-hero">
                <div className="dash-hero-left">
                  <div className="dash-kicker">Overview</div>
                  <h2 className="dash-title">Your store at a glance</h2>
                  <p className="dash-desc">
                    Track performance and manage operations faster.
                  </p>
                </div>

                <div className="dash-hero-right">
                  <button
                    className="dash-quick-btn"
                    type="button"
                    onClick={() => setActiveItem("customers")}
                  >
                    Manage Accounts
                  </button>

                  <button
                    className="dash-quick-btn ghost"
                    type="button"
                    onClick={() => setActiveItem("orders")}
                  >
                    View Orders
                  </button>
                </div>
              </div>

              <div className="content-grid">
                <div className="stats-card revenue">
                  <div className="stat-top">
                    <div>
                      <h3>Total Revenue</h3>
                      <p className="stat-number">
                        ₱{" "}
                        {dashStats.totalRevenue.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    <div className="stat-icon">
                      <FaMoneyBillWave />
                    </div>
                  </div>
                  <div className="stat-foot">From all orders</div>
                </div>

                <div className="stats-card users">
                  <div className="stat-top">
                    <div>
                      <h3>Total Users</h3>
                      <p className="stat-number">
                        {(dashStats.totalUsers ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="stat-icon">
                      <FaUserPlus />
                    </div>
                  </div>
                  <div className="stat-foot">Registered customers</div>
                </div>

                <div className="stats-card orders">
                  <div className="stat-top">
                    <div>
                      <h3>Orders</h3>
                      <p className="stat-number">{dashStats.totalOrders}</p>
                    </div>
                    <div className="stat-icon">
                      <FaShoppingBag />
                    </div>
                  </div>
                  <div className="stat-foot">
                    Pending: {dashStats.pendingOrders}
                  </div>
                </div>

                <div className="stats-card conversion">
                  <div className="stat-top">
                    <div>
                      <h3>Status</h3>
                      <p className="stat-number">
                        {statsLoading ? "Loading..." : "Ready"}
                      </p>
                    </div>
                    <div className="stat-icon">
                      <FaCheckCircle />
                    </div>
                  </div>
                  <div className="stat-foot">System operational</div>
                </div>
              </div>

              <div className="data-table-card" style={{ marginTop: 12 }}>
                <div className="data-table-head">
                  <h3>Low Stock</h3>
                  <div>
                    <button
                      type="button"
                      className="row-btn"
                      onClick={() => {
                        setLowStockFilter({
                          filter: "low_stock",
                          threshold: 10,
                        });
                        setActiveItem("products");
                      }}
                    >
                      View all
                    </button>
                  </div>
                </div>

                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>SKU</th>
                        <th className="right">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockLoading ? (
                        <tr>
                          <td className="empty-row" colSpan={3}>
                            Loading...
                          </td>
                        </tr>
                      ) : lowStock.products.length === 0 ? (
                        <tr>
                          <td className="empty-row" colSpan={3}>
                            No low-stock items
                          </td>
                        </tr>
                      ) : (
                        lowStock.products.map((p) => (
                          <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.sku}</td>
                            <td className="left">{p.stock}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeItem === "profile" && <AdminProfile />}
          {activeItem === "customers" && role !== "staff" && (
            <AdminManageAccounts />
          )}

          {/* ✅ ORDERS - Dynamic component */}
          {activeItem === "orders" && <AdminOrders />}

          {/* ✅ INQUIRIES - Dynamic component */}
          {activeItem === "inquiries" && <AdminInquiries />}

          {/* ✅ PRODUCTS - Dynamic component */}
          {activeItem === "products" && (
            <AdminProducts
              refreshTrigger={refreshProductsKey}
              onAddProduct={handleAddProduct}
              lowStockFilter={lowStockFilter}
            />
          )}

          {/* ✅ SETTINGS (unchanged) */}
          {activeItem === "settings" && (
            <div className="page-shell">
              <div className="section-hero settings-hero">
                <div className="section-hero-left">
                  <div className="section-kicker">
                    <FaCog /> Admin Settings
                  </div>
                  <h2 className="section-title">Customize your workspace</h2>
                  <p className="section-desc">
                    Manage security, store settings, and preferences in one
                    place.
                  </p>
                </div>

                <div className="section-hero-right">
                  <button
                    className="primary-action"
                    type="button"
                    onClick={() => alert("Saved (demo)")}
                  >
                    <FaCheckCircle /> Save Changes
                  </button>
                  <button
                    className="secondary-action"
                    type="button"
                    onClick={() => alert("Reset (demo)")}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-nav">
                  <button
                    className={`settings-tab ${settingsTab === "general" ? "active" : ""}`}
                    type="button"
                    onClick={() => setSettingsTab("general")}
                  >
                    General
                  </button>
                  <button
                    className={`settings-tab ${settingsTab === "security" ? "active" : ""}`}
                    type="button"
                    onClick={() => setSettingsTab("security")}
                  >
                    Security
                  </button>
                  <button
                    className={`settings-tab ${settingsTab === "store" ? "active" : ""}`}
                    type="button"
                    onClick={() => setSettingsTab("store")}
                  >
                    Store
                  </button>
                  <button
                    className={`settings-tab ${settingsTab === "notifications" ? "active" : ""}`}
                    type="button"
                    onClick={() => setSettingsTab("notifications")}
                  >
                    Notifications
                  </button>
                </div>

                <div className="settings-card">
                  {settingsTab === "general" && (
                    <>
                      <div className="settings-head">
                        <h3>General</h3>
                        <p className="muted">
                          Basic preferences for the admin panel.
                        </p>
                      </div>

                      <div className="form-grid">
                        <div className="field">
                          <label>Panel Name</label>
                          <input defaultValue="Admin Panel" />
                        </div>
                        <div className="field">
                          <label>Timezone</label>
                          <select defaultValue="Asia/Manila">
                            <option>Asia/Manila</option>
                            <option>Asia/Singapore</option>
                            <option>UTC</option>
                          </select>
                        </div>
                        <div className="field full">
                          <label>Support Email</label>
                          <input defaultValue="support@printhub.com" />
                        </div>
                      </div>
                    </>
                  )}

                  {settingsTab === "security" && (
                    <>
                      <div className="settings-head">
                        <h3>Security</h3>
                        <p className="muted">Protect accounts and access.</p>
                      </div>

                      <div className="form-grid">
                        <div className="field full">
                          <label>2FA</label>
                          <div className="toggle-row">
                            <span className="muted">
                              Require two-factor authentication for admins
                            </span>
                            <label className="switch">
                              <input type="checkbox" defaultChecked />
                              <span className="slider" />
                            </label>
                          </div>
                        </div>

                        <div className="field">
                          <label>Password Policy</label>
                          <select defaultValue="strong">
                            <option value="basic">Basic</option>
                            <option value="strong">Strong</option>
                            <option value="strict">Strict</option>
                          </select>
                        </div>

                        <div className="field">
                          <label>Session Timeout</label>
                          <select defaultValue="30">
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsTab === "store" && (
                    <>
                      <div className="settings-head">
                        <h3>Store</h3>
                        <p className="muted">
                          Manage store behavior and checkout rules.
                        </p>
                      </div>

                      <div className="form-grid">
                        <div className="field full">
                          <label>Store Status</label>
                          <select defaultValue="open">
                            <option value="open">Open</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>

                        <div className="field">
                          <label>Minimum Order</label>
                          <input defaultValue="100" />
                        </div>

                        <div className="field">
                          <label>Currency</label>
                          <select defaultValue="PHP">
                            <option>PHP</option>
                            <option>USD</option>
                            <option>SGD</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsTab === "notifications" && (
                    <>
                      <div className="settings-head">
                        <h3>Notifications</h3>
                        <p className="muted">
                          Control alerts and email notifications.
                        </p>
                      </div>

                      <div className="settings-list">
                        <div className="settings-item">
                          <div>
                            <div className="strong">New orders</div>
                            <div className="muted">
                              Notify when a new order is placed
                            </div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider" />
                          </label>
                        </div>

                        <div className="settings-item">
                          <div>
                            <div className="strong">Low stock</div>
                            <div className="muted">
                              Alert when inventory is low
                            </div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider" />
                          </label>
                        </div>

                        <div className="settings-item">
                          <div>
                            <div className="strong">Weekly summary</div>
                            <div className="muted">
                              Send a weekly performance report
                            </div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" />
                            <span className="slider" />
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
