import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

// Create and export the context object
//export const AuthContext = createContext();
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/v1/auth/login", { email, password });
      const { accessToken, user } = response.data;

      setUser(user);
      setToken(accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      navigate(user.role === "admin" ? "/dashboard" : user.role === "wash_supervisor" ? "/washing" : user.role ==="production_manager" ? "/orders" : "/defectslist");
      toast.success(`Welcome back, ${user.name}`);
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    navigate("/");
    toast.info("Logged out successfully");
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
