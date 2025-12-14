import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Upload,
  FileText,
  Video,
  Presentation,
  Download,
  Loader2,
  BookOpen
} from "lucide-react";
import api from "../../services/api";
import { User } from "../../lib/authContext";

interface TeacherDocumentsProps {
  user: User;
}

export function TeacherDocuments({ user }: TeacherDocumentsProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    type: "pdf" as "pdf" | "video" | "slide",
    category: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 1. Load Classes & Documents
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Bước 1: Lấy danh sách lớp giáo viên đang dạy
      const coursesRes = await api.get("/classes");
      setMyCourses(coursesRes.data);

      // Bước 2: Lấy tài liệu của từng lớp và gộp lại thành 1 danh sách
      if (coursesRes.data.length > 0) {
        const promises = coursesRes.data.map((c: any) =>
          api.get(`/classes/${c.class_id}/materials`).then((res) =>
            res.data.map((doc: any) => ({
              ...doc,
              courseName: c.class_name, // Gắn thêm tên lớp để hiển thị ra bảng
            }))
          )
        );
        const results = await Promise.all(promises);
        setDocuments(results.flat());
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Xử lý Upload File
  const handleUpload = async () => {
    if (!formData.courseId || !formData.title || !selectedFile) {
      alert("Vui lòng chọn lớp, nhập tiêu đề và chọn file!");
      return;
    }

    try {
      setIsUploading(true);
      
      // Quan trọng: Dùng FormData để gửi file lên Server
      const data = new FormData();
      data.append("class_id", formData.courseId);
      data.append("title", formData.title);
      data.append("material_type", formData.type);
      data.append("file", selectedFile); // Backend đang đợi field tên là 'file'

      // Gọi API POST /materials
      await api.post("/materials", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Upload thành công!");
      setUploadDialogOpen(false);
      
      // Reset form
      setFormData({ courseId: "", title: "", type: "pdf", category: "" });
      setSelectedFile(null);
      
      // Load lại danh sách
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi upload!");
    } finally {
      setIsUploading(false);
    }
  };

  // UI Helpers
  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="w-5 h-5 text-red-500" />;
      case "video": return <Video className="w-5 h-5 text-blue-500" />;
      case "slide": return <Presentation className="w-5 h-5 text-orange-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý tài liệu</h1>
          <p className="text-gray-600">Upload và chia sẻ tài liệu cho sinh viên</p>
        </div>
        {/* NÚT UPLOAD TÀI LIỆU HEADER */}
        <button
          onClick={() => setUploadDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-lg shadow-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> Upload tài liệu
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tìm kiếm tài liệu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table Danh sách tài liệu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-700">Tất cả tài liệu ({filteredDocuments.length})</h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white border-b">
                <tr>
                  <th className="py-3 px-6 font-medium text-gray-500">Tên tài liệu</th>
                  <th className="py-3 px-6 font-medium text-gray-500">Lớp học</th>
                  <th className="py-3 px-6 font-medium text-gray-500">Loại</th>
                  <th className="py-3 px-6 font-medium text-gray-500">Ngày đăng</th>
                  <th className="py-3 px-6 font-medium text-gray-500 text-right">Tải về</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.material_id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3 font-medium text-gray-900">
                        {getIcon(doc.material_type)}
                        {doc.title}
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">
                        <BookOpen className="w-3 h-3" />
                        {doc.courseName}
                      </span>
                    </td>
                    <td className="py-3 px-6 capitalize text-sm text-gray-600">{doc.material_type}</td>
                    <td className="py-3 px-6 text-sm text-gray-600">
                        {new Date(doc.upload_date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-6 text-right">
                        <a 
                          href={doc.material_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition"
                          title="Tải xuống"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12 text-gray-500">Chưa có tài liệu nào được tải lên.</div>
            )}
          </div>
        )}
      </div>

      {/* Modal Upload */}
      {uploadDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Upload tài liệu mới</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Lớp học *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                >
                  <option value="">-- Chọn lớp để đăng tài liệu --</option>
                  {myCourses.map((c) => (
                    <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Tiêu đề tài liệu *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Bài giảng Chương 1 - Nhập môn"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Loại tài liệu</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="pdf">PDF / Word</option>
                  <option value="video">Video</option>
                  <option value="slide">Slide (PowerPoint)</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl p-8 text-center relative hover:bg-blue-50 transition cursor-pointer group">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center">
                  <Upload className="w-10 h-10 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                  {selectedFile ? (
                    <p className="font-bold text-blue-700 break-all px-4">{selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium">Nhấn để chọn file</p>
                      <p className="text-xs text-gray-500 mt-1">Hỗ trợ PDF, DOCX, PPTX, MP4...</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setUploadDialogOpen(false)}
                className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition"
              >
                Hủy bỏ
              </button>
              {/* NÚT UPLOAD - DÙNG BG-PRIMARY */}
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:opacity-90 shadow-md flex items-center gap-2 transition"                >
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