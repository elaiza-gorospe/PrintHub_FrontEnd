import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import GenericProductPreview3D from "../GenericProductCustomizer/GenericProductPreview3D";

export default function BusinessCardCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/business_card.glb"
      PreviewComponent={GenericProductPreview3D}
      designType="business_card"
      productLabel="business card"
      previewProps={{ projectionMode: "plane" }}
    />
  );
}
