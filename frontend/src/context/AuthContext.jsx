import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchMe } from "../api/index.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      const cached = localStorage.getItem("user");
      if (token && cached) {
        setUser(JSON.parse(cached));
        try {
          const { data } = await fetchMe();
          setUser(data);
        } catch {
          // token invalid/expired - interceptor will redirect
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUserCache = (partial) => {
    setUser((prev) => {
      const merged = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserCache }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
