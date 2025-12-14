import { useState, useEffect } from "react";
import {
  Search,
  Download,
  FileText,
  Video,
  Presentation,
  BookOpen,
  Loader2
} from "lucide-react";
import api from "../../services/api";
import { User } from "../../lib/authContext";

interface StudentDocumentsProps {
  user: User;
  onNavigate: (page: string, data?: any) => void;
}

export function StudentDocuments({ user, onNavigate }: StudentDocumentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseDocuments, setCourseDocuments] = useState<any[]>([]); // Lưu dạng [{ courseName, courseId, docs: [] }]
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // 1. Lấy danh sách lớp sinh viên đã tham gia
        const coursesRes = await api.get("/classes");
        const myCourses = coursesRes.data;

        if (myCourses.length > 0) {
          // 2. Lấy tài liệu cho từng lớp
          const promises = myCourses.map(async (course: any) => {
            try {
              const docsRes = await api.get(`/classes/${course.class_id}/materials`);
              return {
                courseId: course.class_id,
                courseName: course.class_name,
                docs: docsRes.data // Mảng tài liệu của lớp đó
              };
            } catch (err) {
              return { courseId: course.class_id, courseName: course.class_name, docs: [] };
            }
          });

          const results = await Promise.all(promises);
          setCourseDocuments(results);
        }
      } catch (error) {
        console.error("Lỗi tải tài liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="w-5 h-5 text-red-500" />;
      case "video": return <Video className="w-5 h-5 text-blue-500" />;
      case "slide": return <Presentation className="w-5 h-5 text-orange-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
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
      <div>
        <h1 className="text-2xl font-bold">Tài liệu học tập</h1>
        <p className="text-gray-600">Tài liệu từ các lớp học của bạn</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tìm kiếm tài liệu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Danh sách tài liệu */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Kho tài liệu</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {courseDocuments.map((item) => {
                // Lọc tài liệu theo từ khóa tìm kiếm (nếu có)
                const filteredDocs = item.docs.filter((d: any) => 
                  d.title.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredDocs.length === 0) return null;

                return (
                  <div key={item.courseId} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Header Tên Lớp */}
                    <div 
                      className="bg-blue-50/50 p-4 border-b border-gray-200 flex items-center gap-2 cursor-pointer hover:bg-blue-50 transition"
                      onClick={() => onNavigate("course-detail", { courseId: item.courseId })}
                    >
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-gray-900">{item.courseName}</h3>
                      <span className="text-xs bg-white border px-2 py-0.5 rounded-full text-gray-500 font-medium">
                        {filteredDocs.length} tài liệu
                      </span>
                    </div>

                    {/* Danh sách file */}
                    <div className="divide-y divide-gray-100">
                      {filteredDocs.map((doc: any) => (
                        <div
                          key={doc.material_id}
                          className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition">
                                {getIcon(doc.material_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">{doc.title}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded capitalize">{getTypeLabel(doc.material_type)}</span>
                                <span>•</span>
                                <span>{new Date(doc.upload_date).toLocaleDateString("vi-VN")}</span>
                              </div>
                            </div>
                          </div>
                          <a
                            href={doc.material_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Tải xuống"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {courseDocuments.every(item => item.docs.length === 0) && (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-medium">Chưa có tài liệu nào</h3>
                  <p className="text-gray-500 text-sm mt-1">Giáo viên chưa đăng tải tài liệu cho các lớp học của bạn.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}