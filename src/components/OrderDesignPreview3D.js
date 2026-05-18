import React from "react";
import GenericProductPreview3D from "./GenericProductCustomizer/GenericProductPreview3D";
import NotebookPreview3D from "./NotebookCustomizer/NotebookPreview3D";
import TshirtPreview3D from "./TshirtCustomizer/TshirtPreview3D";
import "./TshirtCustomizer/TshirtCustomizer.css";

const PREVIEW_CONFIGS = {
  tshirt: { kind: "tshirt", modelPath: "/models/tshirt.glb" },
  "t-shirt": { kind: "tshirt", modelPath: "/models/tshirt.glb" },
  "t-shirts": { kind: "tshirt", modelPath: "/models/tshirt.glb" },
  shirt: { kind: "tshirt", modelPath: "/models/tshirt.glb" },
  notebook: { kind: "notebook", modelPath: "/models/notebook.glb" },
  jersey: {
    kind: "generic",
    modelPath: "/models/jersey.glb",
    projectionMode: "plane",
    decalScale: {
      front: { w: 0.42, h: 0.42, surfaceOffset: 0.04 },
      back: { w: 0.42, h: 0.42, surfaceOffset: 0.04 },
      left_sleeve: { w: 0.24, h: 0.24, surfaceOffset: 0.04 },
      right_sleeve: { w: 0.24, h: 0.24, surfaceOffset: 0.04 },
    },
  },
  cap: { kind: "generic", modelPath: "/models/cap.glb" },
  mug: {
    kind: "generic",
    modelPath: "/models/cup.glb",
    projectionMode: "plane",
  },
  business_card: {
    kind: "generic",
    projectionMode: "plane",
    flatShape: { width: 3.5, height: 2, depth: 0.035 },
    decalScale: {
      front: { w: 1, h: 1, surfaceOffset: 0.08 },
      back: { w: 1, h: 1, surfaceOffset: 0.08 },
    },
  },
  calling_card: {
    kind: "generic",
    projectionMode: "plane",
    flatShape: { width: 3.5, height: 2, depth: 0.035 },
    decalScale: {
      front: { w: 1, h: 1, surfaceOffset: 0.08 },
      back: { w: 1, h: 1, surfaceOffset: 0.08 },
    },
  },
  brochure: {
    kind: "generic",
    projectionMode: "plane",
    flatShape: { width: 2.97, height: 2.1, depth: 0.035, foldLines: 2 },
    decalScale: {
      front: { w: 1, h: 1, surfaceOffset: 0.08 },
      back: { w: 1, h: 1, surfaceOffset: 0.08 },
    },
  },
  brochures: {
    kind: "generic",
    projectionMode: "plane",
    flatShape: { width: 2.97, height: 2.1, depth: 0.035, foldLines: 2 },
    decalScale: {
      front: { w: 1, h: 1, surfaceOffset: 0.08 },
      back: { w: 1, h: 1, surfaceOffset: 0.08 },
    },
  },
  flyer: {
    kind: "generic",
    projectionMode: "plane",
    flatShape: { width: 2.1, height: 2.97, depth: 0.035 },
    decalScale: {
      front: { w: 1, h: 1, surfaceOffset: 0.08 },
      back: { w: 1, h: 1, surfaceOffset: 0.08 },
    },
  },
  poster: {
    kind: "generic",
    projectionMode: "plane",
    flatShape: { width: 2.1, height: 2.97, depth: 0.035 },
    decalScale: { front: { w: 1, h: 1, surfaceOffset: 0.08 } },
  },
  sticker: {
    kind: "generic",
    projectionMode: "plane",
    flatShape: { width: 2.3, height: 2.3, depth: 0.03, radius: 1 },
    decalScale: { front: { w: 0.9, h: 0.9, surfaceOffset: 0.08 } },
  },
  stickers: {
    kind: "generic",
    projectionMode: "plane",
    flatShape: { width: 2.3, height: 2.3, depth: 0.03, radius: 1 },
    decalScale: { front: { w: 0.9, h: 0.9, surfaceOffset: 0.08 } },
  },
  hang_tag: {
    kind: "generic",
    projectionMode: "plane",
    flatShape: { width: 1.7, height: 3, depth: 0.04, hole: true },
    decalScale: {
      front: { w: 0.92, h: 0.92, surfaceOffset: 0.08 },
      back: { w: 0.92, h: 0.92, surfaceOffset: 0.08 },
    },
  },
  hang_tags: {
    kind: "generic",
    projectionMode: "plane",
    flatShape: { width: 1.7, height: 3, depth: 0.04, hole: true },
    decalScale: {
      front: { w: 0.92, h: 0.92, surfaceOffset: 0.08 },
      back: { w: 0.92, h: 0.92, surfaceOffset: 0.08 },
    },
  },
  tarpaulin: {
    kind: "generic",
    projectionMode: "plane",
    flatShape: { width: 3.8, height: 1.9, depth: 0.03 },
    decalScale: { front: { w: 1, h: 1, surfaceOffset: 0.08 } },
  },
  thank_you_card: {
    kind: "generic",
    projectionMode: "plane",
    flatShape: { width: 3.5, height: 2, depth: 0.035 },
    decalScale: {
      front: { w: 1, h: 1, surfaceOffset: 0.08 },
      back: { w: 1, h: 1, surfaceOffset: 0.08 },
    },
  },
};

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function inferType({ design, item, product }) {
  const direct = normalize(design?.previewType || design?.type);
  if (PREVIEW_CONFIGS[direct]) return direct;

  const productText = normalize(
    [
      product?.category,
      product?.name,
      product?.title,
      item?.product?.category,
      item?.product?.name,
      item?.product?.title,
    ]
      .filter(Boolean)
      .join(" "),
  );

  if (productText.includes("business_card") || productText.includes("calling_card")) return "business_card";
  if (productText.includes("thank_you")) return "thank_you_card";
  if (productText.includes("hang_tag")) return "hang_tag";
  if (productText.includes("tarpaulin") || productText.includes("banner")) return "tarpaulin";
  if (productText.includes("brochure")) return "brochure";
  if (productText.includes("flyer")) return "flyer";
  if (productText.includes("poster")) return "poster";
  if (productText.includes("sticker") || productText.includes("label")) return "sticker";
  if (productText.includes("notebook")) return "notebook";
  if (productText.includes("jersey")) return "jersey";
  if (productText.includes("cap") || productText.includes("hat")) return "cap";
  if (productText.includes("mug") || productText.includes("cup")) return "mug";
  if (productText.includes("shirt") || productText.includes("tshirt")) return "tshirt";

  return direct || "tshirt";
}

