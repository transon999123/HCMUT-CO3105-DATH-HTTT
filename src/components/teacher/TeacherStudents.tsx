// TeacherStudents.tsx
import { useState } from "react";
import { Search, UserCheck, UserX, Eye } from "lucide-react";
import {
  DEMO_USERS,
  DEMO_COURSES,
  COURSE_ENROLLMENTS,
  User,
  DEMO_SUBMISSIONS,
} from "../../lib/mockData";

interface TeacherStudentsProps {
  user: User;
}

export function TeacherStudents({ user }: TeacherStudentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  const myCourses = DEMO_COURSES.filter(
    (course) => course.teacherId === user.id
  );

  // Get all unique students from all my courses
  const allStudentIds = Array.from(
    new Set(myCourses.flatMap((course) => COURSE_ENROLLMENTS[course.id] || []))
  );

  const allStudents = DEMO_USERS.filter((u) => allStudentIds.includes(u.id));

  // Filter by selected course
  const filteredStudents =
    selectedCourse === "all"
      ? allStudents
      : allStudents.filter((student) =>
          COURSE_ENROLLMENTS[selectedCourse]?.includes(student.id)
        );

  // Filter by search query
  const searchedStudents = filteredStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetail = (student: User) => {
    setSelectedStudent(student);
    setDetailDialogOpen(true);
  };

  const getStudentCourses = (studentId: string) => {
    return myCourses.filter((course) =>
      COURSE_ENROLLMENTS[course.id]?.includes(studentId)
    );
  };

  const getStudentAvgScore = () => {
    return (Math.random() * 30 + 70).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý sinh viên</h1>
        <p className="text-gray-600">
          Xem và quản lý sinh viên trong các lớp học
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Tìm kiếm sinh viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả lớp học</option>
          {myCourses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Danh sách sinh viên ({searchedStudents.length})
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-medium">Mã SV</th>
                  <th className="text-left py-3 font-medium">Họ và tên</th>
                  <th className="text-left py-3 font-medium">Email</th>
                  <th className="text-left py-3 font-medium">Lớp học</th>
                  <th className="text-left py-3 font-medium">Điểm TB</th>
                  <th className="text-left py-3 font-medium">Trạng thái</th>
                  <th className="text-right py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {searchedStudents.map((student) => {
                  const studentCourses = getStudentCourses(student.id);

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      <td className="py-3">{student.studentId}</td>
                      <td className="py-3">{student.name}</td>
                      <td className="py-3">{student.email}</td>
                      <td className="py-3">
                        {selectedCourse === "all" ? (
                          <span>{studentCourses.length} lớp</span>
                        ) : (
                          myCourses.find((c) => c.id === selectedCourse)?.code
                        )}
                      </td>
                      <td className="py-3 text-blue-600">
                        {getStudentAvgScore()}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Hoạt động
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(student)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {searchedStudents.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              Không tìm thấy sinh viên nào
            </div>
          )}
        </div>
      </div>

      {/* Student Detail Dialog */}
      {detailDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Thông tin sinh viên</h3>
              <p className="text-gray-600">
                Chi tiết về sinh viên và kết quả học tập
              </p>
            </div>
            {selectedStudent && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Họ và tên</label>
                    <p>{selectedStudent.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Mã sinh viên
                    </label>
                    <p>{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p>{selectedStudent.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Số điện thoại
                    </label>
                    <p>{selectedStudent.phone || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Lớp học đang tham gia</h3>
                  <div className="space-y-2">
                    {getStudentCourses(selectedStudent.id).map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div>{course.name}</div>
                          <div className="text-sm text-gray-600">
                            {course.code}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          Điểm TB: {getStudentAvgScore()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Bài nộp gần đây</h3>
                  <div className="space-y-2">
                    {DEMO_SUBMISSIONS.filter(
                      (s) => s.studentId === selectedStudent.id
                    ).map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="text-sm">Bài nộp</div>
                          <div className="text-xs text-gray-600">
                            {new Date(
                              submission.submittedAt
                            ).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                        {submission.score !== undefined && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            Điểm: {submission.score}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setDetailDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
