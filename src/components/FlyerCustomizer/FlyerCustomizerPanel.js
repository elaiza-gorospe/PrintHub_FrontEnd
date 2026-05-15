import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import GenericProductPreview3D from "../GenericProductCustomizer/GenericProductPreview3D";

export default function FlyerCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/posters.glb"
      PreviewComponent={GenericProductPreview3D}
      designType="flyer"
      productLabel="flyer"
      previewProps={{ projectionMode: "plane" }}
    />
  );
}
