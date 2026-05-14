/**
 * Category Defaults
 * Pre-filled product options and AI prompt rules per product category.
 * Used in Admin Add/Edit Product modals to auto-populate fields.
 */

const COLOR_OPTIONS = [
  "Full Color (CMYK)",
  "Black & White",
  "1 Color (Spot)",
  "2 Colors (Spot)",
];

const SIDE_OPTIONS = ["Single Side", "Double Side"];

const FINISHING_OPTIONS = [
  "None",
  "Gloss Lamination",
  "Matte Lamination",
  "Spot UV",
  "Foil Stamping",
  "Embossing",
  "Die Cutting",
  "Rounded Corners",
  "Perforation",
  "Scoring & Folding",
];

const PROCESSING_OPTIONS = ["Standard", "Rush (24 hrs)", "Express (48 hrs)"];

const DELIVERY_OPTIONS = [
  "Pick Up",
  "Metro Manila Delivery",
  "Provincial Delivery",
  "Same Day (Metro Manila)",
];

export const CATEGORY_DEFAULTS = {
  "Business Card": {
    print_type: "offset",
    material: "14pt Card Stock",
    color_options: COLOR_OPTIONS,
    size_options: [
      "Standard 3.5x2 in",
      "Square 2.5x2.5 in",
      "Mini 3.5x1.5 in",
      "Folded 3.5x4 in",
    ],
    material_options: [
      "14pt Card Stock",
      "16pt Card Stock",
      "100lb Gloss Cover",
      "100lb Matte Cover",
      "Kraft Paper",
      "Linen Stock",
    ],
    side_options: SIDE_OPTIONS,
    finishing_options: FINISHING_OPTIONS,
    processing_options: PROCESSING_OPTIONS,
    delivery_options: DELIVERY_OPTIONS,
    quantity_options: [
      "100 pcs|₱350.00",
      "250 pcs|₱550.00",
      "500 pcs|₱850.00",
      "1000 pcs|₱1,200.00",
    ],
    shipping_options: ["Pick Up|Free", "Delivery|₱150.00"],
    ai_prompt_rules:
      "Generate a professional business card design. Use clean typography and ample white space. Brand colors must be used prominently. Include name, title, email, phone, and website. No clipart. No gradients unless part of approved branding. Bleed area: 0.125in on all sides. Text must be at least 7pt. Resolution: 300dpi minimum.",
  },

  Brochures: {
    print_type: "offset",
    material: "130gsm Gloss Paper",
    color_options: COLOR_OPTIONS,
    size_options: [
      "Tri-Fold A4",
      "Bi-Fold A4",
      "Tri-Fold Letter",
      "Bi-Fold Letter",
      "Z-Fold A4",
    ],
    material_options: [
      "100gsm Gloss Paper",
      "130gsm Gloss Paper",
      "150gsm Gloss Paper",
      "100gsm Matte Paper",
      "130gsm Matte Paper",
    ],
    side_options: ["Double Side"],
    finishing_options: [
      "None",
      "Gloss Lamination",
      "Matte Lamination",
      "Spot UV",
    ],
    processing_options: PROCESSING_OPTIONS,
    delivery_options: DELIVERY_OPTIONS,
    quantity_options: [
      "100 pcs|₱2,500.00",
      "250 pcs|₱4,000.00",
      "500 pcs|₱6,500.00",
      "1000 pcs|₱10,000.00",
    ],
    shipping_options: ["Pick Up|Free", "Delivery|₱200.00"],
    ai_prompt_rules:
      "Generate a clean, structured brochure layout. Each panel must have a clear purpose: cover, inside content, back contact info. Use consistent brand colors and fonts throughout. Product/service descriptions must be concise. Include at least one image placeholder per panel. Fold lines must be accounted for in the layout. Resolution: 300dpi minimum.",
  },

  "Stickers & Labels": {
    print_type: "digital",
    material: "Glossy Vinyl",
    color_options: COLOR_OPTIONS,
    size_options: [
      "1x1 in",
      "2x2 in",
      "3x3 in",
      "2x4 in",
      "3x5 in",
      "Custom Size",
    ],
    material_options: [
      "Glossy Vinyl",
      "Matte Vinyl",
      "Clear Vinyl",
      "White Bond",
      "Kraft Label",
      "Holographic",
    ],
    side_options: ["Single Side"],
    finishing_options: [
      "None",
      "Gloss Lamination",
      "Matte Lamination",
      "Die Cutting",
      "Kiss Cut",
      "Rounded Corners",
    ],
    processing_options: PROCESSING_OPTIONS,
    delivery_options: DELIVERY_OPTIONS,
    quantity_options: [
      "50 pcs|₱250.00",
      "100 pcs|₱400.00",
      "250 pcs|₱750.00",
      "500 pcs|₱1,200.00",
      "1000 pcs|₱2,000.00",
    ],
    shipping_options: ["Pick Up|Free", "Delivery|₱100.00"],
    ai_prompt_rules:
      "Generate a compact, visually striking sticker or label design. Design must be fully contained within the die-cut shape with 0.1in bleed. Important elements (logo, text) must be 0.125in from cut edge. Background must reach the bleed line. No thin strokes less than 0.5pt. For clear vinyl: design must work without a white background. Resolution: 300dpi minimum.",
  },

  "Hang Tags": {
    print_type: "offset",
    material: "350gsm Card Stock",
    color_options: COLOR_OPTIONS,
    size_options: [
      "2x3.5 in",
      "2x4 in",
      "2.5x4 in",
      "3x5 in",
      "Rounded 2x3.5 in",
    ],
    material_options: [
      "300gsm Card Stock",
      "350gsm Card Stock",
      "Kraft Paper",
      "White Matte Board",
    ],
    side_options: SIDE_OPTIONS,
    finishing_options: [
      "None",
      "Gloss Lamination",
      "Matte Lamination",
      "Spot UV",
      "Foil Stamping",
      "Embossing",
      "Die Cutting",
      "Hole Punching",
    ],
    processing_options: PROCESSING_OPTIONS,
    delivery_options: DELIVERY_OPTIONS,
    quantity_options: [
      "100 pcs|₱800.00",
      "250 pcs|₱1,500.00",
      "500 pcs|₱2,500.00",
      "1000 pcs|₱4,000.00",
    ],
    shipping_options: ["Pick Up|Free", "Delivery|₱150.00"],
    ai_prompt_rules:
      "Generate an elegant, brand-consistent hang tag design. Front: logo, product name, tagline. Back: barcode placeholder, price, care instructions, or social handles. Include hole punch position at top center (0.25in from edge, 0.1875in diameter). Maintain 0.125in bleed and 0.125in safe zone. Luxury feel preferred: minimal text, strong typography. Resolution: 300dpi minimum.",
  },

  Banners: {
    print_type: "large-format",
    material: "13oz Vinyl",
    color_options: ["Full Color (CMYK)"],
    size_options: [
      "1x2 ft",
      "2x3 ft",
      "2x4 ft",
      "3x4 ft",
      "3x6 ft",
      "4x6 ft",
      "4x8 ft",
      "Custom Size",
    ],
    material_options: [
      "13oz Vinyl",
      "16oz Vinyl (Outdoor)",
      "Mesh Vinyl (Wind-resistant)",
      "Canvas",
      "Backlit Film",
    ],
    side_options: ["Single Side"],
    finishing_options: [
      "None",
      "Eyelets / Grommets",
      "Hemming",
      "Pole Pockets",
    ],
    processing_options: PROCESSING_OPTIONS,
    delivery_options: DELIVERY_OPTIONS,
    quantity_options: [
      "1 pc|₱350.00",
      "2 pcs|₱650.00",
      "5 pcs|₱1,500.00",
      "10 pcs|₱2,800.00",
    ],
    shipping_options: ["Pick Up|Free", "Delivery|₱300.00"],
    ai_prompt_rules:
      "Generate a large format banner design viewable from a distance. Text must be large — minimum 1in tall per 10ft viewing distance. Use maximum 3 fonts. High contrast between text and background is mandatory. Include logo at top or bottom. Business name/event must be prominent. Add bleed: 0.5in on all sides. Avoid fine details — they will not be visible at distance. Resolution: 100dpi at final print size (72dpi minimum).",
  },

  Notebook: {
    print_type: "offset",
    material: "Softcover (300gsm)",
    color_options: COLOR_OPTIONS,
    size_options: ["A4", "A5", "A6", "Pocket (3.5x5.5 in)"],
    material_options: [
      "Softcover (300gsm)",
      "Hardcover",
      "Kraft Cover",
      "Leatherette Cover",
    ],
    side_options: ["Single Side"],
    finishing_options: [
      "None",
      "Gloss Lamination",
      "Matte Lamination",
      "Spot UV",
      "Embossing",
      "Foil Stamping",
      "Spiral Binding",
      "Saddle Stitch",
    ],
    processing_options: PROCESSING_OPTIONS,
    delivery_options: DELIVERY_OPTIONS,
    quantity_options: [
      "25 pcs|₱3,000.00",
      "50 pcs|₱5,500.00",
      "100 pcs|₱10,000.00",
      "200 pcs|₱18,000.00",
    ],
    shipping_options: ["Pick Up|Free", "Delivery|₱300.00"],
    ai_prompt_rules:
      "Generate a professional notebook cover design. Cover must feature the brand logo prominently. Use clean layout with title area. Spine width must be accounted for in the layout. Back cover: include website, tagline, or barcode placeholder. Colors must be consistent with brand identity. Embossing/foil areas must be marked as separate spot layers. Bleed: 0.125in. Resolution: 300dpi minimum.",
  },

  "T-shirts": {
    print_type: "screen-print",
    material: "100% Cotton - 150gsm",
    color_options: [
      "Full Color (CMYK) - Direct-to-Garment",
      "Full Color (Plastisol) - Screen Print",
      "Single Color - Screen Print",
      "Multi-Color - Screen Print",
    ],
    size_options: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    material_options: [
      "100% Cotton - 150gsm",
      "100% Cotton - 180gsm",
      "Cotton/Poly Blend - 160gsm",
      "100% Polyester - 140gsm",
      "Organic Cotton - 150gsm",
    ],
    side_options: [
      "Front Chest",
      "Back",
      "Front & Back",
      "Sleeve",
      "Full Body Wrap",
    ],
    finishing_options: [
      "None",
      "Heat Transfer",
      "Embroidery",
      "Puff Print",
      "Foil",
      "Rhinestone",
      "Glow-in-the-Dark",
      "Metallic Print",
    ],
    processing_options: [
      "Standard (5-7 days)",
      "Rush (3-4 days)",
      "Express (1-2 days)",
    ],
    delivery_options: DELIVERY_OPTIONS,
    quantity_options: [
      "5 pcs|₱500.00",
      "10 pcs|₱450.00",
      "25 pcs|₱420.00",
      "50 pcs|₱400.00",
      "100 pcs|₱380.00",
      "250 pcs|₱350.00",
      "500 pcs|₱320.00",
    ],
    shipping_options: [
      "Pick Up|Free",
      "Metro Delivery|₱150.00",
      "Provincial|₱300.00",
    ],
    ai_prompt_rules:
      "Generate a vibrant T-shirt design optimized for screen printing or DTG. For screen print: limit to 4-6 colors for cost efficiency. Design must work on the specified print area (chest, back, sleeve, or full). Include color specifications in CMYK or PMS if multi-color. Avoid small fine details that won't transfer well. Design should scale well across all sizes. Safe margin: 0.25in from print edges. For DTG: can use full color spectrum without limitations. Include a mockup guide indicating where the design sits on the garment. Resolution: 300dpi minimum.",
  },
  "Jersey": {
    "print_type": "screen-print",
    "material": "100% Polyester - 140gsm",
    "color_options": [
      "Full Color (CMYK) - Sublimation",
      "Full Color (Plastisol) - Screen Print",
      "Single Color - Screen Print",
      "Multi-Color - Screen Print"
    ],
    "size_options": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    "material_options": [
      "100% Polyester - 140gsm",
      "100% Polyester - 160gsm",
      "Cotton/Poly Blend - 150gsm",
      "Moisture Wicking - 130gsm",
      "Mesh Fabric - 120gsm"
    ],
    "side_options": [
      "Front",
      "Back",
      "Front & Back",
      "Sleeve (Left)",
      "Sleeve (Right)",
      "Full Sublimation"
    ],
    "finishing_options": [
      "None",
      "Embroidery",
      "Heat Transfer",
      "Sublimation",
      "Screen Print",
      "Name & Number Print"
    ],
    "processing_options": [
      "Standard (7-10 days)",
      "Rush (4-5 days)",
      "Express (2-3 days)"
    ],
    "delivery_options": DELIVERY_OPTIONS,
    "quantity_options": [
      "5 pcs|₱1,200.00",
      "10 pcs|₱1,100.00",
      "25 pcs|₱1,000.00",
      "50 pcs|₱900.00",
      "100 pcs|₱800.00",
      "250 pcs|₱700.00"
    ],
    "shipping_options": [
      "Pick Up|Free",
      "Metro Delivery|₱150.00",
      "Provincial|₱300.00"
    ],
    "ai_prompt_rules": "Generate a sporty jersey design. For sublimation: full color with seamless edges, no color limitations. For screen print: max 4-6 colors. Design must include front chest area, back (optional number area), and sleeve options. Maintain safe margin of 0.5in from seams. High contrast numbers if included. Avoid designs that stretch across seams. Resolution: 300dpi minimum. Include placement guide for all print areas."
  },
  "Cap": {
    "print_type": "embroidery",
    "material": "Cotton Twill",
    "color_options": [
      "Single Color - Embroidery",
      "Multi-Color (max 4) - Embroidery",
      "Full Color - Heat Transfer",
      "Full Color - DTG"
    ],
    "size_options": ["One Size (Adjustable)", "S/M", "L/XL", "Custom Fit"],
    "material_options": [
      "Cotton Twill",
      "Polyester",
      "Cotton/Poly Blend",
      "Mesh Back",
      "Denim",
      "Acrylic Wool",
      "Leather Patch"
    ],
    "side_options": [
      "Front Center",
      "Left Panel",
      "Right Panel",
      "Back Closure",
      "Full Panel"
    ],
    "finishing_options": [
      "None",
      "Embroidery",
      "Heat Transfer",
      "3D Embroidery (Puffy)",
      "Leather Patch",
      "PVC Patch",
      "Velcro Backing"
    ],
    "processing_options": [
      "Standard (5-7 days)",
      "Rush (3-4 days)",
      "Express (1-2 days)"
    ],
    "delivery_options": DELIVERY_OPTIONS,
    "quantity_options": [
      "10 pcs|₱650.00",
      "25 pcs|₱600.00",
      "50 pcs|₱550.00",
      "100 pcs|₱500.00",
      "250 pcs|₱450.00",
      "500 pcs|₱400.00"
    ],
    "shipping_options": [
      "Pick Up|Free",
      "Metro Delivery|₱150.00",
      "Provincial|₱250.00"
    ],
    "ai_prompt_rules": "Generate a cap/hat design. For embroidery: limit to max 4 colors, use simple shapes (no small details under 2mm), text minimum 5mm tall. Provide stitch count estimate. For patch: include border outline. Design must fit within 4x2 inches max for front panel. Center placement is default. Include mockup showing curved surface wrap. Vector format preferred. Resolution: 300dpi minimum for print, vector for embroidery."
  },
  "Mug": {
    "print_type": "digital",
    "material": "Ceramic - 11oz",
    "color_options": ["Full Color (CMYK) - Sublimation"],
    "size_options": [
      "11oz (Standard)",
      "15oz (Large)",
      "10oz (Travel)",
      "12oz (Tall)",
      "Whiskey Glass"
    ],
    "material_options": [
      "Ceramic - 11oz",
      "Ceramic - 15oz",
      "Enamel - 12oz",
      "Glass - 11oz",
      "Stainless Steel",
      "Travel Mug with Lid"
    ],
    "side_options": ["360° Wrap", "Front Only", "Front & Back", "Two Sides"],
    "finishing_options": [
      "None",
      "Gloss Finish",
      "Matte Finish",
      "Color Inside",
      "Color Handle"
    ],
    "processing_options": [
      "Standard (5-7 days)",
      "Rush (3-4 days)",
      "Express (2 days)"
    ],
    "delivery_options": DELIVERY_OPTIONS,
    "quantity_options": [
      "10 pcs|₱350.00",
      "25 pcs|₱320.00",
      "50 pcs|₱290.00",
      "100 pcs|₱260.00",
      "250 pcs|₱230.00",
      "500 pcs|₱200.00"
    ],
    "shipping_options": [
      "Pick Up|Free",
      "Metro Delivery|₱150.00",
      "Provincial|₱350.00"
    ],
    "ai_prompt_rules": "Generate a mug design for sublimation printing. Full color CMYK with no limitations. For 360° wrap: design width 9.25 inches x 3.5 inches height (for 11oz). Keep important elements (logo, text) within front-facing 4x3 inch safe zone. Avoid placing text on handle side or bottom. Seam allowance: 0.125in at both ends. High resolution photos acceptable. White background = white ceramic. Resolution: 300dpi minimum at print size."
  },
};

export const CATEGORY_NAMES = Object.keys(CATEGORY_DEFAULTS);

/** Returns a blank form state with empty option arrays */
export const blankProductForm = (extra = {}) => ({
  name: "",
  sku: "",
  price: "",
  stock: "",
  print_type: "offset",
  material: "",
  description: "",
  ai_prompt_rules: "",
  images: [],
  color_options: [],
  size_options: [],
  material_options: [],
  side_options: [],
  finishing_options: [],
  processing_options: [],
  delivery_options: [],
  quantity_options: [],
  shipping_options: [],
  ...extra,
});
