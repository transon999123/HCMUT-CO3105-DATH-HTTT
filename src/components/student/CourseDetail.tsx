// CourseDetail.tsx
import { useState } from "react";
import { ArrowLeft, BookOpen, FileText, Users, Download } from "lucide-react";
import {
  DEMO_COURSES,
  DEMO_ASSIGNMENTS,
  DEMO_DOCUMENTS,
  COURSE_ENROLLMENTS,
  DEMO_USERS,
} from "../../lib/mockData";

interface CourseDetailProps {
  courseId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function CourseDetail({ courseId, onNavigate }: CourseDetailProps) {
  const course = DEMO_COURSES.find((c) => c.id === courseId);
  const assignments = DEMO_ASSIGNMENTS.filter((a) => a.courseId === courseId);
  const documents = DEMO_DOCUMENTS.filter((d) => d.courseId === courseId);
  const enrolledStudentIds = COURSE_ENROLLMENTS[courseId] || [];
  const enrolledStudents = DEMO_USERS.filter((u) =>
    enrolledStudentIds.includes(u.id)
  );
  const [activeTab, setActiveTab] = useState("overview");

  if (!course) {
    return <div>Không tìm thấy lớp học</div>;
  }

  const getStatusBadge = (status: string) => {
    const variants: {
      [key: string]: { label: string; color: string; bgColor: string };
    } = {
      pending: {
        label: "Chưa nộp",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
      submitted: {
        label: "Đã nộp",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      graded: {
        label: "Đã chấm",
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      overdue: {
        label: "Quá hạn",
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
    };
    return variants[status] || variants.pending;
  };

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "documents", label: "Tài liệu" },
    { id: "assignments", label: "Bài tập" },
    { id: "members", label: "Thành viên" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => onNavigate("courses")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách lớp
        </button>

        <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg relative overflow-hidden mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-white opacity-30" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <div className="text-white mb-2">{course.code}</div>
            <h1 className="text-white text-2xl font-bold">{course.name}</h1>
            <p className="text-white/90 mt-1">
              {course.teacherName} • {course.semester}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4 mt-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Mô tả lớp học</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600">{course.description}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Giảng viên</h3>
                </div>
                <div className="p-6">
                  <p>{course.teacherName}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Số sinh viên</h3>
                </div>
                <div className="p-6">
                  <p className="text-blue-600">{course.studentCount}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Học kỳ</h3>
                </div>
                <div className="p-6">
                  <p>{course.semester}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-4 mt-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Tài liệu học tập</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <div>{doc.title}</div>
                          <div className="text-sm text-gray-600">
                            {doc.category} •{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-gray-600 hover:bg-gray-200 rounded">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <div className="text-center py-8 text-gray-600">
                      Chưa có tài liệu nào
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="space-y-4 mt-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Danh sách bài tập</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {assignments.map((assignment) => {
                    const statusInfo = getStatusBadge(assignment.status);
                    return (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() =>
                          onNavigate("assignment-detail", {
                            assignmentId: assignment.id,
                          })
                        }
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{assignment.title}</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Hạn nộp:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {assignment.maxScore} điểm
                        </div>
                      </div>
                    );
                  })}
                  {assignments.length === 0 && (
                    <div className="text-center py-8 text-gray-600">
                      Chưa có bài tập nào
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-4 mt-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">
                  Thành viên ({enrolledStudents.length} sinh viên)
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {enrolledStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-2"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div>{student.name}</div>
                        <div className="text-sm text-gray-600">
                          {student.studentId}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
