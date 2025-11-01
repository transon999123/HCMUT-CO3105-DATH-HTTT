// StudentDocuments.tsx
import { useState } from "react";
import {
  Search,
  Download,
  FileText,
  Video,
  Presentation,
  BookOpen,
} from "lucide-react";
import {
  DEMO_DOCUMENTS,
  DEMO_COURSES,
  COURSE_ENROLLMENTS,
  User,
} from "../../lib/mockData";

interface StudentDocumentsProps {
  user: User;
  onNavigate: (page: string, data?: any) => void;
}

export function StudentDocuments({ user, onNavigate }: StudentDocumentsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const myCourses = DEMO_COURSES.filter((course) =>
    COURSE_ENROLLMENTS[course.id]?.includes(user.id)
  );

  const myDocuments = DEMO_DOCUMENTS.filter((doc) =>
    myCourses.some((course) => course.id === doc.courseId)
  );

  const filteredDocuments = myDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tài liệu theo lớp học */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Tài liệu theo lớp học</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {myCourses.map((course) => {
              const courseDocs = myDocuments.filter(
                (d) => d.courseId === course.id
              );
              if (courseDocs.length === 0) {
                return (
                  <div
                    key={course.id}
                    className="border-b last:border-b-0 pb-4 last:pb-0"
                  >
                    <div
                      className="flex items-center gap-2 mb-3 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() =>
                        onNavigate("course-detail", { courseId: course.id })
                      }
                    >
                      <BookOpen className="w-5 h-5" />
                      <h3 className="font-medium">{course.name}</h3>
                      <span className="text-sm text-gray-600">(0)</span>
                    </div>
                    <div className="text-center py-6 text-gray-600">
                      Chưa có tài liệu nào
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={course.id}
                  className="border-b last:border-b-0 pb-4 last:pb-0"
                >
                  <div
                    className="flex items-center gap-2 mb-3 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() =>
                      onNavigate("course-detail", { courseId: course.id })
                    }
                  >
                    <BookOpen className="w-5 h-5" />
                    <h3 className="font-medium">{course.name}</h3>
                    <span className="text-sm text-gray-600">
                      ({courseDocs.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {courseDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getIcon(doc.type)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <span>{doc.category}</span>
                              <span>•</span>
                              <span>
                                {new Date(doc.uploadedAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                              <span>•</span>
                              <span className="text-blue-600">
                                {getTypeLabel(doc.type)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="p-2 text-gray-600 hover:bg-gray-200 rounded">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {myCourses.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="mb-2 font-medium">
                  Bạn chưa tham gia lớp học nào
                </h3>
                <p className="text-sm mb-4">
                  Tham gia lớp học để xem tài liệu học tập
                </p>
                <button
                  onClick={() => onNavigate("courses")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Đến Lớp học của tôi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
