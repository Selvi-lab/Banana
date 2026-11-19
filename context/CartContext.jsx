"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products as localProducts } from "@/data";

const CartContext = createContext(null);
const CART_KEY = "banafibre-cart";

function toPrice(value) {
  const parsed = Number(String(value ?? 0).replace(/[₹,\s]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function normalizeCartItem(item) {
  const id = item?.id ?? item?.product_id;
  const fallback = localProducts.find((product) => String(product.id) === String(id));
  const source = { ...(fallback || {}), ...(item || {}) };
  const quantity = Number(source.quantity ?? source.qty ?? 1);
  const price = toPrice(source.price ?? source.product_price ?? source.sale_price);

  return {
    ...source,
    id: String(id ?? ""),
    name: source.name ?? source.product_name ?? source.title ?? "BANAFIBRE product",
    price,
    image: source.image ?? source.image_url ?? source.product_image ?? "/images/placeholder.svg",
    quantity: Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1,
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      setCart(Array.isArray(parsed) ? parsed.map(normalizeCartItem).filter((item) => item.id) : []);
    } catch (error) {
      console.error("Could not restore BANAFIBRE cart:", error);
      setCart([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Could not save BANAFIBRE cart:", error);
    }
  }, [cart, ready]);

  useEffect(() => {
    function syncFromOtherTab(event) {
      if (event.key !== CART_KEY) return;
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : [];
        setCart(Array.isArray(parsed) ? parsed.map(normalizeCartItem).filter((item) => item.id) : []);
      } catch {
        setCart([]);
      }
    }
    window.addEventListener("storage", syncFromOtherTab);
    return () => window.removeEventListener("storage", syncFromOtherTab);
  }, []);

  function addToCart(product, requestedQuantity = 1) {
    const normalized = normalizeCartItem(product);
    const quantity = Number(requestedQuantity);
    if (!normalized.id || normalized.price <= 0) {
      console.error("Invalid product passed to addToCart:", product);
      return false;
    }
    const safeQuantity = Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1;

    setCart((previous) => {
      const found = previous.find((item) => item.id === normalized.id);
      if (found) {
        return previous.map((item) =>
          item.id === normalized.id
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item
        );
      }
      return [...previous, { ...normalized, quantity: safeQuantity }];
    });
    return true;
  }

  function updateQuantity(id, quantity) {
    const safeQuantity = Number(quantity);
    if (!Number.isSafeInteger(safeQuantity) || safeQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart((previous) =>
      previous.map((item) =>
        item.id === String(id) ? { ...item, quantity: safeQuantity } : item
      )
    );
  }

  function removeFromCart(id) {
    setCart((previous) => previous.filter((item) => item.id !== String(id)));
  }

  function clearCart() {
    setCart([]);
  }

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + toPrice(item.price) * item.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider value={{
      cart,
      ready,
      totalItems,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be inside CartProvider");
  return context;
}
