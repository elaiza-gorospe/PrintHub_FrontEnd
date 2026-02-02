import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-customize-profile.css";

function UserCustomizeProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    birthday: "",
    gender: "",
    phone: "+63",
    address: "",
  });

  const [initialForm, setInitialForm] = useState({
    name: "",
    birthday: "",
    gender: "",
    phone: "+63",
    address: "",
  });

  const [userId, setUserId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(
      () => setToast({ show: false, type: message ? type : "success", message: "" }),
      2200
    );
  };

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    let user;
    try {
      user = JSON.parse(stored);
    } catch {
      return;
    }

    if (!user?.id) return;
    setUserId(user.id);

    fetch(`http://localhost:3000/api/user-profile/${user.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load profile");

        const loaded = {
          name: data.name || "",
          birthday: data.birthday || "",
          gender: data.gender || "",
          phone: data.phone || "+63",
          address: data.address || "",
        };

        if (!loaded.phone.startsWith("+63")) loaded.phone = "+63";

        setForm(loaded);
        setInitialForm(loaded);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error loading profile");
      });
  }, []);

  // ================= DIRTY CHECK =================
  const isDirty = useMemo(() => {
    const normalize = (v) => String(v ?? "").trim();
    return (
      normalize(form.name) !== normalize(initialForm.name) ||
      normalize(form.birthday) !== normalize(initialForm.birthday) ||
      normalize(form.gender) !== normalize(initialForm.gender) ||
      normalize(form.phone) !== normalize(initialForm.phone) ||
      normalize(form.address) !== normalize(initialForm.address)
    );
  }, [form, initialForm]);

  // ================= VALIDATION =================
  const validate = () => {
    const name = String(form.name || "").trim();
    const phone = String(form.phone || "").trim();
    const birthday = String(form.birthday || "").trim();

    if (!name) return "Name is required.";

    if (!/^[A-Za-z.\-\s]+$/.test(name)) {
      return "Name can only contain letters and spaces.";
    }

    // ✅ phone must be +63 + 10 digits (no letters)
    if (!/^\+63\d{10}$/.test(phone)) {
      return "Phone number must be +63 followed by 10 digits.";
    }

    // ✅ birthday must be 2011 or earlier
    if (birthday) {
      const year = new Date(birthday).getFullYear();
      if (year > 2011) {
        return "Only users born in 2011 or earlier are allowed.";
      }
    }

    return "";
  };

  // ================= SAVE =================
  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!userId) {
      setError("No logged-in user found.");
      return;
    }

    if (!isDirty) {
      showToast("error", "No changes to save.");
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      showToast("error", validationError);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/user-profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update profile");

      // sync navbar name
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        const firstName = form.name.split(" ")[0];
        localStorage.setItem("user", JSON.stringify({ ...user, firstName }));
      }

      showToast("success", "Profile updated!");
      setInitialForm({ ...form });
    } catch (err) {
      console.error(err);
      setError(err.message || "Error updating profile");
      showToast("error", err.message || "Error updating profile");
    }
  };

  const handleDiscard = () => {
    setShowDiscardModal(false);
    setForm(initialForm); 
  };

  // ✅ if dirty show modal, if not dirty just go back
  const handleBackOrCancel = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      navigate(-1);
    }
  };

  // ================= RENDER =================
  return (
    <div className="ucp-adminlike-page">
      <button className="ucp-back-button" onClick={handleBackOrCancel}>
        ← Back
      </button>

      <div className="ucp-profile-card">
        <div className="ucp-profile-top">
          <div className="ucp-profile-avatar">👤</div>
          <div>
            <h2 className="ucp-profile-name">{form.name || "Your Name"}</h2>
            <p className="ucp-profile-role">Customer</p>
          </div>
        </div>

        <div className="ucp-profile-actions">
          <button className="ucp-cancel-button" onClick={handleBackOrCancel}>
            Cancel
          </button>

          <button
            className="ucp-save-button"
            onClick={handleSave}
            disabled={!isDirty}
            style={!isDirty ? { opacity: 0.6 } : {}}
          >
            Save Changes
          </button>
        </div>

        {error && <div className="ucp-message ucp-message-error">{error}</div>}
        {success && <div className="ucp-message ucp-message-success">{success}</div>}

        <div className="ucp-profile-form">
          {/* NAME */}
          <div className="ucp-form-row">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          {/* BIRTHDAY */}
          <div className="ucp-form-row">
            <label>Birthday</label>
            <input
              type="date"
              value={form.birthday}
              max="2011-12-31"
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            />
          </div>

          {/* GENDER */}
          <div className="ucp-form-row">
            <label>Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Select...</option>
              <option>Female</option>
              <option>Male</option>
              <option>Prefer not to say</option>
              <option>Other</option>
            </select>
          </div>

          {/* PHONE */}
          <div className="ucp-form-row">
            <label>Phone Number</label>
            <input
              value={form.phone}
              inputMode="numeric"
              onChange={(e) => {
                let val = e.target.value.replace(/[^0-9+]/g, "");
                if (!val.startsWith("+63")) val = "+63";
                if (val.length > 13) return; // +63 + 10 digits
                setForm({ ...form, phone: val });
              }}
              placeholder="+63XXXXXXXXXX"
            />
          </div>

          {/* ADDRESS */}
          <div className="ucp-form-row ucp-form-row-textarea">
            <label>Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="House No., Street, Barangay, City, Province"
            />
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast.show && (
        <div
          className={`ucp-toast ${
            toast.type === "error" ? "ucp-toast-error" : "ucp-toast-success"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* ✅ DISCARD MODAL (NOW USES YOUR CSS CLASSES) */}
      {showDiscardModal && (
        <div className="ucp-discard-overlay" onClick={() => setShowDiscardModal(false)}>
          <div className="ucp-discard-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="ucp-discard-title">Discard changes?</h3>
            <p className="ucp-discard-text">Your unsaved changes will be lost.</p>

            <div className="ucp-discard-actions">
              <button
                type="button"
                className="ucp-discard-cancel"
                onClick={() => setShowDiscardModal(false)}
              >
                Stay
              </button>

              <button
                type="button"
                className="ucp-discard-confirm"
                onClick={handleDiscard}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCustomizeProfile;
