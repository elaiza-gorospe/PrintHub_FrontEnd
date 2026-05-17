import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import GenericProductPreview3D from "../GenericProductCustomizer/GenericProductPreview3D";

export default function ThankYouCardCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/business_card.glb"
      PreviewComponent={GenericProductPreview3D}
      designType="thank_you_card"
      productLabel="thank you card"
      previewProps={{ projectionMode: "plane" }}
    />
  );
}
