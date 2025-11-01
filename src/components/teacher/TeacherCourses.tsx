// TeacherCourses.tsx
import { useState } from "react";
import { BookOpen, Plus, Search, Users, Edit, Trash2 } from "lucide-react";
import { DEMO_COURSES, User, Course } from "../../lib/mockData";

interface TeacherCoursesProps {
  user: User;
  onNavigate: (page: string, data?: any) => void;
}

export function TeacherCourses({ user, onNavigate }: TeacherCoursesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [courses, setCourses] = useState(
    DEMO_COURSES.filter((course) => course.teacherId === user.id)
  );
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    semester: "HK1 2024-2025",
    enrollmentCode: "",
  });

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCourse = () => {
    if (!formData.name || !formData.code) {
      return;
    }

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name: formData.name,
      code: formData.code,
      description: formData.description,
      teacherId: user.id,
      teacherName: user.name,
      semester: formData.semester,
      studentCount: 0,
      enrollmentCode: formData.enrollmentCode || formData.code.toUpperCase(),
    };

    setCourses([...courses, newCourse]);
    setCreateDialogOpen(false);
    setFormData({
      name: "",
      code: "",
      description: "",
      semester: "HK1 2024-2025",
      enrollmentCode: "",
    });
  };

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
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Tạo lớp học mới
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tìm kiếm lớp học theo tên hoặc mã..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() =>
                    onNavigate("course-detail", { courseId: course.id })
                  }
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{course.name}</h3>
                      <p className="text-sm text-gray-600">
                        {course.code} • {course.semester}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{course.studentCount} sinh viên</span>
                    </div>
                    <div className="text-gray-600">
                      Mã đăng ký:{" "}
                      <span className="text-blue-600">
                        {course.enrollmentCode}
                      </span>
                    </div>
                  </div>
                </div>
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

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-600 mb-2">
            {searchQuery ? "Không tìm thấy lớp học" : "Chưa có lớp học nào"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchQuery
              ? "Thử tìm kiếm với từ khóa khác"
              : "Tạo lớp học mới để bắt đầu"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Tạo lớp học mới
            </button>
          )}
        </div>
      )}

      {/* Create Course Dialog */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Tạo lớp học mới</h3>
              <p className="text-gray-600">Nhập thông tin để tạo lớp học mới</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tên lớp học
                  </label>
                  <input
                    placeholder="Lập trình Web nâng cao"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mã lớp
                  </label>
                  <input
                    placeholder="IT4409"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  placeholder="Mô tả về nội dung lớp học..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Học kỳ
                  </label>
                  <input
                    placeholder="HK1 2024-2025"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mã đăng ký
                  </label>
                  <input
                    placeholder="WEB2024"
                    value={formData.enrollmentCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enrollmentCode: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setCreateDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateCourse}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Tạo lớp học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
