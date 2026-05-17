import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import GenericProductPreview3D from "../GenericProductCustomizer/GenericProductPreview3D";

export default function JerseyCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/jersey.glb"
      PreviewComponent={GenericProductPreview3D}
      designType="jersey"
      productLabel="jersey"
      previewProps={{
        projectionMode: "plane",
        decalScale: {
          front: { w: 0.42, h: 0.42, surfaceOffset: 0.04 },
          back: { w: 0.42, h: 0.42, surfaceOffset: 0.04 },
          left_sleeve: { w: 0.24, h: 0.24, surfaceOffset: 0.04 },
          right_sleeve: { w: 0.24, h: 0.24, surfaceOffset: 0.04 },
        },
      }}
    />
  );
}
