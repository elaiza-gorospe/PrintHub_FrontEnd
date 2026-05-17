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
        front: "plane",
        default: "decal",
      }}
      decalScale={{
        front: { w: 0.34, h: 0.3, depth: 0.55, surfaceOffset: 0.035, y: 0.22 },
        back: { w: 0.32, h: 0.28, depth: 0.45, surfaceOffset: 0.01 },
        left_sleeve: { w: 0.28, h: 0.28, depth: 0.45, surfaceOffset: 0.01 },
        right_sleeve: { w: 0.28, h: 0.28, depth: 0.45, surfaceOffset: 0.01 },
      }}
    />
  );
}
