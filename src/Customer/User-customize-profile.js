import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-customize-profile.css";
import { buildApiUrl } from "../config/api";

function UserCustomizeProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    birthday: "",
    gender: "",
    phone: "+63",
    address: "",
  });

  const [isEditing, setIsEditing] = useState(false);

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
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(
      () =>
        setToast({
          show: false,
          type: message ? type : "success",
          message: "",
        }),
      2200,
    );
  };

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

    fetch(buildApiUrl(`/api/user-profile/${user.id}`))
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load profile");

        const loaded = {
          name: data.name || "",
          birthday: data.birthday || "",
          gender: data.gender || "",
          phone: data.phone || "+63",
          address: data.address || "",
          avatar_url: data.avatar_url || "",
        };

        if (!loaded.phone.startsWith("+63")) loaded.phone = "+63";

        setForm(loaded);
        setInitialForm(loaded);
        setAvatarPreview(loaded.avatar_url || "");
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error loading profile");
      });
  }, []);

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

  const validate = () => {
    const name = String(form.name || "").trim();
    const phone = String(form.phone || "").trim();
    const birthday = String(form.birthday || "").trim();

    if (!name) return "Name is required.";

    const nameParts = name.split(/\s+/);
    if (nameParts.length < 2) {
      return "Please provide both first name and surname.";
    }

    if (!/^[A-Za-z.\-\s]+$/.test(name)) {
      return "Name must not contain numbers or special characters.";
    }

    if (!/^\+63\d{10}$/.test(phone)) {
      return "Phone number must be +63 followed by 10 digits.";
    }

    if (birthday) {
      const year = new Date(birthday).getFullYear();
      if (year > 2011) {
        return "Only users born in 2011 or earlier are allowed.";
      }
    }

    return "";
  };

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
      const res = await fetch(buildApiUrl(`/api/user-profile/${userId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update profile");

      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        const firstName = form.name.split(" ")[0];
        localStorage.setItem("user", JSON.stringify({ ...user, firstName }));
      }

      showToast("success", "Profile updated!");
      setInitialForm({ ...form });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error updating profile");
      showToast("error", err.message || "Error updating profile");
    }
  };

  const handleAvatarClick = () => {
    if (!isEditing) return;
    const inp = document.getElementById("ucp-avatar-input");
    if (inp) inp.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    setAvatarError("");
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setAvatarError("Only JPEG, PNG, WebP and GIF are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be 2MB or smaller.");
      e.target.value = "";
      return;
    }

    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(buildApiUrl("/api/user/avatar-upload"), {
        method: "POST",
        body: fd,
        headers: { "x-user-id": userId || "" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      // update preview and form
      setAvatarPreview(data.url || "");
      setForm((prev) => ({ ...prev, avatar_url: data.url }));

      // try to persist to profile (best-effort)
      if (userId) {
        try {
          await fetch(buildApiUrl(`/api/user-profile/${userId}`), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, avatar_url: data.url }),
          });
        } catch (err) {
          // ignore; we still show uploaded avatar locally
        }
      }
    } catch (err) {
      console.error(err);
      setAvatarError(err.message || "Upload failed");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleDiscard = () => {
    setShowDiscardModal(false);
    setIsEditing(false);
    setForm(initialForm);
  };

  const handleBackOrCancel = () => {
    if (isEditing && isDirty) {
      setShowDiscardModal(true);
    } else if (isEditing && !isDirty) {
      setIsEditing(false);
      setForm(initialForm);
    } else {
      navigate(-1);
    }
  };

  return (
  <div className="ucp-adminlike-page">
    <button className="ucp-back-button" onClick={handleBackOrCancel}>
      ← Back
    </button>

    <div className="ucp-profile-card">
      <div className="ucp-profile-top">
        <div className="ucp-profile-avatar-wrapper">
          <div
            className="ucp-profile-avatar"
            onClick={handleAvatarClick}
            role="button"
            aria-label={isEditing ? "Change avatar" : ""}
            style={{ cursor: isEditing ? "pointer" : "default" }}
          >
            {avatarPreview ? <img src={avatarPreview} alt="avatar" /> : "👤"}

            {isEditing && (
              <>
                <input
                  id="ucp-avatar-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                  style={{ display: "none" }}
                />
                <div className="ucp-avatar-overlay" aria-hidden>
                  ✏️ Edit
                </div>
              </>
            )}

            {avatarUploading && (
              <div className="ucp-avatar-loading">Uploading...</div>
            )}
          </div>
        </div>
        <div className="ucp-profile-info">
          <h2 className="ucp-profile-name">{form.name || "Your Name"}</h2>
          <p className="ucp-profile-role">Customer</p>
        </div>
        {!isEditing && (
          <button className="ucp-edit-button" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {!isEditing ? (
        <>
          <div className="ucp-profile-details">
            <div className="ucp-detail-row">
              <label>Name</label>
              <span>{form.name || "—"}</span>
            </div>
            <div className="ucp-detail-row">
              <label>Birthday</label>
              <span>{form.birthday || "—"}</span>
            </div>
            <div className="ucp-detail-row">
              <label>Gender</label>
              <span>{form.gender || "—"}</span>
            </div>
            <div className="ucp-detail-row">
              <label>Phone Number</label>
              <span>{form.phone || "—"}</span>
            </div>
            <div className="ucp-detail-row">
              <label>Address</label>
              <span>{form.address || "—"}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="ucp-profile-form">
            <div className="ucp-form-row">
              <label>Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your full name (first name and surname)"
              />
            </div>

            <div className="ucp-form-row">
              <label>Birthday</label>
              <input
                type="date"
                value={form.birthday}
                max="2011-12-31"
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              />
            </div>

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

            <div className="ucp-form-row">
              <label>Phone Number</label>
              <input
                value={form.phone}
                inputMode="numeric"
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9+]/g, "");
                  if (!val.startsWith("+63")) val = "+63";
                  if (val.length > 13) return;
                  setForm({ ...form, phone: val });
                }}
                placeholder="+63XXXXXXXXXX"
              />
            </div>

            <div className="ucp-form-row ucp-form-row-textarea">
              <label>Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="House No., Street, Barangay, City, Province"
              />
            </div>
          </div>

          <div className="ucp-profile-actions">
            <button className="ucp-cancel-button" onClick={() => {
              if (isDirty) {
                setShowDiscardModal(true);
              } else {
                setIsEditing(false);
                setForm(initialForm);
              }
            }}>
              Cancel
            </button>
            <button className="ucp-save-button" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </>
      )}

      {error && <div className="ucp-message ucp-message-error">{error}</div>}
      {success && <div className="ucp-message ucp-message-success">{success}</div>}
    </div>

    {toast.show && (
      <div className={`ucp-toast ${toast.type === "error" ? "ucp-toast-error" : "ucp-toast-success"}`}>
        {toast.message}
      </div>
    )}

    {showDiscardModal && (
      <div className="ucp-discard-overlay" onClick={() => setShowDiscardModal(false)}>
        <div className="ucp-discard-modal" onClick={(e) => e.stopPropagation()}>
          <h3 className="ucp-discard-title">Discard changes?</h3>
          <p className="ucp-discard-text">Your unsaved changes will be lost.</p>
          <div className="ucp-discard-actions">
            <button type="button" className="ucp-discard-cancel" onClick={() => setShowDiscardModal(false)}>
              Stay
            </button>
            <button type="button" className="ucp-discard-confirm" onClick={handleDiscard}>
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
