import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import GenericProductPreview3D from "../GenericProductCustomizer/GenericProductPreview3D";

export default function TarpaulinCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath={null}
      PreviewComponent={GenericProductPreview3D}
      designType="tarpaulin"
      productLabel="tarpaulin"
      previewProps={{
        projectionMode: "plane",
        flatShape: { width: 3.8, height: 1.9, depth: 0.03 },
        decalScale: { front: { w: 1, h: 1, surfaceOffset: 0.08 } },
      }}
    />
  );
}
