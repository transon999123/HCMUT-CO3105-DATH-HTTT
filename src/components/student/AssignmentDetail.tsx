// AssignmentDetail.tsx
import { useState } from "react";
import { ArrowLeft, Upload, Download, Calendar, Award } from "lucide-react";
import { DEMO_ASSIGNMENTS, DEMO_SUBMISSIONS } from "../../lib/mockData";

interface AssignmentDetailProps {
  assignmentId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function AssignmentDetail({
  assignmentId,
  onNavigate,
}: AssignmentDetailProps) {
  const assignment = DEMO_ASSIGNMENTS.find((a) => a.id === assignmentId);
  const [submissionText, setSubmissionText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!assignment) {
    return <div>Không tìm thấy bài tập</div>;
  }

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

  const statusInfo = getStatusInfo(assignment.status);
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date();

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onNavigate("assignments");
    }, 1500);
  };

  const mySubmission = DEMO_SUBMISSIONS.find(
    (s) => s.assignmentId === assignmentId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => onNavigate("assignments")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách bài tập
        </button>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Nộp bài thành công! Đang chuyển về danh sách bài tập...
        </div>
      )}

      {/* Assignment Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold">{assignment.title}</h2>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-sm text-gray-600">{assignment.courseName}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <Award className="w-4 h-4" />
                <span>{assignment.maxScore} điểm</span>
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  isOverdue ? "text-red-600" : "text-gray-600"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>
                  Hạn:{" "}
                  {dueDate.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Mô tả bài tập</h3>
              <p className="text-gray-600">{assignment.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Submission */}
      {mySubmission ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Bài nộp của bạn</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-600">Thời gian nộp</label>
              <p>
                {new Date(mySubmission.submittedAt).toLocaleString("vi-VN")}
              </p>
            </div>
            {mySubmission.fileUrl && (
              <div>
                <label className="text-sm text-gray-600">File đã nộp</label>
                <div className="flex items-center gap-2 mt-1">
                  <span>{mySubmission.fileUrl}</span>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {mySubmission.score !== undefined && (
              <div>
                <label className="text-sm text-gray-600">Điểm</label>
                <p className="text-blue-600">
                  {mySubmission.score}/{assignment.maxScore}
                </p>
              </div>
            )}
            {mySubmission.feedback && (
              <div>
                <label className="text-sm text-gray-600">
                  Nhận xét của giảng viên
                </label>
                <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                  <p>{mySubmission.feedback}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Submit Assignment Form
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Nộp bài tập</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                placeholder="Nhập ghi chú về bài làm của bạn..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Kéo và thả file hoặc</p>
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Chọn file
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Hỗ trợ: PDF, DOC, DOCX, ZIP (Tối đa 10MB)
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className={`flex-1 px-4 py-2 rounded-md text-white ${
                  isOverdue
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={isOverdue}
              >
                {isOverdue ? "Đã quá hạn" : "Nộp bài"}
              </button>
              <button
                onClick={() => onNavigate("assignments")}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
