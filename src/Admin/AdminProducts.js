import React, { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./Admin-dashboard.css";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsQuery, setProductsQuery] = useState("");
  const [productsCategory, setProductsCategory] = useState("all");

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
        }));

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
  }, []);

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
      {/* Stats Cards */}
      <div className="dashpage-stats">
        <div className="dashpage-stat-card">
          <div className="dashpage-stat-label">Total</div>
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

      {/* Toolbar with Search and Filters */}
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
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="6" className="dashpage-empty">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProducts;
