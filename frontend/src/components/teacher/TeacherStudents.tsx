import { useState, useEffect } from "react";
import { Search, UserX, Mail, Phone, BookOpen, User } from "lucide-react";
import api from "../../services/api";
import { User as UserType } from "../../lib/authContext";

interface TeacherStudentsProps {
  user: UserType;
}

export function TeacherStudents({ user }: TeacherStudentsProps) {
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(""); // Lưu ID lớp đang chọn
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Lấy danh sách lớp khi vào trang
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/classes");
        setMyCourses(res.data);
        // Mặc định chọn lớp đầu tiên nếu có
        if (res.data.length > 0) {
          setSelectedCourseId(res.data[0].class_id);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách lớp:", error);
      }
    };
    fetchCourses();
  }, []);

  // 2. Khi selectedCourseId thay đổi -> Gọi API lấy sinh viên
  useEffect(() => {
    if (!selectedCourseId) return;
    
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/classes/${selectedCourseId}/students`);
        setStudents(res.data);
      } catch (error) {
        console.error("Lỗi tải sinh viên:", error);
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedCourseId]);

  // 3. Xử lý Xóa sinh viên (Kick)
  const handleRemoveStudent = async (studentId: number) => {
    if(!confirm("Bạn chắc chắn muốn xóa sinh viên này khỏi lớp?")) return;

    try {
      await api.delete(`/classes/${selectedCourseId}/students/${studentId}`);
      alert("Đã xóa sinh viên!");
      // Cập nhật lại danh sách local
      setStudents(students.filter(s => s.user_id !== studentId));
    } catch (error) {
      alert("Lỗi khi xóa sinh viên");
    }
  };

  const filteredStudents = students.filter(s => 
    (s.last_name + " " + s.first_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý sinh viên</h1>
        <p className="text-gray-600">Xem danh sách sinh viên theo từng lớp học</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        {/* Dropdown chọn lớp */}
        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Chọn lớp học</label>
          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
            >
              {myCourses.length === 0 && <option value="">Chưa có lớp nào</option>}
              {myCourses.map((c) => (
                <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
              ))}
            </select>
            <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Search Input */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Tìm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">
            Danh sách sinh viên ({filteredStudents.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Đang tải danh sách...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <User className="w-12 h-12 text-gray-300 mb-3" />
            <p>Lớp học này chưa có sinh viên nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-500">Họ và tên</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-500">Vai trò</th>
                  <th className="text-right py-3 px-6 font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map((student) => (
                  <tr key={student.user_id} className="hover:bg-gray-50">
                    <td className="py-3 px-6 font-medium text-gray-900">
                      {student.last_name} {student.first_name}
                    </td>
                    <td className="py-3 px-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {student.email}
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Student</span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => handleRemoveStudent(student.user_id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition"
                        title="Xóa khỏi lớp"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}