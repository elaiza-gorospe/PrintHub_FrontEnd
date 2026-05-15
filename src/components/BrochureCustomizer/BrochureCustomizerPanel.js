import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import GenericProductPreview3D from "../GenericProductCustomizer/GenericProductPreview3D";

export default function BrochureCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/brochure.glb"
      PreviewComponent={GenericProductPreview3D}
      designType="brochure"
      productLabel="brochure"
      previewProps={{ projectionMode: "plane" }}
    />
  );
}
