import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import FlyerPreview3D from "./FlyerPreview3D";

export default function FlyerCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/posters.glb"
      PreviewComponent={FlyerPreview3D}
      designType="flyer"
      productLabel="flyer"
    />
  );
}
