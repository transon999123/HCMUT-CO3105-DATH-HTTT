// src/components/admin/AdminCourses.tsx
import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit, X, User as UserIcon, Calendar, BookOpen, UserPlus, MinusCircle, Save } from "lucide-react";
import api from "../../services/api";

export function AdminCourses() {
  // --- States ---
  // Khởi tạo mảng rỗng để tránh lỗi undefined khi map
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]); 
  const [classStudents, setClassStudents] = useState<any[]>([]); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [studentToAdd, setStudentToAdd] = useState(""); 

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teacher_id: "",
    start_time: "07:00",
    end_time: "09:00",
    days_of_week: "Thứ 2",
  });

  // --- 1. Load Data ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, teachersRes, studentsRes] = await Promise.all([
        api.get("/classes"),
        api.get("/teachers"),
        api.get("/students")
      ]);
      // Dùng optional chaining (?.) và fallback mảng rỗng [] để an toàn
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setAllStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", description: "", teacher_id: "", 
      start_time: "07:00", end_time: "09:00", days_of_week: "Thứ 2"
    });
  };

  // --- 2. CREATE CLASS ---
  const handleCreateClass = async () => {
    if (!formData.name || !formData.teacher_id) {
      alert("Vui lòng nhập tên lớp và chọn giáo viên!");
      return;
    }

    try {
      const generatedCode = formData.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      await api.post("/classes", {
        class_name: formData.name,
        class_code: generatedCode,
        class_description: formData.description,
        teacher_id: formData.teacher_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        days_of_week: formData.days_of_week,
      });

      alert("Tạo lớp học thành công!");
      setIsCreateOpen(false);
      fetchData(); 
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi khi tạo lớp!");
    }
  };

  // --- 3. EDIT CLASS & MANAGE STUDENTS (Đã sửa lỗi định dạng giờ) ---
  const openEditModal = async (course: any) => {
    setSelectedClassId(course.class_id);
    
    // FIX: Cắt chuỗi giờ "07:00:00" -> "07:00" để input type="time" hiểu
    const safeStartTime = course.start_time ? String(course.start_time).slice(0, 5) : "07:00";
    const safeEndTime = course.end_time ? String(course.end_time).slice(0, 5) : "09:00";

    setFormData({
      name: course.class_name || "",
      description: course.class_description || "",
      teacher_id: course.teacher_id || "", 
      start_time: safeStartTime,
      end_time: safeEndTime,
      days_of_week: course.days_of_week || "Thứ 2",
    });

    try {
      const res = await api.get(`/classes/${course.class_id}/students`);
      // Đảm bảo luôn là mảng
      setClassStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi tải sinh viên:", error);
      setClassStudents([]);
    }
    setIsEditOpen(true);
  };

  const handleUpdateClass = async () => {
    if (!selectedClassId) return;
    try {
      await api.put(`/classes/${selectedClassId}`, {
        class_name: formData.name,
        class_description: formData.description,
        teacher_id: formData.teacher_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        days_of_week: formData.days_of_week,
      });
      alert("Đã lưu thay đổi!");
      fetchData();
      setIsEditOpen(false);
    } catch (error) {
      alert("Lỗi cập nhật!");
    }
  };

  const handleAddStudentToClass = async () => {
    if (!selectedClassId || !studentToAdd) {
        alert("Vui lòng chọn sinh viên trong danh sách!");
        return;
    }
    try {
      await api.post("/enroll", {
        class_id: selectedClassId,
        student_id: studentToAdd
      });
      // Refresh list
      const res = await api.get(`/classes/${selectedClassId}/students`);
      setClassStudents(Array.isArray(res.data) ? res.data : []);
      setStudentToAdd(""); 
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi thêm sinh viên");
    }
  };

  const handleRemoveStudentFromClass = async (studentId: number) => {
    if (!selectedClassId) return;
    if (!confirm("Xóa sinh viên này khỏi lớp?")) return;

    try {
      await api.delete(`/classes/${selectedClassId}/students/${studentId}`);
      setClassStudents(classStudents.filter(s => s.user_id !== studentId));
    } catch (error) {
      alert("Lỗi khi xóa sinh viên!");
    }
  };

  // --- 4. DELETE CLASS ---
  const confirmDelete = (id: number) => {
    setSelectedClassId(id);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteClass = async () => {
    if (!selectedClassId) return;
    try {
      await api.delete(`/classes/${selectedClassId}`);
      setCourses(courses.filter(c => c.class_id !== selectedClassId));
      setIsDeleteAlertOpen(false);
    } catch (error) {
      alert("Không thể xóa lớp học này!");
    }
  };

  const filteredCourses = courses.filter((course) =>
    (course.class_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý lớp học</h1>
          <p className="text-gray-500">Phân công giảng dạy và quản lý thời khóa biểu</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsCreateOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition shadow-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          Thêm lớp học
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* LIST VIEW */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Danh sách ({filteredCourses.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {isLoading ? ( <div className="p-8 text-center text-gray-500">Đang tải...</div> ) : 
           filteredCourses.map((course) => (
              <div key={course.class_id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {course.class_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{course.class_name}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium border border-blue-100">
                            <UserIcon className="w-3 h-3" /> 
                            GV: {course.first_name ? `${course.last_name} ${course.first_name}` : "Chưa gán"}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {course.days_of_week} ({String(course.start_time).slice(0,5)} - {String(course.end_time).slice(0,5)})
                        </span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs border">Mã: {course.class_code}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(course)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => confirmDelete(course.class_id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* --- MODAL EDIT (AN TOÀN HƠN) --- */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-auto animate-in zoom-in duration-200">
            
            {/* Cột Trái: Form Sửa */}
            <div className="flex-1 p-6 space-y-5 overflow-y-auto border-r border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-800">Sửa thông tin lớp</h2>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp</label>
                    <input className="w-full px-3 py-2 border rounded-lg text-gray-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giáo viên</label>
                    <select 
                        className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900" 
                        value={formData.teacher_id} 
                        onChange={e => setFormData({...formData, teacher_id: e.target.value})}
                    >
                        <option value="">-- Chọn GV --</option>
                        {teachers?.map(t => (
                            <option key={t.user_id} value={t.user_id}>
                                {t.last_name} {t.first_name} ({t.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu</label>
                        <input type="time" className="w-full px-3 py-2 border rounded-lg text-gray-900" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc</label>
                        <input type="time" className="w-full px-3 py-2 border rounded-lg text-gray-900" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-2 border-t mt-4">
                    <button onClick={() => setIsEditOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700">Đóng</button>
                    <button 
                        onClick={handleUpdateClass} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2 shadow-md"
                    >
                        <Save className="w-4 h-4" /> Lưu thay đổi
                    </button>
                </div>
            </div>

            {/* Cột Phải: Quản lý sinh viên */}
            <div className="flex-1 p-6 bg-gray-50 flex flex-col h-full border-l border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Danh sách sinh viên</h2>
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{classStudents?.length || 0} SV</span>
                </div>

                <div className="flex gap-2 mb-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <select 
                        className="flex-1 px-2 py-1 text-sm outline-none bg-white text-gray-900"
                        value={studentToAdd}
                        onChange={(e) => setStudentToAdd(e.target.value)}
                    >
                        <option value="">-- Chọn sinh viên để thêm --</option>
                        {allStudents?.map(s => (
                            <option key={s.user_id} value={s.user_id}>
                                {s.last_name} {s.first_name} ({s.email})
                            </option>
                        ))}
                    </select>
                    <button 
                        onClick={handleAddStudentToClass}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 font-medium text-sm flex items-center gap-1 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Thêm
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {classStudents?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <p className="text-sm">Lớp chưa có sinh viên.</p>
                        </div>
                    ) : (
                        classStudents?.map(s => (
                            <div key={s.user_id} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold border border-purple-200">
                                        {s.first_name?.[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-800">{s.last_name} {s.first_name}</div>
                                        <div className="text-xs text-gray-500">{s.email}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemoveStudentFromClass(s.user_id)}
                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition"
                                    title="Xóa khỏi lớp"
                                >
                                    <MinusCircle className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL CREATE (Giữ nguyên giao diện đẹp từ bước trước) --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Thêm lớp học mới</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp học *</label>
                <input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    placeholder="VD: Toán Cao Cấp"
                    autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giáo viên phụ trách *</label>
                <div className="relative">
                    <select
                        value={formData.teacher_id}
                        onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none text-gray-900"
                    >
                        <option value="">-- Chọn giáo viên --</option>
                        {teachers?.map(t => (
                            <option key={t.user_id} value={t.user_id}>
                                {t.last_name} {t.first_name} ({t.email})
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <UserIcon className="w-4 h-4" />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thứ</label>
                    <div className="relative">
                        <select
                            value={formData.days_of_week}
                            onChange={(e) => setFormData({...formData, days_of_week: e.target.value})}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900"
                        >
                            {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <Calendar className="w-4 h-4" />
                        </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu</label>
                    <input type="time" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                        value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc</label>
                    <input type="time" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                        value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    placeholder="Thông tin thêm..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleCreateClass}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all active:scale-95"
              >
                Xác nhận tạo lớp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DELETE (Giữ nguyên) --- */}
      {isDeleteAlertOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full animate-in zoom-in duration-200">
                <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-full text-red-600">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Xóa lớp học?</h3>
                        <p className="text-gray-500 mt-1 text-sm">
                            Hành động này sẽ xóa vĩnh viễn lớp học cùng toàn bộ bài tập và tài liệu bên trong.
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button 
                        onClick={() => setIsDeleteAlertOpen(false)}
                        className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleDeleteClass}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm"
                    >
                        Xóa ngay
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}