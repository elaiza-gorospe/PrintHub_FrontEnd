/**
 * NotebookCustomizerPanel
 * Orchestrator for the notebook customizer.
 * Layout: sidebar (gallery + upload + AI prompt) | zone canvas | 3D preview
 *
 * Props:
 *   product       {object}    – product with print_zones array
 *   onDesignReady {fn}        – called with { type:'notebook', zones, generatedAt }
 *   onClear       {fn}        – called when user removes the active design
 *   activeDesign  {object|null}
 */
import React, { useRef, useState } from "react";
import { FaCloudUploadAlt, FaMagic, FaCheckCircle } from "react-icons/fa";
import { buildApiUrl } from "../../config/api";
import NotebookZoneCanvas from "./NotebookZoneCanvas";
import NotebookPreview3D from "./NotebookPreview3D";
import "../TshirtCustomizer/TshirtCustomizer.css";

const NOTEBOOK_GLB = "/models/notebook_material.glb";

const GUEST_GEN_KEY = "ai_guest_generations";
const GUEST_LIMIT = 3;

function getGuestGenCount() {
  try {
    return parseInt(localStorage.getItem(GUEST_GEN_KEY) || "0", 10) || 0;
  } catch {
    return 0;
  }
}
function incrementGuestGenCount() {
  try {
    const v = getGuestGenCount() + 1;
    localStorage.setItem(GUEST_GEN_KEY, String(v));
  } catch {
    /* ignore */
  }
}
function getUserId() {
  try {
    const u = localStorage.getItem("user");
    if (u) return JSON.parse(u).id;
  } catch {
    /* ignore */
  }
  return parseInt(localStorage.getItem("userId"), 10) || null;
}

