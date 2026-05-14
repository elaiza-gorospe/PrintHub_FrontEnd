import React, { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
} from "react-icons/fa";
import "./Admin-dashboard.css";
import { buildApiUrl } from "../config/api";
import { CATEGORY_DEFAULTS, CATEGORY_NAMES } from "../config/categoryDefaults";

const CATEGORY_ZONES = {
  tshirt: ["front", "back", "left_sleeve", "right_sleeve"],
  jersery: ["front", "back"],
  cap: ["front", "back", "left_sleeve", "right_sleeve"],
  notebook: ["front_cover", "back_cover"],
  calling_card: ["front", "back"],
  mug: ["front"],
  banners: [],
  stickers: [],
  hang_tags: [],
  brochures: [],
  other: [],
};

function AdminProducts({
  refreshTrigger = 0,
  onAddProduct = null,
  lowStockFilter = null,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsQuery, setProductsQuery] = useState("");
  const [productsCategory, setProductsCategory] = useState("all");
  const [localRefreshKey, setLocalRefreshKey] = useState(0); // ✅ Local refresh trigger
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ✅ NEW: Edit product states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    print_type: "offset",
    material: "",
    description: "",
    ai_prompt_rules: "",
    status: "active",
    images: [],
    quantity_mode: "dropdown",
    quantity_count: "",
    color_options: [],
    size_options: [],
    material_options: [],
    finishing_options: [],
    processing_options: [],
    delivery_options: [],
    quantity_options: [],
    shipping_options: [],
    print_zones: [],
    category: "other",
  });
  const [tagInputs, setTagInputs] = useState({
    color_options: "",
    size_options: "",
    material_options: "",
    finishing_options: "",
    processing_options: "",
    delivery_options: "",
    quantity_options: "",
    shipping_options: "",
  });
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [editImageError, setEditImageError] = useState("");
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [addStockProduct, setAddStockProduct] = useState(null);
  const [addStockAmount, setAddStockAmount] = useState(0);
  const [addStockOptionsText, setAddStockOptionsText] = useState("");

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // If lowStockFilter prop is provided, use admin low-stock endpoint
        const useLowStock =
          lowStockFilter && lowStockFilter.filter === "low_stock";
        const threshold = (lowStockFilter && lowStockFilter.threshold) || 10;
        const url = useLowStock
          ? buildApiUrl(`/api/admin/low-stock?threshold=${threshold}&limit=100`)
          : buildApiUrl("/api/products?limit=100");

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        // Transform API data to match UI format
        const apiProducts = data.products || data;
        const transformedProducts = (apiProducts || []).map((product) => ({
          sku: product.sku || `PRD-${product.id}`,
          name: product.name,
          category:
            product.print_type === "offset" || product.print_type === "digital"
              ? "print"
              : "service",
          price: parseFloat(product.price),
          stock: product.stock !== undefined && product.stock !== null ? product.stock : 0,
          status: product.active ? "active" : "inactive",
          dbId: product.id,
          material: product.material,
          description: product.description,
          images: product.images || [],
          updatedAt:
            product.updatedAt || product.createdAt || new Date().toISOString(),
        }));

        // ✅ Sort by recently updated (descending)
        transformedProducts.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        );

        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    // Refresh products every 30 seconds
    const interval = setInterval(fetchProducts, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger, localRefreshKey, lowStockFilter]);

  // Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    const q = productsQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchQuery =
        !q ||
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        String(p.price).includes(q);

      const matchCategory =
        productsCategory === "all" ? true : p.category === productsCategory;

      return matchQuery && matchCategory;
    });
  }, [products, productsQuery, productsCategory]);

  // Calculate stats from products
  const productsStats = useMemo(() => {
    const active = products.filter((p) => p.status === "active").length;
    const out = products.filter((p) => p.stock === 0).length;
    const services = products.filter((p) => p.category === "service").length;
    const prints = products.filter((p) => p.category === "print").length;
    return { active, out, services, prints, total: products.length };
  }, [products]);

  const handleClearFilters = () => {
    setProductsQuery("");
    setProductsCategory("all");
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = (checked) => {
    if (checked) {
      setSelectedIds(new Set(filteredProducts.map((p) => p.dbId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const bulkSetDropdown = async () => {
    if (selectedIds.size === 0) return alert("No products selected");
    if (!window.confirm(`Set ${selectedIds.size} product(s) to dropdown mode?`))
      return;
    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(buildApiUrl(`/api/products/${id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity_mode: "dropdown" }),
        }),
      );

      const results = await Promise.all(promises);
      const failed = [];
      for (let i = 0; i < results.length; i++) {
        if (!results[i].ok) failed.push(Array.from(selectedIds)[i]);
      }

      if (failed.length > 0) {
        alert(`Failed to update ${failed.length} product(s).`);
      } else {
        alert("Updated selected products to dropdown mode.");
      }

      setSelectedIds(new Set());
      setLocalRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      alert("Bulk update failed");
    }
  };

  // ✅ NEW: Open edit modal with selected product
  const handleEditProduct = async (product) => {
    setSelectedProduct(product);
    // Fetch full product to get option arrays
    let fullProduct = {};
    try {
      const res = await fetch(buildApiUrl(`/api/products/${product.dbId}`));
      if (res.ok) fullProduct = await res.json();
    } catch (err) {
      console.error("Failed to fetch full product:", err);
    }
    setEditForm({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      stock: product.stock.toString(),
      print_type:
        product.category === "service"
          ? "service"
          : product.category === "print"
            ? "offset"
            : "offset",
      material: product.material || "",
      description: product.description || "",
      ai_prompt_rules: fullProduct.ai_prompt_rules || "",
      status: product.status,
      images: fullProduct.images || [],
      color_options: fullProduct.color_options || [],
      size_options: fullProduct.size_options || [],
      material_options: fullProduct.material_options || [],
      finishing_options: fullProduct.finishing_options || [],
      processing_options: fullProduct.processing_options || [],
      delivery_options: fullProduct.delivery_options || [],
      quantity_options: fullProduct.quantity_options || [],
      quantity_mode: fullProduct.quantity_mode || "dropdown",
      quantity_count:
        fullProduct.quantity_count !== undefined &&
          fullProduct.quantity_count !== null
          ? String(fullProduct.quantity_count)
          : "",
      shipping_options: fullProduct.shipping_options || [],
      print_zones: fullProduct.print_zones || [],
      category: fullProduct.category || "other",
    });
    setTagInputs({
      color_options: "",
      size_options: "",
      material_options: "",
      finishing_options: "",
      processing_options: "",
      delivery_options: "",
      quantity_options: "",
      shipping_options: "",
    });
    setEditImageError("");
    setShowEditModal(true);
  };

  // ✅ NEW: Toggle product status (active/inactive)
  const handleToggleStatus = async (product) => {
    try {
      const newStatus = product.status === "active" ? false : true;
      const res = await fetch(buildApiUrl(`/api/products/${product.dbId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      alert("Product status updated!");
      // ✅ Trigger local refresh instead of reloading
      setLocalRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Error toggling status:", err);
      alert(err.message || "Error updating status");
    }
  };

  // ✅ NEW: Submit edit product form
  const submitEditProduct = async (e) => {
    e.preventDefault();

    if (!editForm.name.trim()) return alert("Product name is required");
    if (!editForm.sku.trim()) return alert("SKU is required");
    if (!editForm.price || editForm.price <= 0)
      return alert("Price must be greater than 0");

    try {
      const res = await fetch(
        buildApiUrl(`/api/products/${selectedProduct.dbId}`),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editForm.name,
            sku: editForm.sku,
            price: parseFloat(editForm.price),
            stock: parseInt(editForm.stock) || 0,
            print_type: editForm.print_type,
            material: editForm.material,
            description: editForm.description,
            ai_prompt_rules: editForm.ai_prompt_rules,
            active: editForm.status === "active",
            images: editForm.images,
            color_options: editForm.color_options,
            quantity_mode: editForm.quantity_mode,
            quantity_count:
              editForm.quantity_count === ""
                ? null
                : parseInt(editForm.quantity_count),
            size_options: editForm.size_options,
            material_options: editForm.material_options,
            finishing_options: editForm.finishing_options,
            processing_options: editForm.processing_options,
            delivery_options: editForm.delivery_options,
            quantity_options: editForm.quantity_options,
            shipping_options: editForm.shipping_options,
            category: editForm.category,
            print_zones: CATEGORY_ZONES[editForm.category] || [],
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update product");

      setShowEditModal(false);
      alert("Product updated successfully!");
      // ✅ Trigger local refresh instead of reloading
      setLocalRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert(err.message || "Error updating product");
    }
  };

  // Tag-editor helpers
  const addTag = (field) => {
    const val = tagInputs[field].trim();
    if (!val || editForm[field].includes(val)) return;
    setEditForm((prev) => ({ ...prev, [field]: [...prev[field], val] }));
    setTagInputs((prev) => ({ ...prev, [field]: "" }));
  };

  const removeTag = (field, index) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Apply category template to editForm
  const applyEditTemplate = (categoryName) => {
    if (!categoryName) return;
    const defaults = CATEGORY_DEFAULTS[categoryName];
    if (!defaults) return;
    setEditForm((prev) => ({
      ...prev,
      print_type: defaults.print_type || prev.print_type,
      material: defaults.material || prev.material,
      ai_prompt_rules: defaults.ai_prompt_rules || prev.ai_prompt_rules,
      color_options: [...(defaults.color_options || [])],
      size_options: [...(defaults.size_options || [])],
      material_options: [...(defaults.material_options || [])],
      finishing_options: [...(defaults.finishing_options || [])],
      processing_options: [...(defaults.processing_options || [])],
      delivery_options: [...(defaults.delivery_options || [])],
      quantity_options: [...(defaults.quantity_options || [])],
      shipping_options: [...(defaults.shipping_options || [])],
    }));
  };

  const TagEditor = ({ field, label, editable = true }) => (
    <div style={{ marginBottom: "12px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "4px",
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        {label}
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
        {editForm[field].map((tag, i) => (
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
            {editable && (
              <button
                type="button"
                onClick={() => removeTag(field, i)}
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
            )}
          </span>
        ))}
      </div>
      {editable && (
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            type="text"
            value={tagInputs[field]}
            onChange={(e) =>
              setTagInputs((prev) => ({ ...prev, [field]: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(field);
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
            onClick={() => addTag(field)}
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
      )}
    </div>
  );

  const openAddStock = async (product) => {
    try {
      const res = await fetch(buildApiUrl(`/api/products/${product.dbId}`));
      if (!res.ok) throw new Error("Failed to fetch product");
      const full = await res.json();
      setAddStockProduct(full);
      setAddStockAmount(0);
      setAddStockOptionsText((full.quantity_options || []).join("\n"));
      setShowAddStockModal(true);
    } catch (e) {
      console.error(e);
      alert("Failed to open Add Stock modal");
    }
  };

  const submitAddStock = async () => {
    if (!addStockProduct) return;
    const add = parseInt(addStockAmount) || 0;
    if (add <= 0) return alert("Enter an amount greater than 0");

    const opts = addStockOptionsText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch(
        buildApiUrl(`/api/products/${addStockProduct.id}/add-stock`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ add, quantity_options: opts }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Add stock failed");
      setShowAddStockModal(false);
      setAddStockProduct(null);
      setLocalRefreshKey((k) => k + 1);
      alert("Stock updated successfully");
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to add stock");
    }
  };

  // Upload image for Edit Product modal
  const handleEditImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setEditImageError("Image must be 3MB or smaller.");
      e.target.value = "";
      return;
    }
    setEditImageError("");
    setEditImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(buildApiUrl("/api/products/upload"), {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setEditForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
    } catch (err) {
      setEditImageError(err.message || "Upload failed");
    } finally {
      setEditImageUploading(false);
      e.target.value = "";
    }
  };

  // ✅ NEW: Delete product
  const handleDeleteProduct = async (product) => {
    if (
      !window.confirm(
        `Delete product "${product.name}"? This cannot be undone.`,
      )
    )
      return;

    try {
      const res = await fetch(buildApiUrl(`/api/products/${product.dbId}`), {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product");

      // ✅ Immediately remove from UI
      setProducts((prev) => prev.filter((p) => p.dbId !== product.dbId));

      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(err.message || "Error deleting product");
    }
  };

  if (loading) {
    return (
      <div className="dashpage dashpage-products">
        <div className="dashpage-loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashpage dashpage-products">
        <div className="dashpage-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashpage dashpage-products">
      {/* ✅ Top row - Header with Title and Add Button */}
      <div className="dashpage-top">
        <div>
          <h2 className="dashpage-title">Products</h2>
          <p className="dashpage-subtitle">
            Manage your product catalog and inventory
          </p>
        </div>

        {onAddProduct && (
          <button
            className="dashpage-add-btn"
            type="button"
            onClick={onAddProduct}
          >
            <span className="dashpage-plus">
              <FaPlus size={14} />
            </span>
            New Product
          </button>
        )}
      </div>

      {/* ✅ Stat cards */}
      <div className="dashpage-stats">
        <div className="dashpage-stat-card">
          <div className="dashpage-stat-label">Total Products</div>
          <div className="dashpage-stat-value">{productsStats.total}</div>
        </div>

        <div className="dashpage-stat-card">
          <div className="dashpage-stat-label">Active</div>
          <div className="dashpage-stat-value green">
            {productsStats.active}
          </div>
        </div>

        <div className="dashpage-stat-card">
          <div className="dashpage-stat-label">Out of Stock</div>
          <div className="dashpage-stat-value red">{productsStats.out}</div>
        </div>

        <div className="dashpage-stat-card">
          <div className="dashpage-stat-label">Services</div>
          <div className="dashpage-stat-value purple">
            {productsStats.services}
          </div>
        </div>
      </div>

      {/* ✅ Toolbar - Search and Filters */}
      <div className="dashpage-toolbar">
        <div className="dashpage-search">
          <span className="dashpage-search-icon">
            <FaSearch size={14} />
          </span>

          <input
            type="text"
            placeholder="Search SKU, product name, price..."
            value={productsQuery}
            onChange={(e) => setProductsQuery(e.target.value)}
          />
        </div>

        <div className="dashpage-filters">
          <select
            value={productsCategory}
            onChange={(e) => setProductsCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="print">Print</option>
            <option value="service">Service</option>
          </select>

          <button
            className="dashpage-filterbtn"
            type="button"
            onClick={handleClearFilters}
            title="Clear filters"
          >
            <FaFilter />
          </button>

          <button
            type="button"
            onClick={bulkSetDropdown}
            style={{
              marginLeft: 8,
              padding: "6px 10px",
              background: "#1b3f6e",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
            }}
            title="Set selected products to dropdown quantity mode"
          >
            Set selected → Dropdown
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="dashpage-table-card">
        <table className="dashpage-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    filteredProducts.length > 0 &&
                    selectedIds.size === filteredProducts.length
                  }
                  onChange={(e) => selectAllVisible(e.target.checked)}
                />
              </th>
              <th>Image</th>
              <th>SKU</th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.dbId}>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.dbId)}
                    onChange={() => toggleSelect(p.dbId)}
                  />
                </td>
                <td data-label="Image">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      style={{
                        width: 44,
                        height: 44,
                        objectFit: "cover",
                        borderRadius: 6,
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 6,
                        background: "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: "#9ca3af",
                      }}
                    >
                      No img
                    </div>
                  )}
                </td>
                <td data-label="SKU" className="strong">
                  {p.sku}
                </td>
                <td data-label="Product">{p.name}</td>
                <td data-label="Category">
                  <span className={`dashpage-pill cat-${p.category}`}>
                    {p.category}
                  </span>
                </td>
                <td data-label="Price">₱ {p.price.toLocaleString()}</td>
                <td data-label="Stock">
                  {p.stock !== undefined && p.stock !== null ? p.stock : "—"}
                </td>
                <td data-label="Status">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(p)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    title={`Click to toggle status (currently ${p.status})`}
                  >
                    <span
                      className={`dashpage-pill status-${p.status === "active" ? "completed" : "cancelled"
                        }`}
                    >
                      {p.status === "active" ? (
                        <FaCheckCircle style={{ marginRight: 6 }} />
                      ) : (
                        <FaExclamationTriangle style={{ marginRight: 6 }} />
                      )}
                      {p.status === "active" ? "active" : "inactive"}
                    </span>
                  </button>
                </td>
                <td data-label="Actions">
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleEditProduct(p)}
                      title="Edit product"
                      style={{
                        background: "#1b3f6e",
                        color: "#fff",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <FaEdit size={12} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p)}
                      title="Delete product"
                      style={{
                        background: "#e74c3c",
                        color: "#fff",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <FaTrash size={12} />
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => openAddStock(p)}
                      title="Add stock / edit quantity options"
                      style={{
                        marginLeft: 6,
                        background: "#f59e0b",
                        color: "#fff",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      Add Stock
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="9" className="dashpage-empty">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ NEW: Edit Product modal */}
      {showEditModal && selectedProduct && (
        <div
          className="ad-logout-overlay"
          onMouseDown={() => setShowEditModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="ad-logout-modal"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ maxHeight: "90vh", overflowY: "auto", maxWidth: "500px" }}
          >
            <h3 className="ad-logout-title">Edit Product</h3>
            <p
              style={{
                color: "#7f8c8d",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              Update product details and status
            </p>

            <form onSubmit={submitEditProduct}>
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
                    (overwrites option arrays)
                  </span>
                </label>
                <select
                  defaultValue=""
                  onChange={(e) => applyEditTemplate(e.target.value)}
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
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
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
                    value={editForm.sku}
                    onChange={(e) =>
                      setEditForm({ ...editForm, sku: e.target.value })
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
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
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
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stock: e.target.value })
                    }
                    disabled={true}
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
                    value={editForm.print_type}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
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
                    Product Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="tshirt">T-shirts</option>
                    <option value="jersery">Jersey</option>
                    <option value="cap">Cap</option>
                    <option value="mugs">Mugs</option>
                    <option value="notebook">Notebook</option>
                    <option value="calling_card">Business Card</option>
                    <option value="banners">Banners</option>
                    <option value="stickers">Stickers &amp; Labels</option>
                    <option value="hang_tags">Hang Tags</option>
                    <option value="brochures">Brochures</option>
                    <option value="other">Other</option>
                  </select>
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
                    Material
                  </label>
                  <input
                    type="text"
                    value={editForm.material}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
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

              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value,
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
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
                  value={editForm.ai_prompt_rules}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
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

              {/* Print zones are derived automatically from Product Category on save */}

              <hr
                style={{
                  margin: "4px 0 12px",
                  border: "none",
                  borderTop: "1px solid #e5e7eb",
                }}
              />

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
                  Product Images{" "}
                  <span style={{ color: "#9ca3af", fontWeight: "400" }}>
                    (max 3MB each)
                  </span>
                </label>
                {editForm.images.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    {editForm.images.map((url, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img
                          src={url}
                          alt={`img-${i}`}
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
                            setEditForm((prev) => ({
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
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleEditImageUpload}
                  disabled={editImageUploading}
                  style={{ fontSize: "13px" }}
                />
                {editImageUploading && (
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
                {editImageError && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#e74c3c",
                      marginTop: "4px",
                    }}
                  >
                    {editImageError}
                  </p>
                )}
              </div>

              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "12px",
                }}
              >
                Quote form options — define selectable choices for each field
              </p>

              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Quantity Input Mode
                </label>
                <select
                  value={editForm.quantity_mode}
                  onChange={(e) =>
                    setEditForm({ ...editForm, quantity_mode: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="dropdown">
                    Radio Options (predefined options)
                  </option>
                  <option value="text">Text input (custom quantity)</option>
                </select>
                {editForm.quantity_mode === "text" && (
                  <div style={{ marginTop: "8px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      Quantity threshold (auto-quote when exceeded)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.quantity_count}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          quantity_count: e.target.value,
                        })
                      }
                      placeholder="e.g., 50"
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                      }}
                    />
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                      If customer enters a quantity greater than this value, the
                      product page will auto-select the Contact/Quote option.
                    </p>
                  </div>
                )}
              </div>
              {editForm.quantity_mode === "dropdown" ? (
                <div>
                  <TagEditor
                    field="quantity_options"
                    label="Quantity Options"
                    editable={false}
                  />
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#9ca3af",
                      marginTop: "-8px",
                      marginBottom: "12px",
                    }}
                  >
                    format: label|price — e.g. 100 pcs (1 box)|₱1,270.50
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      openAddStock(
                        selectedProduct || { dbId: selectedProduct?.dbId },
                      )
                    }
                    style={{
                      padding: "6px 10px",
                      background: "#047857",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 13,
                      marginBottom: 12,
                    }}
                  >
                    Add Stock / Edit Quantity Options
                  </button>
                </div>
              ) : (
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}
                >
                  Quantity options are hidden when Quantity Input Mode is set to
                  text.
                </div>
              )}

              <TagEditor field="color_options" label="Color Options" />
              <TagEditor field="size_options" label="Size Options" />
              <TagEditor field="material_options" label="Material Options" />
              <TagEditor field="finishing_options" label="Finishing Options" />
              <TagEditor
                field="processing_options"
                label="Processing Options"
              />
              <TagEditor field="delivery_options" label="Delivery Options" />

              <TagEditor field="shipping_options" label="Shipping Options" />
              <p
                style={{
                  fontSize: "11px",
                  color: "#9ca3af",
                  marginTop: "-8px",
                  marginBottom: "12px",
                }}
              >
                format: label|price — e.g. Standard|Free
              </p>

              <div className="ad-logout-actions">
                <button
                  type="button"
                  className="ad-logout-btn ghost"
                  onClick={() => setShowEditModal(false)}
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddStockModal && addStockProduct && (
        <div
          className="ad-logout-overlay"
          onMouseDown={() => setShowAddStockModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="ad-logout-modal"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ maxHeight: "80vh", overflowY: "auto", maxWidth: "480px" }}
          >
            <h3 className="ad-logout-title">
              Add Stock — {addStockProduct.name}
            </h3>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
              >
                Current Stock
              </label>
              <div style={{ fontSize: 16, marginBottom: 8 }}>
                {addStockProduct.stock}
              </div>

              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
              >
                Stock to Add
              </label>
              <input
                type="number"
                min={0}
                value={addStockAmount}
                onChange={(e) => setAddStockAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
              >
                Quantity Options (one per line)
              </label>
              <textarea
                value={addStockOptionsText}
                onChange={(e) => setAddStockOptionsText(e.target.value)}
                rows={6}
                placeholder={`Enter one option per line\ne.g. 100 pcs (1 box)|₱1,270.50`}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                }}
              />
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
                Editing quantity options here will replace the product's
                existing quantity options.
              </p>
            </div>

            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                type="button"
                className="ad-logout-btn ghost"
                onClick={() => setShowAddStockModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ad-logout-btn"
                style={{ background: "#1b3f6e", color: "#fff", border: "none" }}
                onClick={submitAddStock}
              >
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
