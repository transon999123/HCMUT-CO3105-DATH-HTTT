// src/components/teacher/TeacherCourses.tsx
import { useState, useEffect } from "react";
import { BookOpen, Plus, Search, Users, Edit, Trash2 } from "lucide-react";
import { User } from "../../lib/mockData"; // Vẫn giữ type User, nhưng bỏ DEMO_COURSES
import api from "../../services/api"; // Import API thật

interface TeacherCoursesProps {
  user: User;
  onNavigate: (page: string, data?: any) => void;
}

export function TeacherCourses({ user, onNavigate }: TeacherCoursesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // 1. State lưu dữ liệu thật từ Server
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    code: "", // Backend đang dùng class_code
    description: "",
    semester: "HK1 2024-2025",
    enrollmentCode: "",
  });

  // 2. Gọi API lấy danh sách lớp khi trang vừa load
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

  const handleCreateCourse = async () => {
    if (!formData.name) return;

    try {
      // 3. Gọi API Tạo lớp (Mapping dữ liệu cho khớp Backend)
      await api.post("/classes", {
        class_name: formData.name,
        class_description: formData.description,
        // Backend API tạo lớp của bạn đang cần các trường này:
        // start_time, end_time, days_of_week...
        // Tạm thời mình hardcode giờ học demo để API không lỗi
        start_time: "07:00:00",
        end_time: "10:30:00",
        days_of_week: "Thứ 2",
        class_code: formData.code // Bạn cần thêm cột này vào DB nếu chưa có, hoặc bỏ qua
      });

      alert("Tạo lớp học thành công!");
      setCreateDialogOpen(false);
      fetchCourses(); // Load lại danh sách mới
      
      // Reset form
      setFormData({
        name: "",
        code: "",
        description: "",
        semester: "HK1 2024-2025",
        enrollmentCode: "",
      });
    } catch (error) {
      console.error("Lỗi tạo lớp:", error);
      alert("Lỗi khi tạo lớp học!");
    }
  };

  // Logic filter phía client (giữ nguyên)
  const filteredCourses = courses.filter(
    (course) =>
      (course.class_name || course.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      // Backend trả về class_name, mock data dùng name. Code này support cả 2 để tránh lỗi.
  );

  if (isLoading) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý lớp học</h1>
          <p className="text-gray-600">
            Quản lý các lớp học bạn đang giảng dạy
          </p>
        </div>

        <button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Plus className="w-4 h-4" />
          Tạo lớp học mới
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tìm kiếm lớp học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course.class_id || course.id} // Backend dùng class_id
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() =>
                    onNavigate("course-detail", { courseId: course.class_id || course.id })
                  }
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{course.class_name || course.name}</h3>
                      <p className="text-sm text-gray-600">
                        {/* Hiển thị lịch học thay vì mã lớp nếu chưa có */}
                        {course.days_of_week} • {course.start_time?.slice(0,5)} - {course.end_time?.slice(0,5)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {course.class_description || course.description}
                  </p>
                </div>
                {/* Nút thao tác */}
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* (Phần Dialog Create Course giữ nguyên UI, chỉ đổi hàm onClick của nút Tạo thành handleCreateCourse) */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            {/* ... Nội dung Dialog giữ nguyên, nhớ map onChange vào state formData ... */}
            {/* Lưu ý: Input "Tên lớp học" phải map vào formData.name */}
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                <h3 className="text-lg font-bold mb-4">Tạo lớp học mới</h3>
                <div className="space-y-4">
                    <input 
                        className="w-full border p-2 rounded" 
                        placeholder="Tên lớp học"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <textarea 
                        className="w-full border p-2 rounded" 
                        placeholder="Mô tả"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                    {/* Các trường khác tạm thời ẩn hoặc hardcode để test API */}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setCreateDialogOpen(false)} className="px-4 py-2 border rounded">Hủy</button>
                    <button onClick={handleCreateCourse} className="px-4 py-2 bg-blue-600 text-white rounded">Tạo lớp</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}