// src/components/student/StudentCourses.tsx
import { useState, useEffect } from "react";
import { BookOpen, Users, Plus, Search } from "lucide-react";
import { User } from "../../lib/mockData"; // Giữ type User
import api from "../../services/api"; // Import API

interface StudentCoursesProps {
  user: User;
  onNavigate: (page: string, data?: any) => void;
}

export function StudentCourses({ user, onNavigate }: StudentCoursesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(""); // ID lớp nhập vào
  const [isLoading, setIsLoading] = useState(false);
  
  // State lưu danh sách lớp thật từ DB
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);

  // 1. Khi trang load -> Gọi API lấy danh sách lớp của sinh viên này
  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      // API GET /classes khi gọi bởi Student sẽ tự động trả về lớp đã Enroll
      const response = await api.get("/classes");
      setEnrolledCourses(response.data);
    } catch (error) {
      console.error("Lỗi tải danh sách lớp:", error);
    }
  };

  // 2. Hàm xử lý khi bấm nút "Đăng ký" trong Popup
  const handleJoinCourse = async () => {
    if (!enrollmentId.trim()) {
      alert("Vui lòng nhập ID lớp học!");
      return;
    }

    try {
      setIsLoading(true);
      // Gọi API Enroll của Backend
      await api.post("/enroll", { 
        class_id: enrollmentId 
      });

      alert("Đăng ký lớp học thành công!");
      setJoinDialogOpen(false); // Đóng popup
      setEnrollmentId("");      // Xóa ô nhập
      fetchMyCourses();         // Load lại danh sách để hiện lớp mới
    } catch (error: any) {
      // Hiển thị lỗi từ Backend (ví dụ: Lớp không tồn tại, hoặc Đã đăng ký rồi)
      const message = error.response?.data?.message || "Lỗi khi đăng ký lớp!";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logic tìm kiếm trên client (giữ nguyên)
  const filteredCourses = enrolledCourses.filter(
    (course) =>
      (course.class_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lớp học của tôi</h1>
          <p className="text-gray-600">Quản lý các lớp học bạn đang tham gia</p>
        </div>

        <button
          onClick={() => setJoinDialogOpen(true)}
          className="bg-white text-black border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Đăng ký lớp học
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tìm kiếm lớp học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
      </div>

      {/* Grid danh sách lớp */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course.class_id}
            className="bg-white rounded-lg border hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
            onClick={() => onNavigate("course-detail", { courseId: course.class_id })}
          >
            {/* Banner lớp học */}
            <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white opacity-40" />
              </div>
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium border border-white/30">
                ID: {course.class_id}
              </div>
            </div>
            
            {/* Thông tin lớp */}
            <div className="p-5">
              <h3 className="font-bold text-lg mb-1 line-clamp-1 text-gray-900">
                {course.class_name}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                {course.class_description || "Chưa có mô tả"}
              </p>

              <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{course.days_of_week || "Lịch học chưa cập nhật"}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 font-medium mb-1">Chưa tham gia lớp nào</h3>
          <p className="text-sm text-gray-500 mb-6">
            Hãy bấm "Đăng ký lớp học" và nhập ID để bắt đầu.
          </p>
        </div>
      )}

      {/* Dialog Đăng Ký (Popup) */}
      {joinDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2 text-gray-900">Đăng ký lớp học</h2>
              <p className="text-gray-500 mb-6 text-sm">
                Nhập ID lớp học do giáo viên cung cấp để tham gia.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Lớp học
                  </label>
                  <input
                    placeholder="Ví dụ: 1, 15, 20..."
                    value={enrollmentId}
                    onChange={(e) => setEnrollmentId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    type="number"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setJoinDialogOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleJoinCourse}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-sm
                    ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}`}
                >
                  {isLoading ? "Đang xử lý..." : "Đăng ký"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}