export function has3DDesign(item) {
  const design = item?.customizations?.design || item?.design;
  return Boolean(
    design &&
      (Object.values(design.zones || {}).some((zone) => zone?.imageUrl) ||
        design.generatedImageUrl ||
        design.imageUrl),
  );
}

export default function OrderDesignPreview3D({ item, product, design: designProp }) {
  const design = designProp || item?.customizations?.design || item?.design || {};
  const type = inferType({ design, item, product });
  const storedConfig = design.previewConfig || {};
  const config = { ...(PREVIEW_CONFIGS[type] || PREVIEW_CONFIGS.tshirt), ...storedConfig };
  const zoneDesigns =
    design.zones && Object.keys(design.zones).length
      ? design.zones
      : {
          front: {
            imageUrl: design.generatedImageUrl || design.imageUrl,
          },
        };
  const color = design.shirtColor || design.productColor || design.baseColor || "#ffffff";

  if (config.kind === "notebook") {
    return <NotebookPreview3D modelPath={config.modelPath || "/models/notebook.glb"} zoneDesigns={zoneDesigns} />;
  }

  if (config.kind === "tshirt") {
    return (
      <TshirtPreview3D
        modelPath={config.modelPath || "/models/tshirt.glb"}
        shirtColor={color}
        zoneDesigns={zoneDesigns}
      />
    );
  }

  return (
    <GenericProductPreview3D
      modelPath={config.modelPath || null}
      shirtColor={color}
      zoneDesigns={zoneDesigns}
      projectionMode={config.projectionMode}
      flatShape={config.flatShape}
      decalScale={config.decalScale}
      zoneFaceMap={config.zoneFaceMap}
    />
  );
}
