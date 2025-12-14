import { ReactNode, useState, useEffect, useRef } from "react";
import logo from "../../assets/01_logobachkhoasang.png";
import { User } from "../../lib/authContext";
import {
  BookOpen,
  UserCircle,
  Users,
  LogOut,
  Bell,
  Menu,
  ChevronLeft,
  School // Icon dùng làm logo khi thu nhỏ sidebar
} from "lucide-react";
import api from "../../services/api";

interface DashboardLayoutProps {
  user: User;
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string, data?: any) => void;
  onLogout: () => void;
}

export function DashboardLayout({
  user,
  children,
  currentPage,
  onNavigate,
  onLogout,
}: DashboardLayoutProps) {
  // Trạng thái mở/đóng sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);

  // 1. Polling: Tự động lấy thông báo mới mỗi 10 giây
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. Click ra ngoài để đóng dropdown thông báo
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setShowNotiDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      // Silent error để không làm phiền người dùng
    }
  };

  const handleNotiClick = async (noti: any) => {
    // Đánh dấu đã đọc
    await api.put("/notifications/read");
    setUnreadCount(0);
    setShowNotiDropdown(false);
    fetchNotifications();

    // Điều hướng đến link (nếu có)
    if (noti.link) {
      const [page, queryString] = noti.link.split("?");
      const params = new URLSearchParams(queryString);
      const data: any = {};
      for (const [key, value] of params.entries()) {
        data[key] = value;
      }
      onNavigate(page, data);
    }
  };

  const getMenuItems = () => {
    if (user.role === "student") {
      return [
        { id: "courses", label: "Lớp học của tôi", icon: BookOpen },
        { id: "profile", label: "Hồ sơ", icon: UserCircle },
      ];
    } else if (user.role === "teacher") {
      return [
        { id: "courses", label: "Quản lý lớp học", icon: BookOpen },
        { id: "profile", label: "Hồ sơ", icon: UserCircle },
      ];
    } else {
      return [
        { id: "users", label: "Quản lý tài khoản", icon: Users },
        { id: "courses", label: "Quản lý lớp học", icon: BookOpen },
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
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* --- SIDEBAR --- */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        } shadow-sm z-20`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100 relative">
          <div className="flex items-center gap-2 overflow-hidden transition-all duration-300">
            {sidebarOpen ? (
              <img src={logo} alt="Logo" className="h-8 object-contain animate-in fade-in" />
            ) : (
              <School className="w-8 h-8 text-blue-600 animate-in zoom-in" />
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={!sidebarOpen ? item.label : ""} // Tooltip khi thu nhỏ
                className={`
                  w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? "bg-blue-50 text-blue-600 font-medium shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }
                  ${!sidebarOpen ? "justify-center" : "gap-3"}
                `}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${!sidebarOpen && "w-6 h-6"} ${isActive && "text-blue-600"}`} />
                
                {/* Text Label - Chỉ hiện khi mở sidebar */}
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 origin-left ${
                  sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0 hidden"
                }`}>
                  {item.label}
                </span>

                {/* Dấu chỉ thị đang active (bên phải) */}
                {isActive && sidebarOpen && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer User Info */}
        <div className="border-t border-gray-100 p-3">
          <div className={`flex items-center p-2 rounded-xl bg-gray-50 border border-gray-200 transition-all ${!sidebarOpen ? "justify-center" : "gap-3"}`}>
            
            {/* LOGIC HIỂN THỊ AVATAR */}
            {user.avatar ? (
                <img 
                src={user.avatar} 
                alt="Avatar" 
                className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
                />
            ) : (
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-sm font-bold text-blue-700 shadow-sm shrink-0 border border-gray-100">
                {getInitials(user.name)}
                </div>
            )}
            
            {/* Info Text - Ẩn khi thu nhỏ */}
            <div className={`flex-1 min-w-0 transition-all duration-300 overflow-hidden ${
              sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"
            }`}>
              <div className="font-semibold text-gray-800 truncate text-sm">{user.name}</div>
              <div className="text-xs text-gray-500 capitalize truncate">{user.role}</div>
            </div>

            {/* Logout Button (Small version inside footer when open) */}
            {sidebarOpen && (
                <button 
                    onClick={onLogout}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                    title="Đăng xuất"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            )}
          </div>
          
          {/* Logout Button (When collapsed - Replacing the whole footer box if needed, or overlay) */}
          {!sidebarOpen && (
             <button 
                onClick={onLogout}
                className="w-full mt-2 p-2 flex justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Đăng xuất"
             >
                 <LogOut className="w-5 h-5" />
             </button>
          )}
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm sticky top-0 z-10">
          
          {/* Toggle Sidebar Button & Page Title */}
          <div className="flex items-center gap-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5 rotate-180" />}
            </button>
            <h2 className="text-lg font-bold text-gray-800">
              {menuItems.find((item) => item.id === currentPage)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Notification Bell */}
            <div className="relative" ref={notiRef}>
              <button 
                className="p-2.5 hover:bg-gray-100 rounded-full relative transition-colors"
                onClick={() => setShowNotiDropdown(!showNotiDropdown)}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotiDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800">Thông báo</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => {
                            api.put("/notifications/read");
                            setUnreadCount(0);
                            fetchNotifications();
                        }}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                  <div className="max-h-[24rem] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        Không có thông báo mới
                      </div>
                    ) : (
                      notifications.map(noti => (
                        <div 
                          key={noti.notification_id}
                          onClick={() => handleNotiClick(noti)}
                          className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer flex gap-3 transition-colors ${!noti.is_read ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!noti.is_read ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                          <div>
                            <p className={`text-sm leading-snug ${!noti.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                              {noti.message}
                            </p>
                            <span className="text-xs text-gray-400 mt-1.5 block font-medium">
                              {new Date(noti.created_at).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Info & Avatar (Header) */}
            <div className="flex items-center gap-2">
                {user.avatar ? (
                    <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {getInitials(user.name)}
                    </div>
                )}
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium">{user.name}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}