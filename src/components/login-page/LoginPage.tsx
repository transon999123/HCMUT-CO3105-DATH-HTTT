// LoginPage.tsx (đã đơn giản hóa)
import { useState } from "react";
import logo from "../../assets/01_logobachkhoasang.png";

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

export function LoginPage({
  onLogin,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const success = onLogin(email, password);
    if (!success) {
      setError("Email hoặc mật khẩu không chính xác");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border p-6">
          {/* Logo and Title */}
          <div className="text-center mb-6">
            <img src={logo} alt="Logo" className="h-24 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">BK EduClass</h1>
            <p className="text-gray-600">Hệ thống quản lý lớp học</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 mb-4 bg-red-50 text-red-700 rounded border border-red-200">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="example@bkedu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Đăng nhập
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <button
                onClick={onNavigateToRegister}
                className="text-blue-600 hover:underline"
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
