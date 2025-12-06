import React, { createContext, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthenticated = !!token;

  const login = async (credentials) => {
    const { token: newToken, user: newUser } = await authService.login(
      credentials
    );
    sessionStorage.setItem("token", newToken);
    sessionStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
