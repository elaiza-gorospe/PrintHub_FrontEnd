/**
 * AIBuilderPanel — the top-level AI builder section embedded in product detail.
 *
 * Props:
 *   product      {object}  – current product from Products-data
 *   productImage {string}  – current selected product gallery image
 *   onDesignReady {fn}     – called with final designMeta when user clicks "Use this design"
 *   onClear       {fn}     – called when user removes an active design
 *   activeDesign  {object|null} – currently applied designMeta (or null)
 */
import React, { useRef, useState } from "react";
import { FaCloudUploadAlt, FaMagic, FaCheckCircle } from "react-icons/fa";
import { buildApiUrl } from "../../config/api";
import AIBuilderEditor from "./AIBuilderEditor";
import "./AIBuilder.css";

const IMAGE_SIZES = [
  { value: "square_hd", label: "Square (HD)" },
  { value: "square", label: "Square" },
  { value: "portrait_4_3", label: "Portrait 4:3" },
  { value: "portrait_16_9", label: "Portrait 16:9" },
  { value: "landscape_4_3", label: "Landscape 4:3" },
  { value: "landscape_16_9", label: "Landscape 16:9" },
];

export default function AIBuilderPanel({ product, productImage, onDesignReady, onClear, activeDesign }) {
  // ── mode: "generate" | "upload" ────────────────────────────────
  const [mode, setMode] = useState("generate");

  // ── generate state ──────────────────────────────────────────────
  const [prompt, setPrompt] = useState("");
  const [imageSize, setImageSize] = useState("square_hd");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [cooldownMsg, setCooldownMsg] = useState("");

  // ── upload state ────────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // ── result / editor state ───────────────────────────────────────
  // resultMeta: { url, width, height, seed, prompt, stored, path } | null
  const [resultMeta, setResultMeta] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [builderState, setBuilderState] = useState(null); // from AIBuilderEditor

  // ── helper to get current user id ──────────────────────────────
  const getUserId = () => {
    try {
      const u = localStorage.getItem("user");
      if (u) return JSON.parse(u).id;
    } catch { /* ignore */ }
    return parseInt(localStorage.getItem("userId"), 10) || null;
  };

  // ── Generate ────────────────────────────────────────────────────
  const handleGenerate = async () => {
    const userId = getUserId();
    if (!userId) {
      setGenError("You must be logged in to use the AI builder.");
      return;
    }
    if (!prompt.trim()) {
      setGenError("Please enter a prompt first.");
      return;
    }

    setGenerating(true);
    setGenError("");
    setCooldownMsg("");
    setResultMeta(null);
    setShowEditor(false);

    try {
      const res = await fetch(buildApiUrl("/api/builder/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(userId),
        },
        body: JSON.stringify({ prompt: prompt.trim(), imageSize }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setCooldownMsg(data.message || "Please wait before generating again.");
        return;
      }
      if (!res.ok) throw new Error(data.message || "Generation failed");

      setResultMeta({ ...data, prompt: prompt.trim(), source: "generated" });
      setShowEditor(true);
    } catch (e) {
      setGenError(e.message || "Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // ── Upload ──────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userId = getUserId();
    if (!userId) {
      setUploadError("You must be logged in to upload assets.");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only JPEG, PNG, WebP, and GIF images are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 10 MB.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setResultMeta(null);
    setShowEditor(false);

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

      setResultMeta({ ...data, source: "upload", prompt: null });
      setShowEditor(true);
    } catch (e) {
      setUploadError(e.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Use this design ─────────────────────────────────────────────
  const handleUseDesign = () => {
    if (!resultMeta) return;
    const designMeta = {
      generatedImageUrl: resultMeta.url,
      sourceAssetUrls: resultMeta.source === "upload" ? [resultMeta.url] : [],
      prompt: resultMeta.prompt || null,
      imageSizeSetting: imageSize,
      seed: resultMeta.seed || null,
      source: resultMeta.source,
      storagePath: resultMeta.path || null,
      builderState: builderState || null,
      generatedAt: new Date().toISOString(),
    };
    onDesignReady(designMeta);
    setShowEditor(false);
  };

  // ── Discard result ──────────────────────────────────────────────
  const handleDiscard = () => {
    setResultMeta(null);
    setShowEditor(false);
    setBuilderState(null);
  };

  return (
    <div className="aib-root">
      {/* Header */}
      <div className="aib-header">
        <FaMagic style={{ color: "#455073", fontSize: 18 }} />
        <h3>AI Design Builder</h3>
        <span className="aib-badge">Beta</span>
      </div>

      {/* Active design badge */}
      {activeDesign && !showEditor && (
        <div className="aib-design-badge">
          <img src={activeDesign.generatedImageUrl} alt="active design" />
          <span>Design attached to this item</span>
          <button className="aib-design-badge-clear" onClick={onClear} type="button">
            Remove
          </button>
        </div>
      )}

      {/* Mode tabs */}
      {!showEditor && (
        <div className="aib-mode-tabs">
          <button
            type="button"
            className={`aib-mode-tab ${mode === "generate" ? "active" : ""}`}
            onClick={() => setMode("generate")}
          >
            Generate with AI
          </button>
          <button
            type="button"
            className={`aib-mode-tab ${mode === "upload" ? "active" : ""}`}
            onClick={() => setMode("upload")}
          >
            Upload Image
          </button>
        </div>
      )}

      {/* ── Generate mode ── */}
      {!showEditor && mode === "generate" && (
        <>
          <div className="aib-field">
            <label htmlFor="aib-prompt">Describe your design</label>
            <textarea
              id="aib-prompt"
              className="aib-textarea"
              rows={3}
              maxLength={1000}
              placeholder={`e.g. "A minimalist business card design with navy blue and gold accents, featuring the ${product?.title || "product"} logo"`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="aib-row">
            <div className="aib-field">
              <label htmlFor="aib-size">Image size</label>
              <select
                id="aib-size"
                className="aib-select"
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
              >
                {IMAGE_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="aib-btn-generate"
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
            >
              {generating ? "Generating…" : "Generate"}
            </button>
          </div>

          {generating && (
            <div className="aib-status">
              <span className="aib-spinner" />
              Generating your design with AI, please wait…
            </div>
          )}
          {cooldownMsg && <div className="aib-cooldown">{cooldownMsg}</div>}
          {genError && <div className="aib-error">{genError}</div>}
        </>
      )}

      {/* ── Upload mode ── */}
      {!showEditor && mode === "upload" && (
        <>
          <div
            className="aib-upload-zone"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          >
            <div className="aib-upload-icon"><FaCloudUploadAlt /></div>
            <p>Click to upload your image or logo</p>
            <p>JPEG, PNG, WebP, GIF — up to 10 MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {uploading && (
            <div className="aib-status">
              <span className="aib-spinner" />
              Uploading…
            </div>
          )}
          {uploadError && <div className="aib-error">{uploadError}</div>}
        </>
      )}

      {/* ── Result + Editor ── */}
      {showEditor && resultMeta && (
        <>
          <div className="aib-result">
            <div className="aib-result-img-wrap">
              <img
                src={resultMeta.url}
                alt="generated design"
                className="aib-result-img"
              />
              <span className="aib-result-label">
                {resultMeta.source === "generated" ? "AI Generated" : "Uploaded"}
              </span>
            </div>
          </div>

          <AIBuilderEditor
            productImage={productImage}
            designImage={resultMeta.url}
            initialState={builderState}
            onChange={setBuilderState}
          />

          <div className="aib-result-actions">
            <button type="button" className="aib-btn-use" onClick={handleUseDesign}>
              <FaCheckCircle style={{ marginRight: 6 }} />
              Use this design
            </button>
            <button type="button" className="aib-btn-discard" onClick={handleDiscard}>
              Discard
            </button>
          </div>
        </>
      )}
    </div>
  );
}
