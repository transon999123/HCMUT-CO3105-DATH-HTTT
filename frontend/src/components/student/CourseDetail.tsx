import { useState, useEffect } from "react";
import { ForumTab } from "./ForumTab"; // Giả sử để cùng thư mục
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Users,
  Download,
  Calendar,
  Award,
  Plus,
  XCircle,
  Upload,
  Video,
  Presentation,
  Loader2,
  Edit,
  Trash2,
  Paperclip
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../lib/authContext";

interface CourseDetailProps {
  courseId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function CourseDetail({ courseId, onNavigate }: CourseDetailProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE QUẢN LÝ BÀI TẬP (CREATE & EDIT) ---
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditingAssign, setIsEditingAssign] = useState(false); // Chế độ sửa hay tạo mới
  const [selectedAssignId, setSelectedAssignId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [assignFormData, setAssignFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: "10",
  });
  const [assignFile, setAssignFile] = useState<File | null>(null);

  // --- STATE UPLOAD TÀI LIỆU ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: "",
    type: "pdf" as "pdf" | "video" | "slide",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- LOAD DATA ---
  const fetchClassData = async () => {
    try {
      setIsLoading(true);
      const coursesRes = await api.get("/classes");
      const currentCourse = coursesRes.data.find(
        (c: any) => c.class_id == courseId
      );
      setCourse(currentCourse);

      const assignRes = await api.get(`/classes/${courseId}/assignments`);
      setAssignments(assignRes.data);

      const matRes = await api.get(`/classes/${courseId}/materials`);
      setMaterials(matRes.data);

      try {
        const stuRes = await api.get(`/classes/${courseId}/students`);
        setStudents(stuRes.data);
      } catch (e) {}
    } catch (error) {
      console.error("Lỗi tải dữ liệu lớp học:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchClassData();
  }, [courseId]);

  // --- XỬ LÝ BÀI TẬP (TẠO MỚI + CẬP NHẬT) ---
  
  const handleOpenCreateAssign = () => {
    setIsEditingAssign(false);
    setAssignFormData({ title: "", description: "", dueDate: "", maxScore: "10" });
    setAssignFile(null);
    setIsAssignModalOpen(true);
  };

  const handleOpenEditAssign = (e: React.MouseEvent, assign: any) => {
    e.stopPropagation(); // Ngăn chặn việc click vào dòng để xem chi tiết
    setIsEditingAssign(true);
    setSelectedAssignId(assign.assignment_id);
    
    // Format ngày giờ cho input datetime-local
    const dateObj = new Date(assign.end_date);
    dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
    const formattedDate = dateObj.toISOString().slice(0, 16);

    setAssignFormData({
        title: assign.title,
        description: assign.description || "",
        dueDate: formattedDate,
        maxScore: assign.scale
    });
    setAssignFile(null); // Reset file (nếu không chọn file mới thì giữ file cũ)
    setIsAssignModalOpen(true);
  };

  const handleDeleteAssign = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if(!confirm("Bạn có chắc chắn muốn xóa bài tập này không?")) return;
    try {
        await api.delete(`/assignments/${id}`);
        alert("Đã xóa bài tập!");
        fetchClassData();
    } catch (error) {
        alert("Lỗi khi xóa bài tập");
    }
  }

