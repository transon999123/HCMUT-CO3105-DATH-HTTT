// src/components/login-page/ForgotPasswordPage.tsx
import { useState } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import logo from "../../assets/01_logobachkhoasang.png";
import api from "../../services/api";

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

export function ForgotPasswordPage({
  onNavigateToLogin,
}: ForgotPasswordPageProps) {
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // BƯỚC 1: Gửi Email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/verify-email", { email });
      setMessage("Mã xác nhận demo là: 123456");
      setStep("code");
    } catch (err: any) {
      setError(err.response?.data?.message || "Email không tồn tại hoặc lỗi hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  // BƯỚC 2: Xác thực mã
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code) {
      setError("Vui lòng nhập mã xác nhận");
      return;
    }

    if (code === "123456") {
      setMessage("");
      setStep("reset");
    } else {
      setError("Mã xác nhận không đúng (Gợi ý: 123456)");
    }
  };

  // BƯỚC 3: Đổi mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/reset-password", { 
        email, 
        newPassword 
      });

      setMessage("Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        onNavigateToLogin();
      }, 2000);
    } catch (err: any) {
      setError("Lỗi khi đổi mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-24 mb-4">
              <img
                src={logo}
                alt="Logo"
                className="h-full object-contain"
              />
            </div>
            {/* FIXED: Dùng text-primary thay vì text-blue-600 */}
            <h1 className="text-2xl font-bold text-primary mb-2">
              Quên mật khẩu
            </h1>
            <p className="text-gray-600 text-sm">
              {step === "email" && "Nhập email đã đăng ký để lấy lại mật khẩu"}
              {step === "code" && "Nhập mã xác nhận (Demo: 123456)"}
              {step === "reset" && "Đặt lại mật khẩu mới"}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">
              {message}
            </div>
          )}

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
              </div>
              {/* FIXED: Nút Gửi mã - Dùng bg-primary */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:opacity-90 py-2 px-4 rounded-md transition duration-200 font-medium"
              >
                {isLoading ? "Đang kiểm tra..." : "Gửi mã xác nhận"}
              </button>
            </form>
          )}

          {/* Code Verification Step */}
          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Mã xác nhận</label>
                <input
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {/* FIXED: Nút Xác nhận - Dùng bg-primary */}
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:opacity-90 py-2 px-4 rounded-md transition duration-200 font-medium"
              >
                Xác nhận
              </button>
            </form>
          )}

          {/* Reset Password Step */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {/* FIXED: Nút Đổi mật khẩu - Dùng bg-primary */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:opacity-90 py-2 px-4 rounded-md transition duration-200 font-medium"
              >
                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={onNavigateToLogin}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}