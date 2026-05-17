/**
 * TshirtZoneCanvas
 * Renders a 2×2 grid of print zones. Each zone supports drag and resize
 * for a placed image. Clicking an empty zone selects it as the active target.
 *
 * Props:
 *   zones          {string[]}  – active zone ids for this product
 *   zoneDesigns    {object}    – { zoneId: { imageUrl, x, y, w, h } | null }
 *   activeZone     {string}    – currently selected zone id
 *   onZoneSelect   {fn}        – called with zoneId when a zone is clicked
 *   onZoneDesignChange {fn}    – called with (zoneId, layer) where layer is { imageUrl, x, y, w, h } | null
 */
import React, { useCallback, useRef } from "react";
import "./TshirtCustomizer.css";

const ZONE_META = [
  { id: "left_sleeve", label: "LEFT SLEEVE", col: 1, row: 1 },
  { id: "right_sleeve", label: "RIGHT SLEEVE", col: 2, row: 1 },
  { id: "front", label: "FRONT", col: 1, row: 2 },
  { id: "back", label: "BACK", col: 2, row: 2 },
  { id: "outside", label: "OUTSIDE", col: 1, row: 3 },
  { id: "inside", label: "INSIDE", col: 2, row: 3 },
  { id: "front_cover", label: "FRONT COVER", col: 1, row: 4 },
  { id: "back_cover", label: "BACK COVER", col: 2, row: 4 },
];

function ZoneBox({ meta, design, isActive, onSelect, onDesignChange }) {
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  // ── drag ──────────────────────────────────────────────────────────
  const onImgPointerDown = useCallback(
    (e) => {
      if (!design) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = containerRef.current.getBoundingClientRect();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: design.x,
        origY: design.y,
        rectW: rect.width,
        rectH: rect.height,
      };
    },
    [design],
  );

  const onImgPointerMove = useCallback(
    (e) => {
      if (!dragRef.current || !design) return;
      const { startX, startY, origX, origY, rectW, rectH } = dragRef.current;
      const dx = ((e.clientX - startX) / rectW) * 100;
      const dy = ((e.clientY - startY) / rectH) * 100;
      onDesignChange({
        ...design,
        x: Math.max(0, Math.min(100 - design.w, origX + dx)),
        y: Math.max(0, Math.min(100 - design.h, origY + dy)),
      });
    },
    [design, onDesignChange],
  );

  const onImgPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // ── resize ─────────────────────────────────────────────────────────
  const onResizePointerDown = useCallback(
    (e) => {
      if (!design) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = containerRef.current.getBoundingClientRect();
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origW: design.w,
        origH: design.h,
        rectW: rect.width,
        rectH: rect.height,
      };
    },
    [design],
  );

  const onResizePointerMove = useCallback(
    (e) => {
      if (!resizeRef.current || !design) return;
      const { startX, startY, origW, origH, rectW, rectH } = resizeRef.current;
      const dw = ((e.clientX - startX) / rectW) * 100;
      const dh = ((e.clientY - startY) / rectH) * 100;
      onDesignChange({
        ...design,
        w: Math.max(10, Math.min(100 - design.x, origW + dw)),
        h: Math.max(10, Math.min(100 - design.y, origH + dh)),
      });
    },
    [design, onDesignChange],
  );

  const onResizePointerUp = useCallback(() => {
    resizeRef.current = null;
  }, []);

  return (
    <div
      className={`tsc-zone${isActive ? " active" : ""}${design ? " has-image" : ""}`}
      onClick={onSelect}
    >
      <div className="tsc-zone-inner" ref={containerRef}>
        {design ? (
          <>
            {/* placed image layer */}
            <div
              className="tsc-zone-design-layer"
              style={{
                left: `${design.x}%`,
                top: `${design.y}%`,
                width: `${design.w}%`,
                height: `${design.h}%`,
              }}
              onPointerDown={onImgPointerDown}
              onPointerMove={onImgPointerMove}
              onPointerUp={onImgPointerUp}
            >
              <img src={design.imageUrl} alt="design" draggable={false} />
              <div
                className="tsc-zone-resize-handle"
                onPointerDown={onResizePointerDown}
                onPointerMove={onResizePointerMove}
                onPointerUp={onResizePointerUp}
              />
            </div>

            {/* clear button */}
            <button
              type="button"
              className="tsc-zone-clear-btn"
              title="Remove design from this zone"
              onClick={(e) => {
                e.stopPropagation();
                onDesignChange(null);
              }}
            >
              ×
            </button>
          </>
        ) : (
          <div className="tsc-zone-placeholder">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <span>
              {isActive ? "Click gallery to place" : "Click to select"}
            </span>
          </div>
        )}
      </div>
      <div className="tsc-zone-label">{meta.label}</div>
    </div>
  );
}

export default function TshirtZoneCanvas({
  zones = [],
  zoneDesigns = {},
  activeZone,
  onZoneSelect,
  onZoneDesignChange,
}) {
  const visibleZones = ZONE_META.filter((m) => zones.includes(m.id));

  if (visibleZones.length === 0) {
    return (
      <div
        style={{
          color: "#aab",
          fontSize: 13,
          textAlign: "center",
          padding: "20px 0",
        }}
      >
        No print zones configured for this product.
      </div>
    );
  }

  return (
    <div className="tsc-canvas-wrap">
      <p className="tsc-canvas-hint">
        Click a zone to select it, then click a gallery image to place it.
      </p>
      <div className="tsc-zone-grid">
        {visibleZones.map((meta) => (
          <ZoneBox
            key={meta.id}
            meta={meta}
            design={zoneDesigns[meta.id] || null}
            isActive={activeZone === meta.id}
            onSelect={() => onZoneSelect(meta.id)}
            onDesignChange={(layer) => onZoneDesignChange(meta.id, layer)}
          />
        ))}
      </div>
    </div>
  );
}
