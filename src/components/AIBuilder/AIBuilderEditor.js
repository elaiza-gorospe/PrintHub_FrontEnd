/**
 * AIBuilderEditor — simple drag-and-resize design editor.
 * Lets users position the generated/uploaded image and add a text element
 * on top of a faint product-image backdrop.
 *
 * Props:
 *   productImage  {string}  – background (the current product hero image)
 *   designImage   {string}  – the generated / uploaded asset URL
 *   initialState  {object}  – optional previously-saved builder state
 *   onChange      {fn}      – called with the latest builderState JSON whenever anything changes
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./AIBuilder.css";

const DEFAULT_LAYER = { x: 10, y: 10, w: 60, h: 60 }; // percent of canvas size
const DEFAULT_TEXT = { x: 10, y: 75, text: "", color: "#ffffff", size: 20, visible: false };

export default function AIBuilderEditor({ productImage, designImage, initialState, onChange }) {
  const canvasRef = useRef(null);

  const [imgLayer, setImgLayer] = useState(
    initialState?.imgLayer || { ...DEFAULT_LAYER }
  );
  const [textLayer, setTextLayer] = useState(
    initialState?.textLayer || { ...DEFAULT_TEXT }
  );

  // Emit state upward whenever layers change
  useEffect(() => {
    if (onChange) onChange({ imgLayer, textLayer, designImage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgLayer, textLayer]);

  // ── Drag for image layer ────────────────────────────────────────
  const imgDrag = useRef(null);

  const onImgPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = canvasRef.current.getBoundingClientRect();
    imgDrag.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: imgLayer.x,
      origY: imgLayer.y,
      rectW: rect.width,
      rectH: rect.height,
    };
  }, [imgLayer]);

  const onImgPointerMove = useCallback((e) => {
    if (!imgDrag.current) return;
    const { startX, startY, origX, origY, rectW, rectH } = imgDrag.current;
    const dx = ((e.clientX - startX) / rectW) * 100;
    const dy = ((e.clientY - startY) / rectH) * 100;
    setImgLayer((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(100 - prev.w, origX + dx)),
      y: Math.max(0, Math.min(100 - prev.h, origY + dy)),
    }));
  }, []);

  const onImgPointerUp = useCallback(() => {
    imgDrag.current = null;
  }, []);

  // ── Resize for image layer ──────────────────────────────────────
  const imgResize = useRef(null);

  const onResizePointerDown = useCallback((e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = canvasRef.current.getBoundingClientRect();
    imgResize.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: imgLayer.w,
      origH: imgLayer.h,
      rectW: rect.width,
      rectH: rect.height,
    };
  }, [imgLayer]);

  const onResizePointerMove = useCallback((e) => {
    if (!imgResize.current) return;
    const { startX, startY, origW, origH, rectW, rectH } = imgResize.current;
    const dw = ((e.clientX - startX) / rectW) * 100;
    const dh = ((e.clientY - startY) / rectH) * 100;
    setImgLayer((prev) => ({
      ...prev,
      w: Math.max(10, Math.min(100 - prev.x, origW + dw)),
      h: Math.max(10, Math.min(100 - prev.y, origH + dh)),
    }));
  }, []);

  const onResizePointerUp = useCallback(() => {
    imgResize.current = null;
  }, []);

  // ── Drag for text layer ────────────────────────────────────────
  const txtDrag = useRef(null);

  const onTxtPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = canvasRef.current.getBoundingClientRect();
    txtDrag.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: textLayer.x,
      origY: textLayer.y,
      rectW: rect.width,
      rectH: rect.height,
    };
  }, [textLayer]);

  const onTxtPointerMove = useCallback((e) => {
    if (!txtDrag.current) return;
    const { startX, startY, origX, origY, rectW, rectH } = txtDrag.current;
    const dx = ((e.clientX - startX) / rectW) * 100;
    const dy = ((e.clientY - startY) / rectH) * 100;
    setTextLayer((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(90, origX + dx)),
      y: Math.max(3, Math.min(97, origY + dy)),
    }));
  }, []);

  const onTxtPointerUp = useCallback(() => {
    txtDrag.current = null;
  }, []);

  return (
    <div className="aib-editor">
      {/* Canvas */}
      <div className="aib-editor-canvas-wrap" ref={canvasRef}>
        {/* Faint product background */}
        {productImage && (
          <img src={productImage} alt="" className="aib-editor-bg" draggable={false} />
        )}

        {/* Image layer */}
        {designImage && (
          <div
            className="aib-editor-design-layer"
            style={{
              left: `${imgLayer.x}%`,
              top: `${imgLayer.y}%`,
              width: `${imgLayer.w}%`,
              height: `${imgLayer.h}%`,
            }}
            onPointerDown={onImgPointerDown}
            onPointerMove={onImgPointerMove}
            onPointerUp={onImgPointerUp}
          >
            <img src={designImage} alt="design" />
            <div
              className="aib-editor-resize-handle"
              onPointerDown={onResizePointerDown}
              onPointerMove={onResizePointerMove}
              onPointerUp={onResizePointerUp}
            />
          </div>
        )}

        {/* Text layer */}
        {textLayer.visible && textLayer.text && (
          <div
            className="aib-editor-text-layer"
            style={{
              left: `${textLayer.x}%`,
              top: `${textLayer.y}%`,
              color: textLayer.color,
              fontSize: `${textLayer.size}px`,
            }}
            onPointerDown={onTxtPointerDown}
            onPointerMove={onTxtPointerMove}
            onPointerUp={onTxtPointerUp}
          >
            {textLayer.text}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="aib-editor-controls">
        <p style={{ margin: 0, fontSize: 12, color: "#7e8b92" }}>
          Drag the design to reposition. Drag the blue dot to resize.
        </p>

        {/* Text controls */}
        <div className="aib-ctrl-row">
          <span className="aib-ctrl-label">Text</span>
          <input
            className="aib-ctrl-input"
            type="text"
            placeholder="Add text overlay…"
            value={textLayer.text}
            onChange={(e) =>
              setTextLayer((p) => ({ ...p, text: e.target.value, visible: e.target.value.length > 0 }))
            }
          />
        </div>

        {textLayer.text && (
          <>
            <div className="aib-ctrl-row">
              <span className="aib-ctrl-label">Color</span>
              <input
                className="aib-ctrl-color"
                type="color"
                value={textLayer.color}
                onChange={(e) => setTextLayer((p) => ({ ...p, color: e.target.value }))}
              />
              <span className="aib-ctrl-label" style={{ minWidth: 36 }}>Size</span>
              <input
                className="aib-ctrl-range"
                type="range"
                min={10}
                max={72}
                value={textLayer.size}
                onChange={(e) => setTextLayer((p) => ({ ...p, size: parseInt(e.target.value, 10) }))}
              />
              <span style={{ fontSize: 12, color: "#7e8b92", width: 28 }}>{textLayer.size}px</span>
            </div>
          </>
        )}

        {/* Image opacity */}
        <div className="aib-ctrl-row">
          <span className="aib-ctrl-label">Opacity</span>
          <input
            className="aib-ctrl-range"
            type="range"
            min={10}
            max={100}
            value={imgLayer.opacity ?? 100}
            onChange={(e) =>
              setImgLayer((p) => ({ ...p, opacity: parseInt(e.target.value, 10) }))
            }
          />
          <span style={{ fontSize: 12, color: "#7e8b92", width: 34 }}>
            {imgLayer.opacity ?? 100}%
          </span>
        </div>
      </div>
    </div>
  );
}
