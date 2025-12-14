import { useState, useEffect } from "react";
import { BookOpen, Search, Calendar, Users } from "lucide-react";
import api from "../../services/api";
import { User } from "../../lib/authContext";

interface TeacherCoursesProps {
  user: User;
  onNavigate: (page: string, data?: any) => void;
}

export function TeacherCourses({ user, onNavigate }: TeacherCoursesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/classes");
      setCourses(response.data);
    } catch (error) {
      console.error("Lỗi tải lớp học:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      (course.class_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="p-6 text-center text-gray-500">Đang tải dữ liệu lớp học...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý lớp học</h1>
          <p className="text-gray-600">
            Danh sách các lớp học bạn được phân công giảng dạy
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tìm kiếm lớp học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course.class_id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer overflow-hidden group"
            onClick={() =>
              onNavigate("course-detail", {
                courseId: course.class_id,
              })
            }
          >
            {/* --- CẬP NHẬT MÀU NỀN TẠI ĐÂY --- */}
            <div 
                className="h-24 relative p-4 flex items-center justify-between"
                style={{ 
                    background: course.theme_color || 'linear-gradient(to right, #2563eb, #4f46e5)' 
                }}
            >
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <BookOpen className="w-6 h-6 text-white" />
                </div>
                {/* Mã lớp */}
                {course.class_code && (
                    <span className="text-xs text-white/90 font-mono bg-black/20 px-2 py-1 rounded border border-white/10">
                        {course.class_code}
                    </span>
                )}
            </div>

            <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                  {course.class_name}
                </h3>
                
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem]">
                  {course.class_description || "Chưa có mô tả cho lớp học này."}
                </p>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{course.days_of_week}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-green-500" />
                        <span>{course.start_time?.slice(0, 5)} - {course.end_time?.slice(0, 5)}</span>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Bạn chưa được phân công lớp học nào.</p>
          </div>
      )}
    </div>
  );
}