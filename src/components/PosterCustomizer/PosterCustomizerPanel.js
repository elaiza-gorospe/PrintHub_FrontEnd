import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import PosterPreview3D from "./PosterPreview3D";

export default function PosterCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/posters.glb"
      PreviewComponent={PosterPreview3D}
      designType="poster"
      productLabel="poster"
    />
  );
}
