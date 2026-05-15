import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import GenericProductPreview3D from "../GenericProductCustomizer/GenericProductPreview3D";

export default function MugCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/cup.glb"
      PreviewComponent={GenericProductPreview3D}
      designType="mug"
      productLabel="mug"
      previewProps={{ projectionMode: "plane" }}
    />
  );
}
