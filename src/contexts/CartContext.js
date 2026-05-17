import React, { createContext, useState, useEffect } from "react";
import { buildApiUrl } from "../config/api";

const CartContext = createContext();

const CART_STORAGE_KEY = "printHub_cart";

// Initialize cart from localStorage
const initializeCart = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const cart = JSON.parse(stored);

    return cart.map((item) => {
      const rawMaterial = item.customizations?.material;
      const normalizedMaterial =
        rawMaterial && typeof rawMaterial === "object"
          ? {
              label: String(rawMaterial.label || ""),
              price: String(rawMaterial.price || ""),
            }
          : {
              label: rawMaterial ? String(rawMaterial) : "",
              price: "",
            };

      const existingProductImage =
        item.productImage ||
        (item.product && item.product.images && item.product.images[0]) ||
        (item.images && item.images[0]) ||
        item.customizations?.design?.generatedImageUrl ||
        null;

      const migrated = { ...item };
      const qtyLabel = item.customizations?.quantity;
      const match = qtyLabel ? String(qtyLabel).match(/(\d+)/) : null;
      const labelNumber = match ? parseInt(match[1], 10) : null;
      if (labelNumber && item.qty && item.qty === labelNumber) {
        migrated.qty = 1;
      }

      return {
        ...migrated,
        productImage: existingProductImage,
        customizations: {
          ...item.customizations,
          material: normalizedMaterial,
        },
      };
    });
  } catch (e) {
    console.error("Failed to parse cart from localStorage:", e);
    return [];
  }
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(initializeCart());

  // Enrich existing cart items with product images when missing
  React.useEffect(() => {
    const missing = cartItems.filter((it) => !it.productImage && it.productId);
    if (missing.length === 0) return;

    // fetch details for unique productIds only
    const ids = [...new Set(missing.map((i) => i.productId))];

    let cancelled = false;

    const fetchImages = async () => {
      try {
        const fetched = {};
        await Promise.all(
          ids.map(async (pid) => {
            try {
              const res = await fetch(buildApiUrl(`/api/products/${pid}`));
              if (!res.ok) return;
              const data = await res.json();
              // API may return product or { product }
              const prod = data.product || data;
              fetched[pid] =
                (prod.images && prod.images[0]) || prod.image || null;
            } catch (e) {
              // ignore per-item errors
            }
          }),
        );

        if (cancelled) return;

        setCartItems((prev) =>
          prev.map((it) =>
            !it.productImage && fetched[it.productId]
              ? { ...it, productImage: fetched[it.productId] }
              : it,
          ),
        );
      } catch (e) {
        // ignore
      }
    };

    fetchImages();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product) => {
    const {
      productId,
      title,
      price,
      size,
      material,
      sides,
      finishing,
      quantity,
      design,
      images,
      productImage,
    } = product;

    const normalizedMaterial =
      material && typeof material === "object"
        ? {
            label: String(material.label || ""),
            price: String(material.price || ""),
          }
        : {
            label: material ? String(material) : "",
            price: "",
          };

    setCartItems((prevItems) => {
      const packQty = 1;

      if (!design) {
        const existingItem = prevItems.find(
          (item) =>
            item.productId === productId &&
            !item.customizations?.design &&
            item.customizations?.size === size &&
            (item.customizations?.material?.label || "") ===
              normalizedMaterial.label &&
            (item.customizations?.material?.price || "") ===
              normalizedMaterial.price &&
            item.customizations?.sides === sides &&
            item.customizations?.finishing === finishing &&
            item.customizations?.quantity === quantity?.label,
        );

        if (existingItem) {
          return prevItems.map((item) =>
            item.id === existingItem.id
              ? { ...item, qty: item.qty + packQty }
              : item,
          );
        }
      }

      const newItem = {
        id: Date.now(),
        productId,
        title,
        price,
        qty: packQty,
        productImage: productImage || (images && images[0]) || null,
        customizations: {
          size,
          material: normalizedMaterial,
          sides,
          finishing,
          quantity: quantity?.label,
          quantityPrice: quantity?.price,
          ...(design ? { design } : {}),
        },
      };

      return [...prevItems, newItem];
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  // Update quantity
  const updateQuantity = (itemId, newQty) => {
    // Sanitize input: accept integers only
    const parsed = parseInt(newQty, 10);
    const finalQty = isNaN(parsed) ? 1 : Math.floor(parsed);

    if (finalQty < 1) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, qty: finalQty } : item,
      ),
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export { CartContext };
