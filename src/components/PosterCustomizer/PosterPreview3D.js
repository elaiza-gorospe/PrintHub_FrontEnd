import FlatPreview3D from "../FlatCustomizer/FlatPreview3D";

export default function PosterPreview3D({
  shirtColor = "#ffffff",
  zoneDesigns = {},
}) {
  return (
    <FlatPreview3D
      productType="poster"
      baseColor={shirtColor}
      zoneDesigns={zoneDesigns}
    />
  );
}
