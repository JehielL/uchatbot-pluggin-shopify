// src/routes/UserProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useJwt } from "./JwtProvider";

const UserContext = createContext({ email: null });

export function UserProvider({ children }) {
  const { token } = useJwt();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    if (!token) {
      setEmail(null);
      return;
    }
    // Cambia aquí la URL:
    fetch("https://desarrollosfutura.com:5001/chat/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setEmail(data.email || null))
      .catch(() => setEmail(null));
  }, [token]);

  return (
    <UserContext.Provider value={{ email, setEmail }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
