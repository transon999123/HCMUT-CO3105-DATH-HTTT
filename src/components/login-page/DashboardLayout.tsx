// DashboardLayout.tsx (đã đơn giản hóa)
import { ReactNode, useState } from "react";
import logo from "../../assets/01_logobachkhoasang.png";
import { User } from "../../lib/mockData";
import {
  BookOpen,
  FileText,
  UserCircle,
  Users,
  LogOut,
  Bell,
  Menu,
} from "lucide-react";

interface DashboardLayoutProps {
  user: User;
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function DashboardLayout({
  user,
  children,
  currentPage,
  onNavigate,
  onLogout,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getMenuItems = () => {
    if (user.role === "student") {
      return [
        { id: "courses", label: "Lớp học của tôi", icon: BookOpen },
        { id: "assignments", label: "Bài tập", icon: FileText },
        { id: "documents", label: "Tài liệu", icon: FileText },
        { id: "profile", label: "Hồ sơ", icon: UserCircle },
      ];
    } else if (user.role === "teacher") {
      return [
        { id: "courses", label: "Lớp học", icon: BookOpen },
        { id: "assignments", label: "Bài tập", icon: FileText },
        { id: "documents", label: "Tài liệu", icon: FileText },
        { id: "students", label: "Sinh viên", icon: Users },
        { id: "profile", label: "Hồ sơ", icon: UserCircle },
      ];
    } else {
      return [
        { id: "users", label: "Người dùng", icon: Users },
        { id: "courses", label: "Lớp học", icon: BookOpen },
        { id: "profile", label: "Hồ sơ", icon: UserCircle },
      ];
    }
  };

  const menuItems = getMenuItems();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-white border-r transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b px-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="w-24" />
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                {getInitials(user.name)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-600">{user.role}</div>
              </div>
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border text-gray-600 rounded hover:bg-gray-50"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              className="p-2 hover:bg-gray-100 rounded"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {menuItems.find((item) => item.id === currentPage)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded">
              <Bell className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                {getInitials(user.name)}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{user.name}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
