import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/services/api";

// Định nghĩa lại kiểu User cho khớp với Backend trả về
export interface User {
  id: number; // Backend trả về user_id là number
  username: string;
  name: string; // Backend trả về fullName, ta sẽ map sang name
  email: string;
  role: "admin" | "teacher" | "student";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string, name: string, role: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khi F5 trang web, kiểm tra xem còn Token không
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
      // Gọi API Login thật
      // Lưu ý: Backend của bạn đang nhận 'username', nhưng Frontend form đang ghi là 'email'
      // Tạm thời ta cứ gửi giá trị nhập vào username
      const response = await api.post("/login", { username, password });

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Map dữ liệu từ Backend sang format Frontend cần
        const mappedUser: User = {
          id: userData.id,
          username: userData.username,
          name: userData.fullName, // Backend trả về fullName
          email: userData.email,
          role: userData.role.toLowerCase(), // Backend trả 'Student', Frontend cần 'student'
        };

        // Lưu vào LocalStorage
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
      const response = await api.post("/register", { 
        username, 
        email, 
        password, 
        name, 
        role 
      });
      return response.data.success;
    } catch (error) {
      console.error("Register failed:", error);
      return false;
    }
};

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};