  const handleSaveAssignment = async () => {
    if (!assignFormData.title || !assignFormData.dueDate) {
      alert("Vui lòng nhập tiêu đề và hạn nộp!");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Dùng FormData để hỗ trợ upload file
      const formData = new FormData();
      formData.append("class_id", courseId);
      formData.append("title", assignFormData.title);
      formData.append("description", assignFormData.description);
      formData.append("scale", assignFormData.maxScore);
      formData.append("end_date", assignFormData.dueDate.replace("T", " ")); // Format lại ngày cho MySQL

      // Nếu tạo mới thì cần start_date
      if (!isEditingAssign) {
        formData.append("start_date", new Date().toISOString().slice(0, 19).replace("T", " "));
      }

      // Nếu có file mới thì append vào
      if (assignFile) {
        formData.append("file", assignFile);
      }

      if (isEditingAssign && selectedAssignId) {
        // GỌI API PUT (CẬP NHẬT)
        await api.put(`/assignments/${selectedAssignId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Cập nhật bài tập thành công!");
      } else {
        // GỌI API POST (TẠO MỚI)
        await api.post("/assignments", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Tạo bài tập thành công!");
      }

      setIsAssignModalOpen(false);
      fetchClassData(); // Reload lại danh sách
    } catch (error) {
      alert("Lỗi khi lưu bài tập!");
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- XỬ LÝ UPLOAD TÀI LIỆU (GIỮ NGUYÊN) ---
  const handleUploadMaterial = async () => {
    if (!materialForm.title || !selectedFile) {
        alert("Vui lòng nhập tiêu đề và chọn file!");
        return;
    }
    try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("class_id", courseId);
        formData.append("title", materialForm.title);
        formData.append("material_type", materialForm.type);
        formData.append("file", selectedFile);

        await api.post("/materials", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Upload tài liệu thành công!");
        setIsUploadModalOpen(false);
        setMaterialForm({ title: "", type: "pdf" });
        setSelectedFile(null);
        fetchClassData();
    } catch (error: any) {
        alert(error.response?.data?.message || "Lỗi upload!");
    } finally {
        setIsUploading(false);
    }
  };

  // --- RENDER HELPERS ---
  if (isLoading) return <div className="p-8 text-center">Đang tải dữ liệu lớp học...</div>;
  if (!course) return <div className="p-8 text-center">Không tìm thấy lớp học.</div>;

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "materials", label: "Tài liệu" },
    { id: "assignments", label: "Bài tập" },
    { id: "forum", label: "Thảo luận" },
    { id: "members", label: "Mọi người" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="w-6 h-6 text-red-500" />;
      case "video": return <Video className="w-6 h-6 text-blue-500" />;
      case "slide": return <Presentation className="w-6 h-6 text-orange-500" />;
      default: return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <button
          onClick={() => onNavigate("courses")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách lớp
        </button>

        {/* BANNER: Dùng style background động */}
        <div 
            className="h-56 rounded-xl relative overflow-hidden shadow-lg mb-6 flex flex-col justify-end p-8"
            style={{ 
                background: course.theme_color || 'linear-gradient(to right, #2563eb, #4f46e5)' 
            }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <BookOpen className="w-64 h-64 text-white" />
          </div>
          
          <div className="relative z-10 text-white">
            <div className="text-white/90 text-sm font-bold mb-2 uppercase tracking-widest bg-black/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
              Mã lớp: {course.class_code || course.class_id}
            </div>
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">{course.class_name}</h1>
            <p className="text-white/90 flex items-center gap-2 text-lg font-medium">
              <Users className="w-5 h-5" />
              {course.first_name
                ? `Giảng viên: ${course.last_name} ${course.first_name}`
                : "Chưa có giáo viên"}
            </p>
          </div>
        </div>
      </div>

      {/* TABS - Làm to và dễ bấm hơn */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <nav className="flex space-x-2 p-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENT: TỔNG QUAN */}
      {activeTab === "overview" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-3">Mô tả lớp học</h3>
            <p className="text-gray-600 leading-relaxed">
              {course.class_description || "Không có mô tả nào cho lớp học này."}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-3">Thông tin lịch học</h3>
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>
                {course.days_of_week} ({String(course.start_time).slice(0, 5)} -{" "}
                {String(course.end_time).slice(0, 5)})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: TÀI LIỆU */}
      {activeTab === "materials" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {isTeacher && (
            <div className="flex justify-end">
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Thêm tài liệu
              </button>
            </div>
          )}

          {materials.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-500">Chưa có tài liệu nào.</p>
            </div>
          ) : (
            materials.map((doc) => (
              <div key={doc.material_id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{doc.title}</h4>
                    <p className="text-sm text-gray-500">
                      Đăng ngày: {new Date(doc.upload_date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <a
                  href={doc.material_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            ))
          )}
        </div>
      )}
      {/* CONTENT: THẢO LUẬN */}
      {activeTab === "forum" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ForumTab courseId={courseId} />
          </div>
      )}

      {/* CONTENT: BÀI TẬP */}
      {activeTab === "assignments" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {isTeacher && (
            <div className="flex justify-end mb-4">
              <button
                onClick={handleOpenCreateAssign}
                className="bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition shadow-sm font-bold"
              >
                <Plus className="w-5 h-5" /> Tạo bài tập mới
              </button>
            </div>
          )}

          {assignments.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-500">Chưa có bài tập nào.</p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.assignment_id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer group"
                onClick={() =>
                  onNavigate("assignment-detail", {
                    assignmentId: assignment.assignment_id,
                  })
                }
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
                        {assignment.attachment_url && <Paperclip className="w-4 h-4 text-gray-400" />}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>Hạn nộp: {new Date(assignment.end_date).toLocaleString("vi-VN")}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {assignment.scale} điểm
                    </span>
                    
                    {/* NÚT EDIT & DELETE (CHỈ HIỆN CHO GIÁO VIÊN) */}
                    {isTeacher && (
                        <div className="flex gap-1 ml-2">
                            <button 
                                onClick={(e) => handleOpenEditAssign(e, assignment)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                                title="Sửa"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={(e) => handleDeleteAssign(e, assignment.assignment_id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                                title="Xóa"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CONTENT: MỌI NGƯỜI */}
      {activeTab === "members" && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-700">Danh sách thành viên ({students.length})</h3>
          </div>
          <div className="divide-y">
            {students.map((student) => (
              <div key={student.user_id} className="p-4 flex items-center gap-3 hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {student.first_name?.[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {student.last_name} {student.first_name}
                  </div>
                  <div className="text-sm text-gray-500">{student.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL TẠO / SỬA BÀI TẬP --- */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-0 overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {isEditingAssign ? "Cập nhật bài tập" : "Thêm bài tập mới"}
              </h2>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tiêu đề bài tập *
                </label>
                <input
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  value={assignFormData.title}
                  onChange={(e) => setAssignFormData({ ...assignFormData, title: e.target.value })}
                  placeholder="VD: Bài tập tuần 1..."
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Hạn nộp *
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={assignFormData.dueDate}
                    onChange={(e) => setAssignFormData({ ...assignFormData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Thang điểm
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={assignFormData.maxScore}
                    onChange={(e) => setAssignFormData({ ...assignFormData, maxScore: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Đính kèm file (Tùy chọn)
                </label>
                <input 
                    type="file" 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => setAssignFile(e.target.files?.[0] || null)}
                />
                {isEditingAssign && !assignFile && (
                    <p className="text-xs text-gray-400 mt-1 italic">Để trống nếu không muốn thay đổi file cũ.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mô tả / Đề bài
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={assignFormData.description}
                  onChange={(e) => setAssignFormData({ ...assignFormData, description: e.target.value })}
                  placeholder="Nhập nội dung đề bài tại đây..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveAssignment}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 font-bold shadow-md transition flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin"/>}
                {isEditingAssign ? "Lưu thay đổi" : "Tạo bài tập"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL UPLOAD TÀI LIỆU --- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Upload tài liệu</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Tiêu đề *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Slide bài giảng tuần 1"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Loại tài liệu</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={materialForm.type}
                  onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value as any })}
                >
                  <option value="pdf">PDF / Word</option>
                  <option value="video">Video</option>
                  <option value="slide">Slide (PowerPoint)</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl p-6 text-center relative hover:bg-blue-50 transition cursor-pointer group">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center">
                  <Upload className="w-10 h-10 text-blue-500 mb-2" />
                  {selectedFile ? (
                    <p className="font-bold text-blue-700 break-all px-2">{selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium">Nhấn để chọn file</p>
                      <p className="text-xs text-gray-500 mt-1">Hỗ trợ PDF, DOCX, MP4...</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleUploadMaterial}
                disabled={isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-70"
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUploading ? "Đang xử lý..." : "Upload ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}