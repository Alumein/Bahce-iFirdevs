// Konum: frontend/ui/src/context/WishlistContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_URL = 'http://localhost:8080/api';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]); 
  const [loading, setLoading] = useState(false);

  // Favorileri Çek
  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/favorites/me`);
      setWishlist(response.data); // Backend ProductDto listesi döner
    } catch (err) {
      console.error("Favoriler çekilemedi:", err);
    }
  };

  // Giriş durumu değiştiğinde favorileri güncelle
  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  // Favori Ekle/Çıkar (Toggle)
  const toggleFavorite = async (productId) => {
    if (!isAuthenticated) {
      alert("Favorilere eklemek için giriş yapmalısınız.");
      return;
    }

    // Bu ürün zaten listede mi?
    const isInWishlist = wishlist.some(p => p.id === productId);
    
    try {
      if (isInWishlist) {
        // Çıkar (DELETE)
        await axios.delete(`${API_URL}/favorites/remove/${productId}`);
        // State'ten anında çıkar (Hızlı tepki)
        setWishlist(prev => prev.filter(p => p.id !== productId));
      } else {
        // Ekle (POST)
        await axios.post(`${API_URL}/favorites/add/${productId}`);
        // Listeyi yenile (Eklenen ürünün tüm detaylarını almak için)
        await fetchWishlist(); 
      }
    } catch (err) {
      console.error("Favori işlemi başarısız:", err);
      alert("İşlem gerçekleştirilemedi.");
    }
  };

  // Bir ürünün favori olup olmadığını kontrol et
  const isFavorite = (productId) => {
    return wishlist.some(p => p.id === productId);
  };

  const value = {
    wishlist,
    toggleFavorite,
    isFavorite,
    loading
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}