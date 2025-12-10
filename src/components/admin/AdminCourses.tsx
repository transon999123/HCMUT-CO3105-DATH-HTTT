import { useState } from "react";
import { DEMO_COURSES, COURSE_ENROLLMENTS } from "../../lib/mockData";
import { Search, Lock, Unlock, Trash2, Eye, Users } from "lucide-react";

export function AdminCourses() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = DEMO_COURSES.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý lớp học</h1>
        <p className="text-gray-600">
          Xem và quản lý tất cả lớp học trong hệ thống
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Tổng lớp học", value: DEMO_COURSES.length },
          { title: "Đang hoạt động", value: DEMO_COURSES.length },
          {
            title: "Tổng sinh viên",
            value: DEMO_COURSES.reduce((sum, c) => sum + c.studentCount, 0),
          },
          {
            title: "TB SV/lớp",
            value: Math.round(
              DEMO_COURSES.reduce((sum, c) => sum + c.studentCount, 0) /
                DEMO_COURSES.length
            ),
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-600">{stat.title}</div>
            <div className="text-blue-600 text-xl font-semibold">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tìm kiếm lớp học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">
            Danh sách lớp học ({filteredCourses.length})
          </h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Mã lớp</th>
                  <th className="text-left py-3 font-medium">Tên lớp</th>
                  <th className="text-left py-3 font-medium">Giảng viên</th>
                  <th className="text-left py-3 font-medium">Học kỳ</th>
                  <th className="text-left py-3 font-medium">Số SV</th>
                  <th className="text-left py-3 font-medium">Mã đăng ký</th>
                  <th className="text-left py-3 font-medium">Trạng thái</th>
                  <th className="text-right py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{course.code}</td>
                    <td className="py-3">{course.name}</td>
                    <td className="py-3">{course.teacherName}</td>
                    <td className="py-3">{course.semester}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.studentCount}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {course.enrollmentCode}
                      </code>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Hoạt động
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Lock className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy lớp học nào
            </div>
          )}
        </div>
      </div>

      {/* Course Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Lớp học theo giảng viên</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {Array.from(new Set(DEMO_COURSES.map((c) => c.teacherName))).map(
                (teacher) => {
                  const courses = DEMO_COURSES.filter(
                    (c) => c.teacherName === teacher
                  );
                  return (
                    <div
                      key={teacher}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div>{teacher}</div>
                        <div className="text-sm text-gray-600">
                          {courses.length} lớp học
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {courses.reduce((sum, c) => sum + c.studentCount, 0)} SV
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Lớp học theo học kỳ</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {Array.from(new Set(DEMO_COURSES.map((c) => c.semester))).map(
                (semester) => {
                  const courses = DEMO_COURSES.filter(
                    (c) => c.semester === semester
                  );
                  return (
                    <div
                      key={semester}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div>{semester}</div>
                        <div className="text-sm text-gray-600">
                          {courses.length} lớp học
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {courses.reduce((sum, c) => sum + c.studentCount, 0)} SV
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
