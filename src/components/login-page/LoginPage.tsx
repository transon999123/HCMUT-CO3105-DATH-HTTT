// src/components/login-page/LoginPage.tsx
import { useState } from "react";
import logo from "../../assets/01_logobachkhoasang.png";

interface LoginPageProps {
  // Cập nhật: onLogin nhận username thay vì email
  onLogin: (username: string, password: string) => Promise<boolean>; 
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

export function LoginPage({
  onLogin,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}: LoginPageProps) {
  // 1. Đổi state từ email -> username
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setIsLoading(true);
      // 2. Gọi hàm login với username
      const success = await onLogin(username, password);
      if (!success) {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác");
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          {/* Logo and Title */}
          <div className="text-center mb-6">
            <img src={logo} alt="Logo" className="h-24 mx-auto mb-4 object-contain" />
            <h1 className="text-xl font-bold mb-2">BK EduClass</h1>
            <p className="text-gray-600">Hệ thống quản lý lớp học</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 mb-4 bg-red-50 text-red-700 rounded border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập
              </label>
              {/* 3. Input đổi thành text để nhập username */}
              <input
                type="text"
                placeholder="Nhập tên đăng nhập (VD: admin1)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-sm text-blue-600 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* 4. Nút Đăng nhập */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white py-2 px-4 rounded-md transition duration-200 font-medium
                ${isLoading 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <button
                onClick={onNavigateToRegister}
                className="text-blue-600 hover:underline font-medium"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}