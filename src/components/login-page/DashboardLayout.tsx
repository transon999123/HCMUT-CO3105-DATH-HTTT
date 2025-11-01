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
        { id: "profile", label: "Hồ sơ cá nhân", icon: UserCircle },
      ];
    } else if (user.role === "teacher") {
      return [
        { id: "courses", label: "Quản lý lớp học", icon: BookOpen },
        { id: "assignments", label: "Quản lý bài tập", icon: FileText },
        { id: "documents", label: "Quản lý tài liệu", icon: FileText },
        { id: "students", label: "Quản lý sinh viên", icon: Users },
        { id: "profile", label: "Hồ sơ cá nhân", icon: UserCircle },
      ];
    } else {
      return [
        { id: "users", label: "Quản lý người dùng", icon: Users },
        { id: "courses", label: "Quản lý lớp học", icon: BookOpen },
        { id: "profile", label: "Hồ sơ cá nhân", icon: UserCircle },
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

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      admin: "Quản trị viên",
      teacher: "Giảng viên",
      student: "Sinh viên",
    };
    return labels[role] || role;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
            <div className="flex items-center gap-2">
              <div className="h-24 rounded-lg flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-24" />
              </div>
              <div className="text-blue-600 font-semibold">BK EduClass</div>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info in Sidebar */}
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-3">
              {/* AVATAR MÀU XANH ĐẬM HƠN */}
              <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white shadow-md">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{user.name}</div>
                <div className="text-xs text-gray-600">
                  {getRoleLabel(user.role)}
                </div>
              </div>
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700"
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {menuItems.find((item) => item.id === currentPage)?.label ||
                "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Info - AVATAR MÀU XANH ĐẬM HƠN */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white shadow-md">
                {getInitials(user.name)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-600">
                  {getRoleLabel(user.role)}
                </div>
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
