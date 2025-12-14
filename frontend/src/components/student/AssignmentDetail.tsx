import { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Download,
  X,
  Paperclip,
  AlertCircle,
  Edit // Thêm icon Edit
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../lib/authContext";

interface AssignmentDetailProps {
  assignmentId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function AssignmentDetail({
  assignmentId,
  onNavigate,
}: AssignmentDetailProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  const [assignment, setAssignment] = useState<any>(null);
  const [studentSubmission, setStudentSubmission] = useState<any>(null);
  
  const [submittedList, setSubmittedList] = useState<any[]>([]);
  const [notSubmittedList, setNotSubmittedList] = useState<any[]>([]);

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // State mới để xác định xem đang là chế độ "Chỉnh sửa bài nộp" hay "Nộp mới"
  const [isEditingSubmission, setIsEditingSubmission] = useState(false);

  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [gradeData, setGradeData] = useState({ score: "", feedback: "" });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // 1. Lấy thông tin bài tập
      const classesRes = await api.get("/classes");
      let foundAssign = null;
      if (classesRes.data.length > 0) {
        const promises = classesRes.data.map((c: any) =>
          api.get(`/classes/${c.class_id}/assignments`)
        );
        const results = await Promise.all(promises);
        const allAssigns = results.map((r) => r.data).flat();
        foundAssign = allAssigns.find(
          (a: any) => a.assignment_id == assignmentId
        );
      }
      setAssignment(foundAssign);

      // 2. Lấy dữ liệu bài nộp
      if (isTeacher) {
        const subRes = await api.get(
          `/assignments/${assignmentId}/submissions`
        );
        const allData = subRes.data;
        setSubmittedList(allData.filter((s: any) => s.isSubmitted));
        setNotSubmittedList(allData.filter((s: any) => !s.isSubmitted));
      } else {
        const subRes = await api.get(
          `/assignments/${assignmentId}/my-submission`
        );
        if (subRes.data.submitted) {
          setStudentSubmission(subRes.data.data);
        } else {
          setStudentSubmission(null);
        }
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- XỬ LÝ NỘP BÀI (CREATE / UPDATE) ---
  const handleStudentSubmit = async () => {
    // Nếu là tạo mới thì bắt buộc phải có file. 
    // Nếu là edit thì có thể không cần file (giữ file cũ), chỉ sửa mô tả.
    if (!isEditingSubmission && !file) return alert("Vui lòng chọn file!");

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("assignment_id", assignmentId);
      formData.append("submission_description", description);
      
      if (file) {
        formData.append("file", file);
      }

      if (isEditingSubmission) {
        // GỌI API UPDATE (PUT)
        await api.put("/submissions/student", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Cập nhật bài nộp thành công!");
      } else {
        // GỌI API CREATE (POST)
        await api.post("/submissions", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Nộp bài thành công!");
      }
      
      setShowUploadForm(false);
      setIsEditingSubmission(false);
      setFile(null); // Reset file
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi nộp bài!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenGrading = (sub: any) => {
    setGradingSubmission(sub);
    setGradeData({
      score: sub.score || "",
      feedback: sub.teacher_comment || "",
    });
  };

  const handleSubmitGrade = async () => {
    if (!gradingSubmission) return;
    const scoreNum = parseFloat(gradeData.score);
    const maxScore = parseFloat(assignment.scale);

    if (isNaN(scoreNum)) {
        alert("Vui lòng nhập điểm số hợp lệ!");
        return;
    }
    if (scoreNum < 0 || scoreNum > maxScore) {
        alert(`Điểm số không hợp lệ! Phải từ 0 đến ${maxScore}.`);
        return;
    }

    try {
      await api.put(`/submissions/${gradingSubmission.submission_id}`, {
        score: gradeData.score,
        teacher_comment: gradeData.feedback,
      });
      alert("Đã lưu điểm!");
      setGradingSubmission(null);
      fetchData();
    } catch (error) {
      alert("Lỗi chấm điểm!");
    }
  };

  // Nút mở form edit cho sinh viên
  const handleOpenEditSubmission = () => {
    // Fill dữ liệu cũ vào form
    setDescription(studentSubmission.submission_description || "");
    setFile(null); // File để trống, người dùng tự chọn lại nếu muốn đổi
    setIsEditingSubmission(true);
    setShowUploadForm(true);
  };

  if (isLoading) return <div className="p-8 text-center">Đang tải...</div>;
  if (!assignment)
    return <div className="p-8 text-center">Không tìm thấy bài tập.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Chung */}
      <div>
        <button
          onClick={() =>
            onNavigate(isTeacher ? "course-detail" : "courses", {
              courseId: assignment.class_id,
            })
          }
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại lớp học
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <FileText className="w-8 h-8" />
          </div>
          {assignment.title}
        </h1>
        
        <div className="mt-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2 text-lg">Đề bài:</h3>
          <p className="text-gray-600 whitespace-pre-wrap">
            {assignment.description || "(Không có mô tả chi tiết)"}
          </p>

          {assignment.attachment_url && (
            <div className="mt-4">
                <a 
                    href={assignment.attachment_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition font-medium"
                >
                    <Paperclip className="w-4 h-4" />
                    Tải xuống file đề bài đính kèm
                </a>
            </div>
          )}

          <div className="mt-4 flex gap-4 text-sm text-gray-500 border-t pt-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> Hạn nộp:{" "}
              {new Date(assignment.end_date).toLocaleString("vi-VN")}
            </span>
            <span className="flex items-center gap-1 font-semibold text-blue-600">
              Thang điểm: {assignment.scale}
            </span>
          </div>
        </div>
      </div>

      {/* --- GIAO DIỆN CHO TEACHER --- */}
      {isTeacher ? (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b bg-green-50 flex justify-between items-center">
                <h3 className="font-bold text-green-800 text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5"/> Danh sách bài nộp ({submittedList.length})
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead className="bg-white border-b">
                    <tr>
                    <th className="py-4 px-6 font-medium text-gray-500">Sinh viên</th>
                    <th className="py-4 px-6 font-medium text-gray-500">Ngày nộp</th>
                    <th className="py-4 px-6 font-medium text-gray-500">File</th>
                    <th className="py-4 px-6 font-medium text-gray-500">Điểm</th>
                    <th className="py-4 px-6 font-medium text-gray-500 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {submittedList.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-500 italic">
                        Chưa có sinh viên nào nộp bài.
                        </td>
                    </tr>
                    ) : (
                        submittedList.map((sub) => (
                        <tr key={sub.studentId} className="hover:bg-gray-50 transition">
                        <td className="py-4 px-6">
                            <div className="font-medium text-gray-900">{sub.studentName}</div>
                            <div className="text-xs text-gray-500">{sub.email}</div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                            {new Date(sub.submitted_at).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-4 px-6">
                            {sub.submission_file_url ? (
                            <a
                                href={sub.submission_file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                            >
                                <FileText className="w-4 h-4" /> Xem
                            </a>
                            ) : <span className="text-gray-400 text-sm">Trống</span>}
                        </td>
                        <td className="py-4 px-6">
                            {sub.score !== null ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                {sub.score}
                            </span>
                            ) : (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">--</span>
                            )}
                        </td>
                        <td className="py-4 px-6 text-right">
                            <button
                            onClick={() => handleOpenGrading(sub)}
                            className="px-4 py-2 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
                            >
                            Chấm điểm
                            </button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b bg-red-50 flex justify-between items-center">
                    <h3 className="font-bold text-red-800 text-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5"/> Danh sách chưa nộp ({notSubmittedList.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-white border-b">
                        <tr>
                        <th className="py-4 px-6 font-medium text-gray-500">Sinh viên</th>
                        <th className="py-4 px-6 font-medium text-gray-500">Email</th>
                        <th className="py-4 px-6 font-medium text-gray-500">Trạng thái</th>
                        <th className="py-4 px-6 font-medium text-gray-500">Điểm (Tự động)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {notSubmittedList.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="py-10 text-center text-gray-500 italic">
                            Tất cả sinh viên đã nộp bài đầy đủ!
                            </td>
                        </tr>
                        ) : (
                            notSubmittedList.map((stu) => (
                            <tr key={stu.studentId} className="hover:bg-gray-50 transition">
                            <td className="py-4 px-6 font-medium text-gray-900">
                                {stu.studentName}
                            </td>
                            <td className="py-4 px-6 text-gray-500 text-sm">
                                {stu.email}
                            </td>
                            <td className="py-4 px-6">
                                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
                                    Chưa nộp
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <span className="text-gray-400 font-bold text-lg">0</span>
                            </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>
      ) : (
        /* --- GIAO DIỆN CHO STUDENT --- */
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b font-bold text-gray-800 flex justify-between items-center">
                <span>Trạng thái bài nộp</span>
                {/* NÚT CHỈNH SỬA (HIỆN NẾU ĐÃ NỘP BÀI) */}
                {studentSubmission && !showUploadForm && (
                    <button 
                        onClick={handleOpenEditSubmission}
                        className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 flex items-center gap-1 transition"
                    >
                        <Edit className="w-3 h-3" /> Chỉnh sửa bài nộp
                    </button>
                )}
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-gray-500 font-medium">Tình trạng nộp:</div>
                <div className="md:col-span-2">
                  {studentSubmission ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex w-fit items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Đã nộp bài
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                      Chưa nộp bài
                    </span>
                  )}
                </div>
              </div>
              {studentSubmission && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-gray-500 font-medium">
                      File bài làm:
                    </div>
                    <div className="md:col-span-2">
                      <a
                        href={studentSubmission.submission_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-2 font-medium"
                      >
                        <FileText className="w-4 h-4" /> Tải xuống bài làm
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-gray-500 font-medium">Lời nhắn:</div>
                    <div className="md:col-span-2 text-gray-700 italic">
                      "{studentSubmission.submission_description}"
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                    <div className="text-gray-500 font-medium">Điểm số:</div>
                    <div className="md:col-span-2">
                      {studentSubmission.score !== null ? (
                        <span className="text-2xl font-bold text-blue-600">
                          {studentSubmission.score}{" "}
                          <span className="text-sm text-gray-400 font-normal">
                            / {assignment.scale}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">
                          Đang chờ chấm...
                        </span>
                      )}
                    </div>
                  </div>
                  {studentSubmission.teacher_comment && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-gray-500 font-medium">Nhận xét:</div>
                      <div className="md:col-span-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                        {studentSubmission.teacher_comment}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* FORM UPLOAD (DÙNG CHUNG CHO TẠO MỚI VÀ EDIT) */}
          {(!studentSubmission || showUploadForm) && (
            <div className="bg-white rounded-xl shadow-xl border border-blue-200 mt-8 animate-in slide-in-from-bottom-4">
              <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                <h3 className="font-bold text-blue-800">
                    {isEditingSubmission ? "Cập nhật bài nộp" : "Tải lên bài làm"}
                </h3>
                <button
                  onClick={() => {
                      setShowUploadForm(false);
                      setIsEditingSubmission(false); // Reset state khi đóng
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 bg-blue-50/30 text-center relative">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <div className="flex flex-col items-center">
                    <Upload className="w-10 h-10 text-blue-400 mb-2" />
                    {file ? (
                      <p className="font-bold text-blue-700">{file.name}</p>
                    ) : (
                      <>
                        <p className="text-gray-500">
                            {isEditingSubmission ? "Chọn file mới để thay thế (Tùy chọn)" : "Chọn file từ máy tính"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả / Lời nhắn
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Lời nhắn..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                        setShowUploadForm(false);
                        setIsEditingSubmission(false);
                    }}
                    className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleStudentSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 font-bold"
                  >
                    {isSubmitting ? "Đang xử lý..." : (isEditingSubmission ? "Lưu thay đổi" : "Nộp bài")}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Nút hiển thị form nộp bài nếu chưa nộp (và form đang ẩn) */}
          {!studentSubmission && !showUploadForm && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => {
                    setIsEditingSubmission(false);
                    setShowUploadForm(true);
                    setDescription(""); // Reset
                    setFile(null);
                }}
                className="bg-white text-gray-900 border border-gray-300 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <Upload className="w-5 h-5" /> Nộp bài ngay
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL CHẤM ĐIỂM (TEACHER ONLY) */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row h-[80vh] overflow-hidden animate-in zoom-in duration-200">
            <div className="flex-1 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5" /> Bài làm của sinh viên
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Sinh viên
                  </label>
                  <div className="font-medium">
                    {gradingSubmission.studentName}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Lời nhắn
                  </label>
                  <p className="italic text-gray-700">
                    "{gradingSubmission.submission_description || "Không có"}"
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    File đính kèm
                  </label>
                  {gradingSubmission.submission_file_url ? (
                    <a
                      href={gradingSubmission.submission_file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 mt-2 text-blue-700 font-medium hover:underline"
                    >
                      <FileText className="w-5 h-5" /> Tải xuống file
                    </a>
                  ) : (
                    <div className="text-gray-400 italic">Không có file</div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Chấm điểm</h3>
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-5 flex-1">
                <div>
                  <label className="block font-semibold mb-2">Điểm số (Max: {assignment.scale})</label>
                  <input
                    type="number"
                    min="0"
                    max={assignment.scale}
                    className="w-full px-4 py-3 border rounded-lg text-lg font-bold"
                    value={gradeData.score}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > parseFloat(assignment.scale)) return; 
                        setGradeData({ ...gradeData, score: e.target.value })
                    }}
                    placeholder={`0 - ${assignment.scale}`}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Nhận xét</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg"
                    value={gradeData.feedback}
                    onChange={(e) =>
                      setGradeData({ ...gradeData, feedback: e.target.value })
                    }
                    placeholder="Nhập nhận xét..."
                  />
                </div>
              </div>
              <div className="pt-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="px-5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSubmitGrade}
                  className="px-6 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg font-bold shadow-md hover:bg-gray-100"
                >
                  Lưu kết quả
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}