import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import JerseyPreview3D from "./JerseyPreview3D";

export default function JerseyCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/jersey.glb"
      PreviewComponent={JerseyPreview3D}
      designType="jersey"
      productLabel="jersey"
      previewProps={{
        projectionMode: "decal",
        decalScale: {
          front: { w: 0.42, h: 0.42, depth: 0.16, surfaceOffset: 0.02 },
          back: { w: 0.42, h: 0.42, depth: 0.16, surfaceOffset: 0.02 },
          left_sleeve: { w: 0.24, h: 0.24, depth: 0.12, surfaceOffset: 0.02 },
          right_sleeve: { w: 0.24, h: 0.24, depth: 0.12, surfaceOffset: 0.02 },
        },
      }}
    />
  );
}
