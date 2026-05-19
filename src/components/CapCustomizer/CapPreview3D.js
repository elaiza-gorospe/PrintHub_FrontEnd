import GenericProductPreview3D from "../GenericProductCustomizer/GenericProductPreview3D";

export default function CapPreview3D(props) {
  return (
    <GenericProductPreview3D
      {...props}
      zoneFaceMap={{
        front: "front",
        back: "back",
        left_sleeve: "left",
        right_sleeve: "right",
      }}
      projectionMode={{
        front: "decal",
        back: "decal",
        left_sleeve: "decal",
        right_sleeve: "decal",
        default: "decal",
      }}
      decalScale={{
        front: { w: 0.34, h: 0.3, depth: 0.32, surfaceOffset: 0.025, y: 0.22 },
        back: { w: 0.32, h: 0.28, depth: 0.28, surfaceOffset: 0.015 },
        left_sleeve: { w: 0.28, h: 0.28, depth: 0.28, surfaceOffset: 0.015 },
        right_sleeve: { w: 0.28, h: 0.28, depth: 0.28, surfaceOffset: 0.015 },
      }}
    />
  );
}
