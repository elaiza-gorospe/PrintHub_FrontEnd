/**
 * TshirtCustomizerPanel
 * Main orchestrator for the t-shirt customizer.
 * 3-column layout: sidebar (gallery + upload + AI prompt) | zone canvas | 3D preview
 *
 * Props:
 *   product       {object}         – product with print_zones array
 *   onDesignReady {fn}             – called with { type:'tshirt', zones, shirtColor }
 *   onClear       {fn}             – called when user removes the active design
 *   activeDesign  {object|null}    – currently applied design meta
 */
import React, { useRef, useState } from "react";
import { FaCloudUploadAlt, FaMagic, FaCheckCircle } from "react-icons/fa";
import { buildApiUrl } from "../../config/api";
import TshirtZoneCanvas from "./TshirtZoneCanvas";
import TshirtPreview3D from "./TshirtPreview3D";
import "./TshirtCustomizer.css";

const TSHIRT_GLB = "/models/tshirt.glb";

// Convert hue (0-360) to a hex color at full saturation/lightness=50%
function hueToHex(hue) {
  const h = hue / 360;
  const s = 1;
  const l = 0.5;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

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

export default function TshirtCustomizerPanel({
  product,
  onDesignReady,
  onClear,
  activeDesign,
}) {
  const zones = product?.print_zones || [];

  // gallery: [{ id, url, label }]
  const [gallery, setGallery] = useState([]);
  const [selectedGalleryId, setSelectedGalleryId] = useState(null);

  // zone placement state: { zoneId: { imageUrl, x, y, w, h } | null }
  const [zoneDesigns, setZoneDesigns] = useState({});
  const [activeZone, setActiveZone] = useState(zones[0] || null);

  // shirt color — starts white; hue slider updates it
  const [shirtColor, setShirtColor] = useState("#ffffff");
  const [sliderHue, setSliderHue] = useState(0);

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
      const zoneName = activeZone ? activeZone.replace(/_/g, " ") : "t-shirt";
      const fullPrompt = `${prompt.trim()}, for the ${zoneName} of a t-shirt, flat graphic design, transparent background, high quality`;

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
    } catch (err) {
      setGenError(err.message || "Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // ── Gallery item click — assign to active zone ────────────────────
  const handleGalleryClick = (item) => {
    setSelectedGalleryId(item.id);

    if (!activeZone) return;

    setZoneDesigns((prev) => ({
      ...prev,
      [activeZone]: {
        imageUrl: item.url,
        x: 10,
        y: 10,
        w: 80,
        h: 80,
      },
    }));
  };

  // ── Zone design change (drag/resize) ──────────────────────────────
  const handleZoneDesignChange = (zoneId, layer) => {
    setZoneDesigns((prev) => ({ ...prev, [zoneId]: layer }));
  };

  // ── Zone select: place selected gallery image if one is highlighted ─
  const handleZoneSelect = (zoneId) => {
    setActiveZone(zoneId);
    if (!selectedGalleryId) return;
    const item = gallery.find((g) => g.id === selectedGalleryId);
    if (!item) return;
    setZoneDesigns((prev) => ({
      ...prev,
      [zoneId]: { imageUrl: item.url, x: 10, y: 10, w: 80, h: 80 },
    }));
  };

  // ── Use this design ───────────────────────────────────────────────
  const hasAnyDesign = Object.values(zoneDesigns).some(Boolean);

  const handleUseDesign = () => {
    const primaryImage =
      zoneDesigns.front?.imageUrl ||
      Object.values(zoneDesigns).find(Boolean)?.imageUrl ||
      null;
    onDesignReady({
      type: "tshirt",
      zones: zoneDesigns,
      shirtColor,
      generatedImageUrl: primaryImage,
      generatedAt: new Date().toISOString(),
    });
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="tsc-root">
      {/* Applied design confirmation bar */}
      {activeDesign?.type === "tshirt" && (
        <div className="tsc-active-design-bar">
          <FaCheckCircle />
          <span>T-shirt design applied to your order.</span>
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
              placeholder={`Describe the image… e.g. "red dragon logo"`}
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
          <TshirtZoneCanvas
            zones={zones}
            zoneDesigns={zoneDesigns}
            activeZone={activeZone}
            onZoneSelect={handleZoneSelect}
            onZoneDesignChange={handleZoneDesignChange}
          />

          {/* 3D preview + color */}
          <div className="tsc-preview-panel">
            <TshirtPreview3D
              modelPath={TSHIRT_GLB}
              shirtColor={shirtColor}
              zoneDesigns={zoneDesigns}
            />

            {/* Color picker */}
            <div className="tsc-color-section">
              <div className="tsc-color-label">COLOR</div>
              <div className="tsc-color-row">
                <input
                  type="range"
                  className="tsc-color-slider"
                  min={0}
                  max={360}
                  value={sliderHue}
                  onChange={(e) => {
                    const h = Number(e.target.value);
                    setSliderHue(h);
                    setShirtColor(hueToHex(h));
                  }}
                />
                <div
                  className="tsc-color-swatch"
                  style={{ background: shirtColor }}
                />
              </div>
            </div>
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
              setShirtColor("#ffffff");
              setSliderHue(0);
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
