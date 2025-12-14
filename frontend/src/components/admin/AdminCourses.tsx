import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  User as UserIcon,
  Calendar,
  Save,
  MinusCircle,
  Users,
  Check,
  Loader2
} from "lucide-react";
import api from "../../services/api";

export function AdminCourses() {
  // --- States ---
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [classStudents, setClassStudents] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
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
    theme_color: "linear-gradient(to right, #2563eb, #4f46e5)", // Default Blue
  });

  const THEMES = [
    { id: 1, value: "linear-gradient(to right, #2563eb, #4f46e5)", label: "Blue" },
    { id: 2, value: "linear-gradient(to right, #dc2626, #991b1b)", label: "Red" },
    { id: 3, value: "linear-gradient(to right, #059669, #047857)", label: "Green" },
    { id: 4, value: "linear-gradient(to right, #d97706, #b45309)", label: "Orange" },
    { id: 5, value: "linear-gradient(to right, #7c3aed, #5b21b6)", label: "Purple" },
    { id: 6, value: "linear-gradient(to right, #db2777, #9d174d)", label: "Pink" },
    { id: 7, value: "linear-gradient(to right, #1f2937, #111827)", label: "Black" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, teachersRes, studentsRes] = await Promise.all([
        api.get("/classes"),
        api.get("/teachers"),
        api.get("/students"),
      ]);
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
      name: "",
      description: "",
      teacher_id: "",
      start_time: "07:00",
      end_time: "09:00",
      days_of_week: "Thứ 2",
      theme_color: THEMES[0].value,
    });
  };

  // --- CREATE CLASS ---
  const handleCreateClass = async () => {
    if (!formData.name) {
      alert("Vui lòng nhập tên lớp!");
      return;
    }

    try {
      await api.post("/classes", {
        class_name: formData.name,
        class_description: formData.description,
        teacher_id: formData.teacher_id || null,
        start_time: formData.start_time,
        end_time: formData.end_time,
        days_of_week: formData.days_of_week,
        theme_color: formData.theme_color,
      });

      alert("Tạo lớp học thành công!");
      setIsCreateOpen(false);
      fetchData();
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi khi tạo lớp!");
    }
  };

  // --- EDIT CLASS ---
  const openEditModal = async (course: any) => {
    setSelectedClassId(course.class_id);

    setFormData({
      name: course.class_name || "",
      description: course.class_description || "",
      teacher_id: course.teacher_id || "",
      start_time: course.start_time ? String(course.start_time).slice(0, 5) : "07:00",
      end_time: course.end_time ? String(course.end_time).slice(0, 5) : "09:00",
      days_of_week: course.days_of_week || "Thứ 2",
      theme_color: course.theme_color || THEMES[0].value,
    });

    try {
      const res = await api.get(`/classes/${course.class_id}/students`);
      setClassStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
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
        theme_color: formData.theme_color,
      });
      alert("Đã cập nhật thông tin lớp!");
      fetchData();
      setIsEditOpen(false);
    } catch (error) {
      alert("Lỗi cập nhật!");
    }
  };

  const handleAddStudent = async () => {
    if (!selectedClassId || !studentToAdd) return;
    try {
        await api.post("/enroll", {
            class_id: selectedClassId,
            student_id: studentToAdd
        });
        const res = await api.get(`/classes/${selectedClassId}/students`);
        setClassStudents(res.data);
        setStudentToAdd("");
    } catch (error: any) {
        alert(error.response?.data?.message || "Lỗi thêm sinh viên");
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm("Xóa sinh viên này khỏi lớp?")) return;
    try {
        await api.delete(`/classes/${selectedClassId}/students/${studentId}`);
        setClassStudents(classStudents.filter(s => s.user_id !== studentId));
    } catch (error) {
        alert("Lỗi khi xóa sinh viên");
    }
  };

  const handleDeleteClass = async (id: number) => {
      if(!confirm("Bạn có chắc chắn muốn xóa lớp học này?")) return;
      try {
          await api.delete(`/classes/${id}`);
          fetchData();
      } catch (error) {
          alert("Lỗi xóa lớp");
      }
  }

  const availableStudents = allStudents.filter(
      s => !classStudents.some(cs => cs.user_id === s.user_id)
  );

  const filteredCourses = courses.filter((course) =>
    (course.class_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý lớp học</h1>
          <p className="text-gray-500">Phân công giảng dạy và quản lý danh sách lớp</p>
        </div>
        <button
          onClick={() => {
             resetForm();
             setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 shadow-sm font-medium transition"
        >
          <Plus className="w-5 h-5" /> Thêm lớp học
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          placeholder="Tìm kiếm lớp học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* List Courses */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Danh sách lớp ({filteredCourses.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.class_id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
                    style={{ background: course.theme_color || THEMES[0].value }}
                  >
                    {course.class_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{course.class_name}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border">
                        <UserIcon className="w-3 h-3" />
                        {course.first_name ? `GV: ${course.last_name} ${course.first_name}` : <span className="text-red-500">Chưa gán GV</span>}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {course.days_of_week} ({String(course.start_time).slice(0, 5)} - {String(course.end_time).slice(0, 5)})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(course)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteClass(course.class_id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL EDIT (Full Features) --- */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-4xl h-[75vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            {/* Cột trái: Form Edit */}
            <div className="w-full md:w-5/12 bg-gray-50 p-6 border-r overflow-y-auto">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Thông tin lớp học</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tên lớp</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Giáo viên</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  >
                    <option value="">-- Chọn Giáo Viên --</option>
                    {teachers.map((t) => (
                      <option key={t.user_id} value={t.user_id}>
                        {t.last_name} {t.first_name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium mb-1">Bắt đầu</label>
                        <input type="time" className="w-full border rounded p-2" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1">Kết thúc</label>
                        <input type="time" className="w-full border rounded p-2" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium mb-1">Thứ</label>
                    <select className="w-full border rounded p-2" value={formData.days_of_week} onChange={e => setFormData({...formData, days_of_week: e.target.value})}>
                        {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Màu chủ đạo</label>
                  <div className="flex flex-wrap gap-2">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setFormData({ ...formData, theme_color: t.value })}
                        className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-transform hover:scale-110 ${
                          formData.theme_color === t.value ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : ""
                        }`}
                        style={{ background: t.value }}
                      >
                        {formData.theme_color === t.value && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                    <button 
                        onClick={() => setIsEditOpen(false)}
                        className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleUpdateClass}
                        className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 flex justify-center items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> Lưu
                    </button>
                </div>
              </div>
            </div>

            {/* Cột phải: Quản lý sinh viên */}
            <div className="flex-1 p-6 flex flex-col h-full bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5"/> Danh sách sinh viên
                </h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                    {classStudents.length} SV
                </span>
              </div>

              <div className="flex gap-2 mb-4">
                <select
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                    value={studentToAdd}
                    onChange={(e) => setStudentToAdd(e.target.value)}
                >
                    <option value="">-- Chọn sinh viên thêm vào lớp --</option>
                    {availableStudents.map(s => (
                        <option key={s.user_id} value={s.user_id}>
                            {s.last_name} {s.first_name} ({s.email})
                        </option>
                    ))}
                </select>
                {/* FIXED: Nút thêm sinh viên màu xanh */}
                <button 
                    onClick={handleAddStudent}
                    disabled={!studentToAdd}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 disabled:opacity-50 text-sm flex items-center gap-1"
                >
                    <Plus className="w-4 h-4"/> Thêm
                </button>
              </div>

              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {classStudents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <UserIcon className="w-10 h-10 mb-2 opacity-20"/>
                        <p className="text-sm">Lớp chưa có sinh viên.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {classStudents.map(s => (
                            <div key={s.user_id} className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                                <div className="min-w-0">
                                    <div className="font-medium text-gray-900 text-sm">{s.last_name} {s.first_name}</div>
                                    <div className="text-xs text-gray-500 truncate">{s.email}</div>
                                </div>
                                <button 
                                    onClick={() => handleRemoveStudent(s.user_id)}
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition"
                                    title="Xóa khỏi lớp"
                                >
                                    <MinusCircle className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CREATE (FULL FIELDS) --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-primary text-primary-foreground flex justify-between items-center">
              <h2 className="text-xl font-bold">Tạo lớp học mới</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên lớp *</label>
                <input
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Lập trình Web"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Giáo viên phụ trách</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                >
                  <option value="">-- Chọn Giáo Viên --</option>
                  {teachers.map((t) => (
                    <option key={t.user_id} value={t.user_id}>
                      {t.last_name} {t.first_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Bắt đầu</label>
                    <input type="time" className="w-full border rounded p-2" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Kết thúc</label>
                    <input type="time" className="w-full border rounded p-2" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Thứ trong tuần</label>
                <select className="w-full border rounded p-2 bg-white" value={formData.days_of_week} onChange={e => setFormData({...formData, days_of_week: e.target.value})}>
                    {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả lớp học</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập mô tả ngắn gọn..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn màu chủ đạo</label>
                <div className="flex flex-wrap gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFormData({ ...formData, theme_color: t.value })}
                      className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-transform hover:scale-110 ${
                        formData.theme_color === t.value ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : ""
                      }`}
                      style={{ background: t.value }}
                    >
                      {formData.theme_color === t.value && <Check className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateClass}
                className="px-6 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-lg font-bold shadow-md transition"
              >
                Tạo lớp ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}