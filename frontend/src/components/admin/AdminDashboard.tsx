// src/components/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { Users, BookOpen, FileText, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../services/api"; // Gọi API thật

interface DashboardStats {
  totalUsers: number;
  students: number;
  teachers: number;
  admins: number;
  totalClasses: number;
  totalAssignments: number;
  recentActivity: Array<{ action: string; user: string; time: string }>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) return <div className="p-6">Đang tải dữ liệu thống kê...</div>;
  if (!stats) return <div className="p-6">Không có dữ liệu.</div>;

  // Dữ liệu cho biểu đồ
  const userRoleData = [
    { name: "Sinh viên", value: stats.students, color: "#2F80ED" },
    { name: "Giảng viên", value: stats.teachers, color: "#27AE60" },
    { name: "Quản trị viên", value: stats.admins, color: "#E74C3C" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
        <p className="text-gray-600 mt-1">Quản trị BK EduClass</p>
      </div>

      {/* Stats Cards - Dữ liệu thật */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Người dùng",
            value: stats.totalUsers,
            icon: Users,
            desc: "Tổng tài khoản",
          },
          {
            title: "Lớp học",
            value: stats.totalClasses,
            icon: BookOpen,
            desc: "Đang hoạt động",
          },
          {
            title: "Bài tập",
            value: stats.totalAssignments,
            icon: FileText,
            desc: "Tổng số bài tập",
          },
          {
            title: "Trạng thái",
            value: "Online",
            icon: Activity,
            desc: "Hệ thống ổn định",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-600">
                  {stat.title}
                </div>
                <Icon className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-blue-600 text-2xl font-bold">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Biểu đồ phân bố User */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">
              Phân bố người dùng
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userRoleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2F80ED" name="Số lượng" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hoạt động gần đây (Lấy 5 user mới nhất) */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Thành viên mới gia nhập</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-800">{activity.user}</div>
                    <div className="text-xs text-blue-600">{activity.action}</div>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                  <p className="text-center text-gray-500">Chưa có hoạt động nào</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}