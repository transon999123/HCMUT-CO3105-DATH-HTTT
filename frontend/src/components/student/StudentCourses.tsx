import { useState, useEffect } from "react";
import { BookOpen, Users, Plus, Search } from "lucide-react";
import { User } from "../../lib/authContext";
import api from "../../services/api";

interface StudentCoursesProps {
  user: User;
  onNavigate: (page: string, data?: any) => void;
}

export function StudentCourses({ user, onNavigate }: StudentCoursesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/classes");
      setEnrolledCourses(response.data);
    } catch (error) {
      console.error("Lỗi tải danh sách lớp:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = enrolledCourses.filter((course) =>
    (course.class_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lớp học của tôi</h1>
          <p className="text-gray-600">Danh sách các lớp học bạn đã được ghi danh</p>
        </div>
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
      {isLoading ? (
          <div className="text-center py-12 text-gray-500">Đang tải danh sách lớp...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
            <div
                key={course.class_id}
                className="bg-white rounded-lg border hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
                onClick={() =>
                onNavigate("course-detail", { courseId: course.class_id })
                }
            >
                {/* --- CẬP NHẬT MÀU NỀN TẠI ĐÂY --- */}
                <div 
                    className="h-32 relative group-hover:opacity-90 transition-opacity"
                    style={{ 
                        background: course.theme_color || 'linear-gradient(to right, #2563eb, #4f46e5)' 
                    }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white opacity-40" />
                    </div>
                    {/* Mã lớp */}
                    {course.class_code && (
                        <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium border border-white/20">
                            {course.class_code}
                        </div>
                    )}
                </div>

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
                    <span>{course.days_of_week || "Chưa có lịch"}</span>
                    </div>
                </div>
                </div>
            </div>
            ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCourses.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 font-medium mb-1">
            Chưa có lớp học nào
          </h3>
          <p className="text-sm text-gray-500">
            Vui lòng liên hệ quản trị viên để được thêm vào lớp học.
          </p>
        </div>
      )}
    </div>
  );
}