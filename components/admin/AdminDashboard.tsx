import { Users, BookOpen, FileText, Activity } from "lucide-react";
import { DEMO_USERS, DEMO_COURSES, DEMO_ASSIGNMENTS } from "../../lib/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface AdminDashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const totalUsers = DEMO_USERS.length;
  const students = DEMO_USERS.filter((u) => u.role === "student").length;
  const teachers = DEMO_USERS.filter((u) => u.role === "teacher").length;
  const admins = DEMO_USERS.filter((u) => u.role === "admin").length;

  const userRoleData = [
    { name: "Sinh viên", value: students, color: "#2F80ED" },
    { name: "Giảng viên", value: teachers, color: "#27AE60" },
    { name: "Quản trị viên", value: admins, color: "#E74C3C" },
  ];

  const activityData = [
    { month: "T7", users: 65, courses: 12 },
    { month: "T8", users: 75, courses: 15 },
    { month: "T9", users: 85, courses: 18 },
    { month: "T10", users: 98, courses: 20 },
    { month: "T11", users: 110, courses: 22 },
    { month: "T12", users: 125, courses: 25 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
        <p className="text-gray-600 mt-1">Quản trị BK EduClass</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Người dùng",
            value: totalUsers,
            icon: Users,
            desc: "Tổng tài khoản",
          },
          {
            title: "Lớp học",
            value: DEMO_COURSES.length,
            icon: BookOpen,
            desc: "Đang hoạt động",
          },
          {
            title: "Bài tập",
            value: DEMO_ASSIGNMENTS.length,
            icon: FileText,
            desc: "Tổng số bài tập",
          },
          {
            title: "Hoạt động",
            value: "Active",
            icon: Activity,
            desc: "Hệ thống ổn định",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg border p-6">
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

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">
              Phân bố người dùng theo vai trò
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userRoleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2F80ED" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Hoạt động theo tháng</h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#2F80ED"
                  name="Người dùng"
                />
                <Line
                  type="monotone"
                  dataKey="courses"
                  stroke="#27AE60"
                  name="Lớp học"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Hoạt động gần đây</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[
              {
                action: "Tạo lớp học mới",
                user: "Trần Thị Hương",
                time: "5 phút trước",
              },
              {
                action: "Đăng ký tài khoản",
                user: "Phạm Minh Tuấn",
                time: "15 phút trước",
              },
              {
                action: "Nộp bài tập",
                user: "Hoàng Thị Lan",
                time: "1 giờ trước",
              },
              {
                action: "Tạo bài tập mới",
                user: "Lê Văn Minh",
                time: "2 giờ trước",
              },
              {
                action: "Chấm điểm bài tập",
                user: "Trần Thị Hương",
                time: "3 giờ trước",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-sm text-gray-600">{activity.user}</div>
                </div>
                <div className="text-sm text-gray-600">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
