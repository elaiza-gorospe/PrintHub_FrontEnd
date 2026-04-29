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

export default function AIBuilderPanel({
  product,
  productImage,
  onDesignReady,
  onClear,
  activeDesign,
  ai_prompt_rules,
}) {
  // ── mode: "generate" | "upload" ────────────────────────────────
  const [mode, setMode] = useState("generate");

  // ── generate state ──────────────────────────────────────────────
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [cooldownMsg, setCooldownMsg] = useState("");

  // ── upload state ────────────────────────────────────────────────
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadedMeta, setUploadedMeta] = useState(null); // temporarily holds uploaded image
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadGenerating, setUploadGenerating] = useState(false);
  const fileInputRef = useRef(null);

  // ── result / editor state ───────────────────────────────────────
  // resultMeta: { url, width, height, seed, prompt, stored, path } | null
  const [resultMeta, setResultMeta] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [builderState, setBuilderState] = useState(null); // from AIBuilderEditor
  const [imgLoading, setImgLoading] = useState(false); // true while Pollinations image loads

  // ── helper to get current user id ──────────────────────────────
  const getUserId = () => {
    try {
      const u = localStorage.getItem("user");
      if (u) return JSON.parse(u).id;
    } catch {
      /* ignore */
    }
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
      const productName = product?.title || "";
      let fullPrompt = productName
        ? `A professional print design for ${productName}. ${prompt.trim()}. The design must be clearly suitable for ${productName}, high quality, print-ready.`
        : prompt.trim();

      // Append ai_prompt_rules if available
      if (ai_prompt_rules && ai_prompt_rules.trim()) {
        fullPrompt += `\n\n[Design Rules]: ${ai_prompt_rules}`;
      }

      const res = await fetch(buildApiUrl("/api/builder/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(userId),
        },
        body: JSON.stringify({ prompt: fullPrompt, productId: product?.id }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setCooldownMsg(data.message || "Please wait before generating again.");
        return;
      }
      if (!res.ok) throw new Error(data.message || "Generation failed");

      setImgLoading(true);
      setResultMeta({ ...data, prompt: fullPrompt, source: "generated" });
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

      // Build description with ai_prompt_rules
      let fullDescription = uploadDescription.trim();
      if (ai_prompt_rules && ai_prompt_rules.trim()) {
        fullDescription += fullDescription
          ? `\n\n[Design Rules]: ${ai_prompt_rules}`
          : `[Design Rules]: ${ai_prompt_rules}`;
      }

      if (fullDescription) {
        formData.append("description", fullDescription);
      }

      const res = await fetch(buildApiUrl("/api/builder/upload"), {
        method: "POST",
        headers: { "X-User-Id": String(userId) },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      // Store uploaded image temporarily - don't open editor yet
      setUploadedMeta({
        ...data,
        description: fullDescription || null,
      });
      setUploadError("");
    } catch (e) {
      setUploadError(e.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Generate from uploaded image ───────────────────────────────
  const handleGenerateFromUpload = async () => {
    if (!uploadedMeta) return;

    const userId = getUserId();
    if (!userId) {
      setUploadError("You must be logged in.");
      return;
    }

    setUploadGenerating(true);
    setUploadError("");

    try {
      // Use the uploaded image URL + description as prompt
      const sourcePrompt =
        uploadedMeta.description || "Refine and enhance this design.";

      const res = await fetch(buildApiUrl("/api/builder/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(userId),
        },
        body: JSON.stringify({
          prompt: sourcePrompt,
          productId: product?.id,
          sourceImageUrl: uploadedMeta.url,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setUploadError(data.message || "Please wait before generating again.");
        return;
      }
      if (!res.ok) throw new Error(data.message || "Generation failed");

      setImgLoading(true);
      setResultMeta({
        ...data,
        prompt: sourcePrompt,
        source: "generated",
        sourceImageUrl: uploadedMeta.url,
      });
      setShowEditor(true);
      setUploadedMeta(null);
    } catch (e) {
      setUploadError(e.message || "Something went wrong. Please try again.");
    } finally {
      setUploadGenerating(false);
    }
  };

  // ── Discard uploaded image ────────────────────────────────────
  const handleDiscardUpload = () => {
    setUploadedMeta(null);
    setUploadDescription("");
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Use this design ─────────────────────────────────────────────
  const handleUseDesign = () => {
    if (!resultMeta) return;
    const designMeta = {
      generatedImageUrl: resultMeta.url,
      sourceAssetUrls: resultMeta.source === "upload" ? [resultMeta.url] : [],
      prompt: resultMeta.prompt || null,
      seed: resultMeta.seed || null,
      source: resultMeta.source,
      storagePath: resultMeta.path || null,
      builderState: builderState || null,
      generatedAt: new Date().toISOString(),
    };
    onDesignReady(designMeta);
    // Close editor but stay in AI Builder tab to show applied design
    setShowEditor(false);
    setResultMeta(null);
    setBuilderState(null);
  };

  // ── Discard result ──────────────────────────────────────────────
  const handleDiscard = () => {
    setResultMeta(null);
    setShowEditor(false);
    setBuilderState(null);
    setUploadDescription("");
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
          <button
            className="aib-design-badge-clear"
            onClick={onClear}
            type="button"
          >
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
              placeholder={`e.g. "minimalist navy blue and gold design with logo" — ${product?.title ? `will be generated as a ${product.title}` : "product name added automatically"}`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="aib-row">
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
          <div className="aib-field">
            <label htmlFor="aib-upload-desc">
              Describe your design (optional)
            </label>
            <textarea
              id="aib-upload-desc"
              className="aib-textarea"
              rows={3}
              maxLength={1000}
              placeholder="e.g. 'Add gold accents and adjust colors to match our brand' — design rules will be applied automatically"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
            />
          </div>

          <div
            className="aib-upload-zone"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && fileInputRef.current?.click()
            }
          >
            <div className="aib-upload-icon">
              <FaCloudUploadAlt />
            </div>
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

          {/* Show uploaded image with Generate button */}
          {uploadedMeta && !uploading && (
            <>
              <div className="aib-upload-preview">
                <img src={uploadedMeta.url} alt="uploaded design" />
                <div className="aib-preview-label">Uploaded Image</div>
              </div>

              {uploadedMeta.description && (
                <div className="aib-upload-description">
                  <div className="aib-desc-label">Design Intent:</div>
                  <div className="aib-desc-text">
                    {uploadedMeta.description}
                  </div>
                </div>
              )}

              <div className="aib-upload-actions">
                <button
                  type="button"
                  className="aib-btn-generate"
                  onClick={handleGenerateFromUpload}
                  disabled={uploadGenerating}
                >
                  {uploadGenerating ? "Generating…" : "Generate Design"}
                </button>
                <button
                  type="button"
                  className="aib-btn-discard"
                  onClick={handleDiscardUpload}
                  disabled={uploadGenerating}
                >
                  Upload Different
                </button>
              </div>

              {uploadGenerating && (
                <div className="aib-status">
                  <span className="aib-spinner" />
                  Generating design from your image…
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Result + Editor ── */}
      {showEditor && resultMeta && (
        <>
          {resultMeta.prompt && (
            <div className="aib-editor-info">
              <div className="aib-info-label">Design Intent:</div>
              <div className="aib-info-text">{resultMeta.prompt}</div>
            </div>
          )}

          <AIBuilderEditor
            productImage={productImage}
            designImage={resultMeta.url}
            designSource={resultMeta.source}
            initialState={builderState}
            onChange={setBuilderState}
            imgLoading={imgLoading}
            onImgLoad={() => setImgLoading(false)}
          />

          <div className="aib-result-actions">
            <button
              type="button"
              className="aib-btn-use"
              onClick={handleUseDesign}
              disabled={imgLoading}
            >
              <FaCheckCircle style={{ marginRight: 6 }} />
              Use this design
            </button>
            <button
              type="button"
              className="aib-btn-discard"
              onClick={handleDiscard}
            >
              Discard
            </button>
          </div>
        </>
      )}
    </div>
  );
}
