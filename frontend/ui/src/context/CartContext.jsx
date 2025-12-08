// Konum: frontend/ui/src/context/CartContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_URL = 'http://localhost:8080/api';
const GUEST_CART_ID_KEY = 'guestCartId';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null); 
  const [cartId, setCartId] = useState(() => localStorage.getItem(GUEST_CART_ID_KEY));
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { isAuthenticated, userEmail } = useAuth(); 

  const getCartKey = () => {
    if (isAuthenticated && userEmail) {
      return userEmail; 
    }
    let currentGuestId = cartId;
    if (!currentGuestId) {
      currentGuestId = crypto.randomUUID();
      localStorage.setItem(GUEST_CART_ID_KEY, currentGuestId);
      setCartId(currentGuestId);
    }
    return currentGuestId;
  };
  
  const getHeaders = () => {
    const key = getCartKey();
    let headers = {};
    if (key && !isAuthenticated) {
      headers['X-Cart-ID'] = key;
    }
    return headers;
  };

  const refreshCart = async () => {
    setInitialLoading(true);
    const key = getCartKey();
    
    if (!key) { 
      setCart({ items: [], totalTry: 0 });
      setInitialLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API_URL}/cart`, { headers: getHeaders() });
      setCart(response.data.cart);
    } catch (err) {
      console.error("Sepet yenileme hatası:", err);
      setCart({ items: [], totalTry: 0 });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !userEmail) return; 
    refreshCart(); 
  }, [isAuthenticated, userEmail]);


  // SEPETE EKLE
  const addToCart = async (productId, quantity) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/cart/add`,
        { productId, quantity },
        { headers: getHeaders() }
      );
      setCart(response.data.cart); 
      if (!isAuthenticated) setCartId(response.data.cartId);
      alert("Ürün sepete eklendi!");
    } catch (err) {
      console.error("Sepete ekleme hatası:", err);
      alert("Hata: " + (err.response?.data?.message || "Ürün sepete eklenemedi."));
    } finally {
      setLoading(false);
    }
  };

  // SEPETTEN SİL
  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_URL}/cart/remove/${productId}`,
        { headers: getHeaders() }
      );
      setCart(response.data.cart);
      if (!isAuthenticated) setCartId(response.data.cartId);
    } catch (err) {
      console.error("Sepetten silme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  // ADET GÜNCELLE
  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/cart/update`,
        { productId, quantity },
        { headers: getHeaders() }
      );
      setCart(response.data.cart);
      if (!isAuthenticated) setCartId(response.data.cartId);
    } catch (err) {
      console.error("Adet güncelleme hatası:", err);
      alert("Hata: " + (err.response?.data?.message || "Adet güncellenemedi."));
    } finally {
      setLoading(false);
    }
  };

  // KUPON UYGULA
  const applyCoupon = async (code) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/cart/coupon`, { code }, { headers: getHeaders() });
      setCart(response.data.cart);
      alert("Kupon uygulandı!");
      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Kupon uygulanamadı.");
      return false;
    } finally { setLoading(false); }
  };

  // KUPON KALDIR
  const removeCoupon = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(`${API_URL}/cart/coupon`, { headers: getHeaders() });
      setCart(response.data.cart);
    } catch (err) { console.error("Kupon silme hatası:", err); } 
    finally { setLoading(false); }
  };

  const value = {
    cart, cartId, addToCart, removeFromCart, updateQuantity, 
    refreshCart, getHeaders, applyCoupon, removeCoupon,
    cartLoading: loading, cartInitialLoading: initialLoading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}