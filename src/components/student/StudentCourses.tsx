// StudentCourses.tsx
import { useState } from "react";
import { DEMO_COURSES, COURSE_ENROLLMENTS, User } from "../../lib/mockData";
import { BookOpen, Users, Plus, Search } from "lucide-react";

interface StudentCoursesProps {
  user: User;
  onNavigate: (page: string, data?: any) => void;
}

export function StudentCourses({ user, onNavigate }: StudentCoursesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState(
    DEMO_COURSES.filter((course) =>
      COURSE_ENROLLMENTS[course.id]?.includes(user.id)
    )
  );

  const handleJoinCourse = () => {
    if (!enrollmentCode.trim()) {
      alert("Vui lòng nhập mã đăng ký");
      return;
    }

    const course = DEMO_COURSES.find(
      (c) => c.enrollmentCode === enrollmentCode.toUpperCase()
    );

    if (!course) {
      alert("Mã đăng ký không hợp lệ");
      return;
    }

    if (enrolledCourses.some((c) => c.id === course.id)) {
      alert("Bạn đã tham gia lớp học này rồi");
      return;
    }

    setEnrolledCourses([...enrolledCourses, course]);
    setJoinDialogOpen(false);
    setEnrollmentCode("");
    alert(`Đã tham gia lớp học ${course.name} thành công!`);
  };

  const filteredCourses = enrolledCourses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lớp học của tôi</h1>
          <p className="text-gray-600">Quản lý các lớp học bạn đang tham gia</p>
        </div>

        <button
          onClick={() => setJoinDialogOpen(true)}
          className="bg-white text-black border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Đăng ký lớp học
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tìm kiếm lớp học theo tên hoặc mã..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Join Course Dialog */}
      {joinDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">Đăng ký lớp học mới</h2>
            <p className="text-gray-600 mb-4">
              Nhập mã lớp học để đăng ký tham gia
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã lớp học
                </label>
                <input
                  placeholder="Ví dụ: WEB2024"
                  value={enrollmentCode}
                  onChange={(e) => setEnrollmentCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mã demo: WEB2024, DB2024, AI2024
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setJoinDialogOpen(false)}
              >
                Hủy
              </button>
              <button
                onClick={handleJoinCourse}
                className="flex-1 bg-white text-black border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg border hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate("course-detail", { courseId: course.id })}
          >
            <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white opacity-50" />
              </div>
              <div className="absolute top-3 right-3">
                <div className="bg-white text-blue-600 px-2 py-1 rounded text-sm font-medium">
                  {course.code}
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                {course.name}
              </h3>
              <p className="text-gray-600 mb-4">{course.teacherName}</p>

              <div className="flex items-center justify-between text-sm pt-2">
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{course.studentCount} sinh viên</span>
                </div>
                <span className="text-gray-600">{course.semester}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-600 mb-2">Không tìm thấy lớp học</h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchQuery
              ? "Thử tìm kiếm với từ khóa khác"
              : "Bạn chưa tham gia lớp học nào"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setJoinDialogOpen(true)}
              className="bg-white text-black border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus className="w-4 h-4" />
              Đăng ký lớp học
            </button>
          )}
        </div>
      )}
    </div>
  );
}
