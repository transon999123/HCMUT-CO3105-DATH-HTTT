// TeacherDocuments.tsx
import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  Video,
  Presentation,
} from "lucide-react";
import { DEMO_DOCUMENTS, DEMO_COURSES, User } from "../../lib/mockData";

interface TeacherDocumentsProps {
  user: User;
}

export function TeacherDocuments({ user }: TeacherDocumentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    type: "pdf" as "pdf" | "video" | "slide",
    category: "",
  });

  const myCourses = DEMO_COURSES.filter(
    (course) => course.teacherId === user.id
  );
  const myDocuments = DEMO_DOCUMENTS.filter((doc) =>
    myCourses.some((course) => course.id === doc.courseId)
  );

  const filteredDocuments = myDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = () => {
    setUploadDialogOpen(false);
    setFormData({
      courseId: "",
      title: "",
      type: "pdf",
      category: "",
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "video":
        return <Video className="w-5 h-5 text-blue-500" />;
      case "slide":
        return <Presentation className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      pdf: "PDF",
      video: "Video",
      slide: "Slide",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý tài liệu</h1>
          <p className="text-gray-600">Upload và quản lý tài liệu học tập</p>
        </div>

        <button
          onClick={() => setUploadDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Plus className="w-4 h-4" />
          Upload tài liệu
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tìm kiếm tài liệu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Danh sách tài liệu ({filteredDocuments.length})
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-medium">Tiêu đề</th>
                  <th className="text-left py-3 font-medium">Lớp học</th>
                  <th className="text-left py-3 font-medium">Loại</th>
                  <th className="text-left py-3 font-medium">Phân loại</th>
                  <th className="text-left py-3 font-medium">Ngày upload</th>
                  <th className="text-right py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => {
                  const course = myCourses.find((c) => c.id === doc.courseId);

                  return (
                    <tr
                      key={doc.id}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {getIcon(doc.type)}
                          <span>{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-3">{course?.name}</td>
                      <td className="py-3">{getTypeLabel(doc.type)}</td>
                      <td className="py-3">{doc.category}</td>
                      <td className="py-3">
                        {new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              Không tìm thấy tài liệu nào
            </div>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      {uploadDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Upload tài liệu mới</h3>
              <p className="text-gray-600">Thêm tài liệu học tập cho lớp học</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Lớp học
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn lớp học</option>
                  {myCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tiêu đề tài liệu
                </label>
                <input
                  placeholder="Nhập tiêu đề..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Loại tài liệu
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "pdf" | "video" | "slide",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="slide">Slide</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phân loại
                  </label>
                  <input
                    placeholder="VD: Chương 1"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Kéo và thả file hoặc</p>
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  Chọn file
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Hỗ trợ: PDF, MP4, PPTX (Tối đa 100MB)
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setUploadDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