export default function NotebookCustomizerPanel({
  product,
  onDesignReady,
  onClear,
  activeDesign,
}) {
  const zones = product?.print_zones || [];

  const [gallery, setGallery] = useState([]);
  const [selectedGalleryId, setSelectedGalleryId] = useState(null);
  const [zoneDesigns, setZoneDesigns] = useState({});
  const [activeZone, setActiveZone] = useState(zones[0] || null);

  // upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // AI generation state
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  // ── Upload handler ────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userId = getUserId();
    if (!userId) {
      setUploadError("You must be logged in to upload images.");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only JPEG, PNG, WebP and GIF are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large (max 10 MB).");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(buildApiUrl("/api/builder/upload"), {
        method: "POST",
        headers: { "X-User-Id": String(userId) },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      const id = `upload-${Date.now()}`;
      setGallery((prev) => [...prev, { id, url: data.url, label: file.name }]);
      setSelectedGalleryId(id);
      // Auto-place into active zone so 3D model updates immediately
      setZoneDesigns((prev) => ({
        ...prev,
        ...(activeZone
          ? { [activeZone]: { imageUrl: data.url, x: 10, y: 10, w: 80, h: 80 } }
          : {}),
      }));
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── AI generation handler ─────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setGenError("Please enter a prompt.");
      return;
    }

    const isGuest = !getUserId();
    if (isGuest && getGuestGenCount() >= GUEST_LIMIT) {
      setGenError(
        "Guests are limited to 3 AI generations. Please sign up to continue.",
      );
      return;
    }

    setGenerating(true);
    setGenError("");

    try {
      const zoneName = activeZone
        ? activeZone.replace(/_/g, " ")
        : "notebook cover";
      const fullPrompt = `${prompt.trim()}, for the ${zoneName} of a notebook, flat graphic design, transparent background, high quality`;

      const userId = getUserId();
      const res = await fetch(buildApiUrl("/api/builder/generate-image"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { "X-User-Id": String(userId) } : {}),
        },
        body: JSON.stringify({ prompt: fullPrompt, imageSize: "square_hd" }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setGenError(data.message || "Please wait before generating again.");
        return;
      }
      if (!res.ok) throw new Error(data.message || "Generation failed");

      const imageUrl = data.imageUrl || data.url;
      if (!imageUrl) throw new Error("No image returned. Please try again.");

      if (isGuest) incrementGuestGenCount();

      const id = `gen-${Date.now()}`;
      setGallery((prev) => [
        ...prev,
        { id, url: imageUrl, label: prompt.trim().slice(0, 30) },
      ]);
      setSelectedGalleryId(id);
      // Auto-place into active zone so 3D model updates immediately
      setZoneDesigns((prev) => ({
        ...prev,
        ...(activeZone
          ? { [activeZone]: { imageUrl, x: 10, y: 10, w: 80, h: 80 } }
          : {}),
      }));
    } catch (err) {
      setGenError(err.message || "Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // ── Gallery item click ────────────────────────────────────────────
  const handleGalleryClick = (item) => {
    setSelectedGalleryId(item.id);
    if (!activeZone) return;
    setZoneDesigns((prev) => ({
      ...prev,
      [activeZone]: { imageUrl: item.url, x: 10, y: 10, w: 80, h: 80 },
    }));
  };

  // ── Zone design change (drag/resize) ──────────────────────────────
  const handleZoneDesignChange = (zoneId, layer) => {
    setZoneDesigns((prev) => ({ ...prev, [zoneId]: layer }));
  };

  const hasAnyDesign = Object.values(zoneDesigns).some(Boolean);

  const handleUseDesign = () => {
    const primaryImage =
      zoneDesigns.front_cover?.imageUrl ||
      Object.values(zoneDesigns).find(Boolean)?.imageUrl ||
      null;
    onDesignReady({
      type: "notebook",
      zones: zoneDesigns,
      generatedImageUrl: primaryImage,
      generatedAt: new Date().toISOString(),
    });
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="tsc-root">
      {activeDesign?.type === "notebook" && (
        <div className="tsc-active-design-bar">
          <FaCheckCircle />
          <span>Notebook design applied to your order.</span>
          <button
            type="button"
            className="tsc-clear-btn"
            style={{ marginLeft: "auto" }}
            onClick={onClear}
          >
            Remove
          </button>
        </div>
      )}

      <div className="tsc-layout">
        {/* ── Left sidebar ──────────────────────────────────────── */}
        <div className="tsc-sidebar">
          {/* Upload */}
          <div className="tsc-sidebar-section">
            <h4>Add Images</h4>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="tsc-upload-btn"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <span className="tsc-spinner" />
                  Uploading…
                </>
              ) : (
                <>
                  <FaCloudUploadAlt />
                  Upload Image
                </>
              )}
            </button>
            <p className="tsc-upload-hint">PNG or JPG (max. 10MB)</p>
            {uploadError && <p className="tsc-error">{uploadError}</p>}
          </div>

          {/* AI Prompt */}
          <div className="tsc-sidebar-section">
            <h4>
              <FaMagic style={{ marginRight: 5, verticalAlign: "middle" }} />
              Generate via AI
            </h4>
            {activeZone ? (
              <p className="tsc-prompt-hint">
                Generating for: <strong>{activeZone.replace(/_/g, " ")}</strong>
              </p>
            ) : (
              <p className="tsc-prompt-hint">Select a zone first</p>
            )}
            <textarea
              className="tsc-prompt-textarea"
              placeholder={`Describe the design… e.g. "minimalist mountain landscape"`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              type="button"
              className="tsc-btn-generate"
              disabled={generating || !prompt.trim()}
              onClick={handleGenerate}
            >
              {generating ? (
                <>
                  <span className="tsc-spinner" />
                  Generating…
                </>
              ) : (
                "Generate"
              )}
            </button>
            {genError && <p className="tsc-error">{genError}</p>}
          </div>

          {/* Gallery */}
          <div className="tsc-sidebar-section">
            <h4>Gallery</h4>
            <div className="tsc-gallery">
              {gallery.length === 0 && (
                <span className="tsc-gallery-empty">
                  Upload or generate an image to start.
                </span>
              )}
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className={`tsc-gallery-thumb${selectedGalleryId === item.id ? " selected" : ""}`}
                  title={item.label}
                  onClick={() => handleGalleryClick(item)}
                >
                  <img src={item.url} alt={item.label} />
                  <button
                    type="button"
                    className="tsc-gallery-thumb-remove"
                    title="Remove from gallery"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGallery((prev) =>
                        prev.filter((g) => g.id !== item.id),
                      );
                      if (selectedGalleryId === item.id)
                        setSelectedGalleryId(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main column: zones above 3D preview ───────────────── */}
        <div className="tsc-main-col">
          <NotebookZoneCanvas
            zones={zones}
            zoneDesigns={zoneDesigns}
            activeZone={activeZone}
            onZoneSelect={setActiveZone}
            onZoneDesignChange={handleZoneDesignChange}
          />

          {/* 3D preview */}
          <div className="tsc-preview-panel">
            <NotebookPreview3D
              modelPath={NOTEBOOK_GLB}
              zoneDesigns={zoneDesigns}
            />
          </div>
        </div>
      </div>

      {/* Use design button */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          type="button"
          className="tsc-use-btn"
          disabled={!hasAnyDesign}
          onClick={handleUseDesign}
        >
          Use This Design
        </button>
        {hasAnyDesign && (
          <button
            type="button"
            className="tsc-clear-btn"
            onClick={() => {
              setZoneDesigns({});
              setGallery([]);
              setSelectedGalleryId(null);
              setActiveZone(zones[0] || null);
              setPrompt("");
              onClear?.();
            }}
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
