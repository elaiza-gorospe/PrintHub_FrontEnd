import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function AdminManageAccounts() {
  return (
    <div className="manage-accounts">
      <h2>Manage Accounts</h2>

      {/* example table UI */}
      <div className="accounts-card">
        <table className="accounts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Juan Dela Cruz</td>
              <td>juan@email.com</td>
              <td>User</td>
              <td>Active</td>
              <td><button className="small-btn">Edit</button></td>
            </tr>
            <tr>
              <td>Maria Santos</td>
              <td>maria@email.com</td>
              <td>Admin</td>
              <td>Active</td>
              <td><button className="small-btn">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminManageAccounts;