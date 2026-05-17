import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import ThankYouCardPreview3D from "./ThankYouCardPreview3D";

export default function ThankYouCardCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/business_card.glb"
      PreviewComponent={ThankYouCardPreview3D}
      designType="thank_you_card"
      productLabel="thank you card"
    />
  );
}
