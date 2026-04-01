/**
 * Extract numeric price from formatted price strings
 * @param {string|number} price - formatted price like "₱1,270.50", "+ ₱462.00", "Free"
 * @returns {number} numeric price value (0 for "Free")
 */
export const extractNumericPrice = (price) => {
  if (typeof price === "number") return price;
  if (!price) return 0;
  if (price === "Free" || price.toString().toLowerCase() === "free") return 0;

  const numStr = String(price).replace(/[^\d.]/g, "");
  const num = parseFloat(numStr);
  return isNaN(num) ? 0 : num;
};

/**
 * Format price to PHP currency string
 * @param {number} price - numeric price
 * @returns {string} formatted price string
 */
export const formatPrice = (price) => {
  const num = extractNumericPrice(price);
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(num);
};
