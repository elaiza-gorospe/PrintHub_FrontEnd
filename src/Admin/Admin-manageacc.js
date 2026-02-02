import React, { useMemo, useState, useEffect } from "react";
import "./Admin-manageacc.css";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaTimes } from "react-icons/fa";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last =
    parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] || "");
  return (first + last).toUpperCase();
}

// ✅ date-only formatter (YYYY-MM-DD)
function formatDateOnly(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function AdminManageAccounts() {
  //DB data now
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selected user for edit/delete
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state (used by Add + Edit)
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "customer",
    status: "active",
    password: "",
  });

  // fetch users from DB
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch users");
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert(err.message || "Error fetching users");
    }
  };

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const suspended = users.filter((u) => u.status === "suspended").length;
    return { total, active, admins, suspended };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // open modal
  const handleAddUser = () => {
    setForm({
      name: "",
      email: "",
      role: "customer",
      status: "active",
      password: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: (user.role || "customer").toLowerCase(),
      status: (user.status || "active").toLowerCase(),
      password: "",
    });
    setShowEditModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // sumbit modal
  const submitAdd = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return alert("Name is required");
    if (!form.email.trim()) return alert("Email is required");
    if (!form.password.trim()) return alert("Temporary password is required");

    try {
      const res = await fetch("http://localhost:3000/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to add user");

      setShowAddModal(false);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error adding user");
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!form.name.trim()) return alert("Name is required");
    if (!form.email.trim()) return alert("Email is required");

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/users/${selectedUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role,
            status: form.status,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.log("❌ UPDATE USER FAILED:", {
          status: res.status,
          data,
          sentPayload: {
            name: form.name,
            email: form.email,
            role: form.role,
            status: form.status,
          },
        });

        throw new Error(
          data?.message ||
          data?.error?.sqlMessage ||
          "Database update error"
        );
      }

      setShowEditModal(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error updating user");
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/users/${selectedUser.id}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to delete user");

      setShowDeleteModal(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error deleting user");
    }
  };

  // close modal
  const closeAdd = () => setShowAddModal(false);
  const closeEdit = () => {
    setShowEditModal(false);
    setSelectedUser(null);
  };
  const closeDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="manageacc">
      {/* top row */}
      <div className="manageacc-top">
        <div>
          <h2 className="manageacc-title">Manage Accounts</h2>
          <p className="manageacc-subtitle">Control user access and permissions</p>
        </div>

        <button className="manageacc-add-btn" type="button" onClick={handleAddUser}>
          <span className="manageacc-plus">
            <FaPlus size={14} />
          </span>
          Add User
        </button>
      </div>

      {/* stat cards */}
      <div className="manageacc-stats">
        <div className="manageacc-stat-card">
          <div className="manageacc-stat-label">Total Users</div>
          <div className="manageacc-stat-value">{stats.total}</div>
        </div>

        <div className="manageacc-stat-card">
          <div className="manageacc-stat-label">Active Users</div>
          <div className="manageacc-stat-value green">{stats.active}</div>
        </div>

        <div className="manageacc-stat-card">
          <div className="manageacc-stat-label">Administrators</div>
          <div className="manageacc-stat-value purple">{stats.admins}</div>
        </div>

        <div className="manageacc-stat-card">
          <div className="manageacc-stat-label">Suspended</div>
          <div className="manageacc-stat-value red">{stats.suspended}</div>
        </div>
      </div>

      {/* toolbar */}
      <div className="manageacc-toolbar">
        <div className="manageacc-search">
          <span className="manageacc-search-icon">
            <FaSearch size={14} />
          </span>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="manageacc-filters">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* table */}
      <div className="manageacc-table-card">
        <table className="manageacc-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Join Date</th>
              <th className="manageacc-actions-col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="manageacc-usercell">
                    <div className="manageacc-avatar">{getInitials(u.name)}</div>
                    <div className="manageacc-usertext">
                      <div className="manageacc-name">{u.name}</div>
                      <div className="manageacc-email">{u.email}</div>
                    </div>
                  </div>
                </td>

                <td>
                  <span className={`manageacc-pill role-${u.role}`}>{u.role}</span>
                </td>

                <td>
                  <span className={`manageacc-pill status-${u.status}`}>{u.status}</span>
                </td>

                {/* ✅ CHANGED: date only */}
                <td>{formatDateOnly(u.lastLogin)}</td>

                {/* ✅ CHANGED: show join date */}
                <td>{formatDateOnly(u.joinDate)}</td>

                <td className="manageacc-actions-col">
                  <div className="manageacc-actions">
                    <button
                      type="button"
                      className="manageacc-iconbtn"
                      title="Edit"
                      onClick={() => handleEdit(u)}
                    >
                      <FaEdit size={16} />
                    </button>

                    <button
                      type="button"
                      className="manageacc-iconbtn danger"
                      title="Delete"
                      onClick={() => handleDelete(u)}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="6" className="manageacc-empty">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* add modal */}
      {showAddModal && (
        <div className="manageacc-modal-overlay" onMouseDown={closeAdd}>
          <div className="manageacc-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="manageacc-modal-header">
              <h3>Add User</h3>
              <button className="manageacc-modal-close" onClick={closeAdd} type="button">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={submitAdd} className="manageacc-modal-body">
              <div className="manageacc-modal-grid">
                <div className="manageacc-field">
                  <label>Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="manageacc-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>

                <div className="manageacc-field">
                  <label>Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="admin">admin</option>
                    <option value="staff">staff</option>
                    <option value="customer">customer</option>
                  </select>
                </div>

                <div className="manageacc-field">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                    <option value="suspended">suspended</option>
                  </select>
                </div>

                <div className="manageacc-field manageacc-field-full">
                  <label>Temporary Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter temporary password"
                  />
                </div>
              </div>

              <div className="manageacc-modal-actions">
                <button type="button" className="manageacc-btn ghost" onClick={closeAdd}>
                  Cancel
                </button>
                <button type="submit" className="manageacc-btn primary">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* edit modal */}
      {showEditModal && (
        <div className="manageacc-modal-overlay" onMouseDown={closeEdit}>
          <div className="manageacc-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="manageacc-modal-header">
              <h3>Edit User</h3>
              <button className="manageacc-modal-close" onClick={closeEdit} type="button">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={submitEdit} className="manageacc-modal-body">
              <div className="manageacc-modal-grid">
                <div className="manageacc-field">
                  <label>Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="manageacc-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>

                <div className="manageacc-field">
                  <label>Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="admin">admin</option>
                    <option value="staff">staff</option>
                    <option value="customer">customer</option>
                  </select>
                </div>

                <div className="manageacc-field">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                    <option value="suspended">suspended</option>
                  </select>
                </div>
              </div>

              <div className="manageacc-modal-actions">
                <button type="button" className="manageacc-btn ghost" onClick={closeEdit}>
                  Cancel
                </button>
                <button type="submit" className="manageacc-btn primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* delete modal */}
      {showDeleteModal && (
        <div className="manageacc-modal-overlay" onMouseDown={closeDelete}>
          <div className="manageacc-modal small" onMouseDown={(e) => e.stopPropagation()}>
            <div className="manageacc-modal-header">
              <h3>Delete User</h3>
              <button className="manageacc-modal-close" onClick={closeDelete} type="button">
                <FaTimes />
              </button>
            </div>

            <div className="manageacc-modal-body">
              <p className="manageacc-delete-text">
                Are you sure you want to delete{" "}
                <strong>{selectedUser?.name}</strong>?
              </p>

              <div className="manageacc-modal-actions">
                <button type="button" className="manageacc-btn ghost" onClick={closeDelete}>
                  Cancel
                </button>
                <button type="button" className="manageacc-btn danger" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminManageAccounts;
