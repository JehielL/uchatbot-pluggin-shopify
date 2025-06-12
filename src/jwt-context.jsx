// /app/jwt-context.jsx
import { createContext, useContext } from "react";

export const JwtContext = createContext(null);

export function useJwt() {
  return useContext(JwtContext);
}
