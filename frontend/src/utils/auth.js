import { jwtDecode } from "jwt-decode";

export const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    clearStoredAuth();
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      clearStoredAuth();
      return false;
    }
  } catch {
    clearStoredAuth();
    return false;
  }

  return true;
};
