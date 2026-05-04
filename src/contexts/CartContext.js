import React, { createContext, useState, useEffect } from "react";
import { extractNumericPrice } from "../utils/priceUtils";

const CartContext = createContext();

const CART_STORAGE_KEY = "printHub_cart";

// Initialize cart from localStorage
const initializeCart = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const cart = JSON.parse(stored);

    // Migrate old cart items: ensure shippingPrice is numeric
    return cart.map((item) => ({
      ...item,
      customizations: {
        ...item.customizations,
        shippingPrice: extractNumericPrice(item.customizations?.shippingPrice),
      },
    }));
  } catch (e) {
    console.error("Failed to parse cart from localStorage:", e);
    return [];
  }
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(initializeCart());

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product) => {
    const {
      id,
      productId,
      title,
      price,
      size,
      material,
      sides,
      finishing,
      quantity,
      shipping,
      design,
    } = product;

    // Extract numeric quantity from label (e.g., "500 pcs" -> 500, "1000" -> 1000)
    const extractQuantityValue = (quantityLabel) => {
      if (!quantityLabel) return 1;
      const match = quantityLabel.toString().match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 1;
    };

    setCartItems((prevItems) => {
      const qtyValue = extractQuantityValue(quantity?.label);

      // Items with a design are always distinct — never merge them
      if (!design) {
        // Check if item with same customizations already exists (no design)
        const existingItem = prevItems.find(
          (item) =>
            item.productId === productId &&
            !item.customizations?.design &&
            item.customizations?.size === size &&
            item.customizations?.material === material &&
            item.customizations?.sides === sides &&
            item.customizations?.finishing === finishing &&
            item.customizations?.quantity === quantity?.label &&
            item.customizations?.shipping === shipping?.label,
        );

        if (existingItem) {
          return prevItems.map((item) =>
            item.id === existingItem.id
              ? { ...item, qty: item.qty + qtyValue }
              : item,
          );
        }
      }

      // Add new item with quantity extracted from quantity label
      const newItem = {
        id: Date.now(),
        productId,
        title,
        price: price,
        qty: qtyValue,
        customizations: {
          size,
          material,
          sides,
          finishing,
          quantity: quantity?.label,
          quantityPrice: quantity?.price,
          shipping: shipping?.label,
          shippingPrice: extractNumericPrice(shipping?.price),
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
    if (newQty < 1) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, qty: newQty } : item,
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
