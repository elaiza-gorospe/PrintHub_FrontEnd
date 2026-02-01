import React, { useMemo, useState } from "react";
import "./Admin-manageacc.css";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] || "");
  return (first + last).toUpperCase();
}

function AdminManageAccounts() {
  // sample data (later you can replace with DB fetch)
  const [users, setUsers] = useState([
    { id: 1, name: "Admin User", email: "admin@example.com", role: "admin", status: "active", lastLogin: "2/1/2026", joinDate: "1/15/2024" },
    { id: 2, name: "Sarah Johnson", email: "sarah@example.com", role: "manager", status: "active", lastLogin: "1/31/2026", joinDate: "3/20/2024" },
    { id: 3, name: "Mike Chen", email: "mike@example.com", role: "user", status: "active", lastLogin: "1/30/2026", joinDate: "6/10/2024" },
    { id: 4, name: "Emily Davis", email: "emily@example.com", role: "manager", status: "active", lastLogin: "1/29/2026", joinDate: "4/5/2024" },
    { id: 5, name: "James Wilson", email: "james@example.com", role: "viewer", status: "inactive", lastLogin: "12/15/2025", joinDate: "8/22/2024" },
    { id: 6, name: "Lisa Anderson", email: "lisa@example.com", role: "user", status: "suspended", lastLogin: "12/10/2025", joinDate: "9/10/2024" },
  ]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === "active").length;
    const admins = users.filter(u => u.role === "admin").length;
    const suspended = users.filter(u => u.status === "suspended").length;
    return { total, active, admins, suspended };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users.filter(u => {
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleAddUser = () => {
    alert("Add User modal goes here (tell me if you want a modal + form).");
  };

  const handleEdit = (user) => alert(`Edit user: ${user.name}`);
  const handleEmail = (user) => alert(`Email user: ${user.email}`);
  const handleDelete = (user) => {
    if (window.confirm(`Delete ${user.name}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
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
          <span className="manageacc-plus">＋</span>
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
          <span className="manageacc-search-icon">🔍</span>
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
            <option value="admin">admin</option>
            <option value="manager">manager</option>
            <option value="user">user</option>
            <option value="viewer">viewer</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="suspended">suspended</option>
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

                <td>{u.lastLogin}</td>
                <td>{u.joinDate}</td>

                <td className="manageacc-actions-col">
                  <div className="manageacc-actions">
                    <button type="button" className="manageacc-iconbtn" title="Edit" onClick={() => handleEdit(u)}>
                      ✏️
                    </button>
                    <button type="button" className="manageacc-iconbtn" title="Email" onClick={() => handleEmail(u)}>
                      ✉️
                    </button>
                    <button type="button" className="manageacc-iconbtn danger" title="Delete" onClick={() => handleDelete(u)}>
                      🗑️
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
    </div>
  );
}

export default AdminManageAccounts;
