import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import CapPreview3D from "./CapPreview3D";

export default function CapCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/cap.glb"
      PreviewComponent={CapPreview3D}
      designType="cap"
      productLabel="cap"
    />
  );
}
