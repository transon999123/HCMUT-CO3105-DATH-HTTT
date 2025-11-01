// TeacherAssignments.tsx
import { useState } from "react";
import { Search, Plus, Edit, Trash2, Users, Eye } from "lucide-react";
import {
  DEMO_ASSIGNMENTS,
  DEMO_COURSES,
  DEMO_SUBMISSIONS,
  User,
  Submission,
} from "../../lib/mockData";

interface TeacherAssignmentsProps {
  user: User;
  onNavigate: (page: string, data?: any) => void;
}

export function TeacherAssignments({
  user,
  onNavigate,
}: TeacherAssignmentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(
    null
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [gradeData, setGradeData] = useState({ score: "", feedback: "" });
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
    maxScore: "100",
  });

  const myCourses = DEMO_COURSES.filter(
    (course) => course.teacherId === user.id
  );
  const myAssignments = DEMO_ASSIGNMENTS.filter((assignment) =>
    myCourses.some((course) => course.id === assignment.courseId)
  );

  const filteredAssignments = myAssignments.filter(
    (assignment) =>
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateAssignment = () => {
    setCreateDialogOpen(false);
    setFormData({
      courseId: "",
      title: "",
      description: "",
      dueDate: "",
      maxScore: "100",
    });
  };

  const getSubmissionStats = (assignmentId: string) => {
    const submissions = DEMO_SUBMISSIONS.filter(
      (s) => s.assignmentId === assignmentId
    );
    const graded = submissions.filter((s) => s.status === "graded").length;
    return { total: submissions.length, graded };
  };

  const handleViewSubmissions = (assignmentId: string) => {
    setSelectedAssignment(assignmentId);
    setGradeDialogOpen(true);
  };

  const assignmentSubmissions = selectedAssignment
    ? DEMO_SUBMISSIONS.filter((s) => s.assignmentId === selectedAssignment)
    : [];

  const handleOpenSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setSubmissionDialogOpen(true);
  };

  const handleGradeSubmission = () => {
    if (selectedSubmission) {
      setGradeDialogOpen(false);
      setSubmissionDialogOpen(false);
      setGradeData({ score: "", feedback: "" });
      setSelectedSubmission(null);
      setSelectedAssignment(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý bài tập</h1>
          <p className="text-gray-600">Tạo và quản lý bài tập cho lớp học</p>
        </div>

        <button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Tạo bài tập mới
        </button>
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

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Danh sách bài tập ({filteredAssignments.length})
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-medium">Tiêu đề</th>
                  <th className="text-left py-3 font-medium">Lớp học</th>
                  <th className="text-left py-3 font-medium">Hạn nộp</th>
                  <th className="text-left py-3 font-medium">Điểm</th>
                  <th className="text-left py-3 font-medium">Bài nộp</th>
                  <th className="text-right py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => {
                  const stats = getSubmissionStats(assignment.id);
                  const dueDate = new Date(assignment.dueDate);
                  const isOverdue = dueDate < new Date();

                  return (
                    <tr
                      key={assignment.id}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      <td className="py-3">{assignment.title}</td>
                      <td className="py-3">{assignment.courseName}</td>
                      <td className="py-3">
                        <span className={isOverdue ? "text-red-600" : ""}>
                          {dueDate.toLocaleDateString("vi-VN")}
                        </span>
                      </td>
                      <td className="py-3">{assignment.maxScore}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span>
                            {stats.graded}/{stats.total}
                          </span>
                          {stats.total > 0 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {stats.total - stats.graded} chờ chấm
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewSubmissions(assignment.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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

          {filteredAssignments.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              Không tìm thấy bài tập nào
            </div>
          )}
        </div>
      </div>

      {/* Create Assignment Dialog */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Tạo bài tập mới</h3>
              <p className="text-gray-600">
                Nhập thông tin để tạo bài tập cho lớp học
              </p>
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
                  Tiêu đề bài tập
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  placeholder="Mô tả yêu cầu bài tập..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hạn nộp
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Điểm tối đa
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={formData.maxScore}
                    onChange={(e) =>
                      setFormData({ ...formData, maxScore: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setCreateDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateAssignment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Tạo bài tập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Dialog */}
      {gradeDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                Danh sách bài nộp và chấm điểm
              </h3>
              <p className="text-gray-600">
                Xem và chấm điểm bài nộp của sinh viên
              </p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-medium">Sinh viên</th>
                      <th className="text-left py-3 font-medium">
                        Thời gian nộp
                      </th>
                      <th className="text-left py-3 font-medium">File</th>
                      <th className="text-left py-3 font-medium">Điểm</th>
                      <th className="text-left py-3 font-medium">Trạng thái</th>
                      <th className="text-right py-3 font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentSubmissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="border-b border-gray-200 last:border-b-0"
                      >
                        <td className="py-3">{submission.studentName}</td>
                        <td className="py-3">
                          {new Date(submission.submittedAt).toLocaleString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="py-3">{submission.fileUrl || "-"}</td>
                        <td className="py-3">
                          {submission.score !== undefined
                            ? submission.score
                            : "-"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              submission.status === "graded"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {submission.status === "graded"
                              ? "Đã chấm"
                              : "Chưa chấm"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleOpenSubmission(submission)}
                            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Chấm điểm
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {assignmentSubmissions.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  Chưa có bài nộp nào
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setGradeDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Dialog */}
      {submissionDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Chấm điểm bài nộp</h3>
              <p className="text-gray-600">
                Nhập điểm số và phản hồi cho bài nộp của sinh viên
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Điểm số
                </label>
                <input
                  type="number"
                  placeholder="Nhập điểm số..."
                  value={gradeData.score}
                  onChange={(e) =>
                    setGradeData({ ...gradeData, score: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phản hồi
                </label>
                <textarea
                  placeholder="Nhập phản hồi..."
                  value={gradeData.feedback}
                  onChange={(e) =>
                    setGradeData({ ...gradeData, feedback: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setSubmissionDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleGradeSubmission}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Chấm điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
