import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { setAuthToken } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("token");
    if (!t) return null;
    try {
      const p = jwtDecode(t);
      return { token: t, id: p.id, role: p.role, exp: p.exp };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user?.token) {
      setAuthToken(user.token);
      // auto logout at expiry
      const now = Date.now() / 1000;
      const ttl = (user.exp - now) * 1000;
      if (ttl <= 0) return logout();
      const timer = setTimeout(logout, ttl);
      return () => clearTimeout(timer);
    } else setAuthToken(null);
  }, [user]);

  const login = ({ token, user: u }) => {
    localStorage.setItem("token", token);
    setUser({ token, id: u.id, role: u.role, exp: jwtDecode(token).exp });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
