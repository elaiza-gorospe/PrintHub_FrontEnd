import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import BusinessCardPreview3D from "./BusinessCardPreview3D";

export default function BusinessCardCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/business_card.glb"
      PreviewComponent={BusinessCardPreview3D}
      designType="business_card"
      productLabel="business card"
    />
  );
}
