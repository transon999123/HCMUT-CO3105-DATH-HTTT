// StudentAssignments.tsx
import { useState } from "react";
import { Search, Calendar, Award, BookOpen } from "lucide-react";
import {
  DEMO_ASSIGNMENTS,
  DEMO_COURSES,
  COURSE_ENROLLMENTS,
  User,
} from "../../lib/mockData";

interface StudentAssignmentsProps {
  user: User;
  onNavigate: (page: string, data?: any) => void;
}

export function StudentAssignments({
  user,
  onNavigate,
}: StudentAssignmentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const myCourses = DEMO_COURSES.filter((course) =>
    COURSE_ENROLLMENTS[course.id]?.includes(user.id)
  );

  const myAssignments = DEMO_ASSIGNMENTS.filter((assignment) =>
    myCourses.some((course) => course.id === assignment.courseId)
  );

  const filteredAssignments = myAssignments.filter(
    (assignment) =>
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingAssignments = filteredAssignments.filter(
    (a) => a.status === "pending"
  );
  const submittedAssignments = filteredAssignments.filter(
    (a) => a.status === "submitted"
  );
  const gradedAssignments = filteredAssignments.filter(
    (a) => a.status === "graded"
  );
  const overdueAssignments = filteredAssignments.filter(
    (a) => a.status === "overdue"
  );

  const getStatusInfo = (status: string) => {
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

  const renderAssignmentCard = (assignment: (typeof DEMO_ASSIGNMENTS)[0]) => {
    const statusInfo = getStatusInfo(assignment.status);
    const dueDate = new Date(assignment.dueDate);

    return (
      <div
        key={assignment.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() =>
          onNavigate("assignment-detail", { assignmentId: assignment.id })
        }
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{assignment.title}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>{assignment.courseName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Hạn: {dueDate.toLocaleDateString("vi-VN")}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <Award className="w-4 h-4" />
              <span>{assignment.maxScore} điểm</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "all", label: "Tất cả", count: filteredAssignments.length },
    { id: "pending", label: "Chưa nộp", count: pendingAssignments.length },
    { id: "submitted", label: "Đã nộp", count: submittedAssignments.length },
    { id: "graded", label: "Đã chấm", count: gradedAssignments.length },
    { id: "overdue", label: "Quá hạn", count: overdueAssignments.length },
  ];

  const getAssignmentsForTab = () => {
    switch (activeTab) {
      case "pending":
        return pendingAssignments;
      case "submitted":
        return submittedAssignments;
      case "graded":
        return gradedAssignments;
      case "overdue":
        return overdueAssignments;
      default:
        return filteredAssignments;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bài tập của tôi</h1>
        <p className="text-gray-600">Quản lý và theo dõi các bài tập</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tìm kiếm bài tập..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabs */}
      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-1 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {getAssignmentsForTab().map(renderAssignmentCard)}
          </div>
          {getAssignmentsForTab().length === 0 && (
            <div className="text-center py-12 text-gray-600">
              {activeTab === "all"
                ? "Không tìm thấy bài tập nào"
                : `Không có bài tập ${tabs
                    .find((t) => t.id === activeTab)
                    ?.label.toLowerCase()}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
