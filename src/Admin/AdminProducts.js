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

function AdminProducts({ refreshTrigger = 0, onAddProduct = null }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsQuery, setProductsQuery] = useState("");
  const [productsCategory, setProductsCategory] = useState("all");
  const [localRefreshKey, setLocalRefreshKey] = useState(0); // ✅ Local refresh trigger

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
    status: "active",
  });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:3000/api/products?limit=100",
        );
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        // Transform API data to match UI format
        const transformedProducts = (data.products || data).map((product) => ({
          sku: product.sku || `PRD-${product.id}`,
          name: product.name,
          category:
            product.print_type === "offset" || product.print_type === "digital"
              ? "print"
              : "service",
          price: parseFloat(product.price),
          stock: product.stock || 0,
          status: product.active ? "active" : "inactive",
          dbId: product.id,
          material: product.material,
          description: product.description,
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
  }, [refreshTrigger, localRefreshKey]);

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

  // ✅ NEW: Open edit modal with selected product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
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
      status: product.status,
    });
    setShowEditModal(true);
  };

  // ✅ NEW: Toggle product status (active/inactive)
  const handleToggleStatus = async (product) => {
    try {
      const newStatus = product.status === "active" ? false : true;
      const res = await fetch(
        `http://localhost:3000/api/products/${product.dbId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: newStatus }),
        },
      );

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
        `http://localhost:3000/api/products/${selectedProduct.dbId}`,
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
            active: editForm.status === "active",
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

  // ✅ NEW: Delete product
  const handleDeleteProduct = async (product) => {
    if (
      !window.confirm(
        `Delete product "${product.name}"? This cannot be undone.`,
      )
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/products/${product.dbId}`,
        { method: "DELETE" },
      );

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
        </div>
      </div>

      {/* Products Table */}
      <div className="dashpage-table-card">
        <table className="dashpage-table">
          <thead>
            <tr>
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
                  {p.category === "service" ? "—" : p.stock}
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
                      className={`dashpage-pill status-${
                        p.status === "active" ? "completed" : "cancelled"
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
                  </div>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="7" className="dashpage-empty">
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
    </div>
  );
}

export default AdminProducts;
