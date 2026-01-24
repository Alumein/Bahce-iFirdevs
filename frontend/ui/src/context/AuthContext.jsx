// Konum: frontend/ui/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
// JWT'yi decode etmek için basit bir fonksiyon (kütüphanesiz)
function parseJwt (token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

const API_URL = 'https://bahce-ifirdevs.com.tr/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('accessToken', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); 
  const [isAdmin, setIsAdmin] = useState(false); // YENİ: Admin mi?

  // Kullanıcıyı (veya Admin'i) belirleyen fonksiyon
  const resolveUser = async (accessToken) => {
    // 1. Token'daki rollere bak
    const decoded = parseJwt(accessToken);
    const roles = decoded ? decoded.roles : "";
    
    if (roles && roles.includes("ADMIN")) {
      // KULLANICI ADMIN İSE:
      // Admin'in veritabanında profili yok, manuel oluşturuyoruz
      setIsAdmin(true);
      setUser({ fullName: "Sistem Yöneticisi", email: decoded.sub, role: "ADMIN" });
      return true;
    } else {
      // KULLANICI MÜŞTERİ İSE:
      setIsAdmin(false);
      try {
        const response = await axios.get(`${API_URL}/customers/me`);
        setUser(response.data); 
        return true;
      } catch (err) {
        console.error("Profil çekilemedi:", err);
        return false;
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        setAuthToken(token); 
        await resolveUser(token);
      }
      setAuthLoading(false); 
    };
    initializeAuth();
  }, [token]);


  // GİRİŞ YAP
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: email,
        password: password
      });
      
      const newToken = response.data.accessToken;
      setAuthToken(newToken);
      
      // Kullanıcıyı veya Admin'i çözümle
      const success = await resolveUser(newToken);
      
      if (success) {
        setToken(newToken); 
        alert("Giriş başarılı!");
        return true;
      } else {
        alert("Giriş başarılı ama profil alınamadı.");
        setAuthToken(null);
        return false;
      }

    } catch (err) {
      console.error("Giriş hatası:", err);
      alert("Hata: E-posta veya şifre yanlış.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // KAYIT OL
  const register = async (fullName, email, phone, password) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/customers/register`, {
        fullName, email, phone, password
      });
      alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      return true;
    } catch (err) {
      console.error("Kayıt hatası:", err);
      alert("Hata: " + (err.response?.data?.message || "Kayıt hatası."));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ÇIKIŞ YAP
  const logout = () => {
    setAuthToken(null); 
    setToken(null);     
    setUser(null);
    setIsAdmin(false);
    alert("Çıkış yapıldı.");
  };

  const refreshUser = async () => {
    if (token) await resolveUser(token);
  };

  const value = {
    user,
    userEmail: user ? user.email : null,
    token,
    isAdmin, // YENİ: Dışarıya admin bilgisini veriyoruz
    login,
    register,
    logout,
    refreshUser,
    authLoading: loading || authLoading, 
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}