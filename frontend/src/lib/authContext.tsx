import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api"; // Lưu ý đường dẫn import api của bạn

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  avatar?: string; // <--- THÊM DÒNG NÀY (để lưu URL ảnh)
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>; // Sửa lại param name cho khớp logic
  logout: () => void;
  register: (username: string, email: string, password: string, name: string, role: string) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void; // <--- THÊM HÀM NÀY
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post("/login", { username, password });

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        const mappedUser: User = {
          id: userData.id,
          username: userData.username,
          name: userData.fullName,
          email: userData.email,
          role: userData.role.toLowerCase(),
          avatar: userData.avatar // <--- Map thêm avatar từ API trả về
        };

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(mappedUser));
        
        setUser(mappedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const register = async (username: string, email: string, password: string, name: string, role: string) => {
    try {
      const response = await api.post("/register", { username, email, password, name, role });
      return response.data.success;
    } catch (error) {
      console.error("Register failed:", error);
      return false;
    }
  };

  // --- HÀM MỚI: CẬP NHẬT USER STATE ---
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...userData };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser)); // Lưu lại vào LocalStorage để F5 không mất
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};