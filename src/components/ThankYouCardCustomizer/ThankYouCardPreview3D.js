import FlatPreview3D from "../FlatCustomizer/FlatPreview3D";

export default function ThankYouCardPreview3D({
  shirtColor = "#ffffff",
  zoneDesigns = {},
}) {
  return (
    <FlatPreview3D
      productType="thank_you_card"
      baseColor={shirtColor}
      zoneDesigns={zoneDesigns}
    />
  );
}
