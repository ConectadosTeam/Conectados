import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [rolActivo, setRolActivo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRol = localStorage.getItem("rolActivo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedRol) {
      setRolActivo(storedRol);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.roles.length === 1) {
      setRolActivo(userData.roles[0]);
      localStorage.setItem("rolActivo", userData.roles[0]);
    }
  };

  const logout = () => {
    setUser(null);
    setRolActivo(null);
    localStorage.clear();
  };

  const register = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setRolActivo("BUSCADOR");
    localStorage.setItem("rolActivo", "BUSCADOR");
  };

  const changeRolActivo = (nuevoRol) => {
    setRolActivo(nuevoRol);
    localStorage.setItem("rolActivo", nuevoRol);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        rolActivo,
        setRolActivo: changeRolActivo,
        login,
        logout,
        register,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
