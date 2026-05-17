import FlatPreview3D from "../FlatCustomizer/FlatPreview3D";

export default function BusinessCardPreview3D({
  shirtColor = "#ffffff",
  zoneDesigns = {},
}) {
  return (
    <FlatPreview3D
      productType="business_card"
      baseColor={shirtColor}
      zoneDesigns={zoneDesigns}
    />
  );
}
