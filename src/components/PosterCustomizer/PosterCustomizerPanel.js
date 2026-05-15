import TshirtCustomizerPanel from "../TshirtCustomizer/TshirtCustomizerPanel";
import GenericProductPreview3D from "../GenericProductCustomizer/GenericProductPreview3D";

export default function PosterCustomizerPanel(props) {
  return (
    <TshirtCustomizerPanel
      {...props}
      modelPath="/models/posters.glb"
      PreviewComponent={GenericProductPreview3D}
      designType="poster"
      productLabel="poster"
      previewProps={{ projectionMode: "plane" }}
    />
  );
}
