import { useState, useEffect } from "react";

const CART_STORAGE_KEY = "printHub_cart";

// Initialize cart from localStorage or empty array
const initializeCart = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse cart from localStorage:", e);
    return [];
  }
};

export function useCart() {
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
    } = product;

    setCartItems((prevItems) => {
      // Check if item with same customizations already exists
      const existingItem = prevItems.find(
        (item) =>
          item.productId === productId &&
          item.customizations?.size === size &&
          item.customizations?.material === material &&
          item.customizations?.sides === sides &&
          item.customizations?.finishing === finishing &&
          item.customizations?.quantity === quantity?.label &&
          item.customizations?.shipping === shipping?.label,
      );

      if (existingItem) {
        // Update quantity if item exists
        return prevItems.map((item) =>
          item.id === existingItem.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      // Add new item
      const newItem = {
        id: Date.now(), // Simple unique ID
        productId,
        title,
        price: parseFloat(quantity?.price || price),
        qty: 1,
        customizations: {
          size,
          material,
          sides,
          finishing,
          quantity: quantity?.label,
          quantityPrice: quantity?.price,
          shipping: shipping?.label,
          shippingPrice: shipping?.price,
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

  // Get cart count
  const cartCount = cartItems.length;

  // Get cart total
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
  };
}
