import { useState } from "react";
import { AuthProvider, useAuth } from "./lib/authContext";
import { LoginPage } from "./components/login-page/LoginPage";
import { RegisterPage } from "./components/login-page/RegisterPage";
import { ForgotPasswordPage } from "./components/login-page/ForgotPasswordPage";
import { DashboardLayout } from "./components/login-page/DashboardLayout";
import { StudentCourses } from "./components/student/StudentCourses";
import { CourseDetail } from "./components/student/CourseDetail";
import { AssignmentDetail } from "./components/student/AssignmentDetail";
import { StudentAssignments } from "./components/student/StudentAssignments";
import { StudentDocuments } from "./components/student/StudentDocuments";
import { TeacherCourses } from "./components/teacher/TeacherCourses";
import { TeacherAssignments } from "./components/teacher/TeacherAssignments";
import { TeacherDocuments } from "./components/teacher/TeacherDocuments";
import { TeacherStudents } from "./components/teacher/TeacherStudents";
import { UserManagement } from "./components/admin/UserManagement";
import { AdminCourses } from "./components/admin/AdminCourses";
import { ProfilePage } from "./components/login-page/ProfilePage";

type AuthPage = "login" | "register" | "forgot-password";
type AppPage =
  | "courses"
  | "assignments"
  | "documents"
  | "profile"
  | "users"
  | "students"
  | "settings"
  | "course-detail"
  | "assignment-detail";

// Simple Toast Component thay thế cho Sonner
function Toast({
  message,
  type = "success",
}: {
  message: string;
  type?: "success" | "error";
}) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
}

function ToastContainer({
  toasts,
}: {
  toasts: Array<{ id: string; message: string; type: string }>;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type as "success" | "error"}
        />
      ))}
    </div>
  );
}

function AppContent() {
  const { user, login, logout, register } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const [currentPage, setCurrentPage] = useState<AppPage>("courses");
  const [pageData, setPageData] = useState<any>(null);
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: string }>
  >([]);

  // Simple toast function thay thế sonner
  const toast = {
    success: (message: string) => {
      const id = Math.random().toString(36);
      setToasts((prev) => [...prev, { id, message, type: "success" }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    error: (message: string) => {
      const id = Math.random().toString(36);
      setToasts((prev) => [...prev, { id, message, type: "error" }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
  };

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page as AppPage);
    setPageData(data || null);
    window.scrollTo(0, 0);
  };

  // Auth pages
  if (!user) {
    if (authPage === "register") {
      return (
        <>
          <RegisterPage
            onRegister={register}
            onNavigateToLogin={() => setAuthPage("login")}
          />
          <ToastContainer toasts={toasts} />
        </>
      );
    }

    if (authPage === "forgot-password") {
      return (
        <>
          <ForgotPasswordPage onNavigateToLogin={() => setAuthPage("login")} />
          <ToastContainer toasts={toasts} />
        </>
      );
    }

    return (
      <>
        <LoginPage
          onLogin={login}
          onNavigateToRegister={() => setAuthPage("register")}
          onNavigateToForgotPassword={() => setAuthPage("forgot-password")}
        />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  // Main dashboard
  const renderPage = () => {
    // Student pages
    if (user.role === "student") {
      if (currentPage === "courses") {
        return <StudentCourses user={user} onNavigate={handleNavigate} />;
      }
      if (currentPage === "course-detail" && pageData?.courseId) {
        return (
          <CourseDetail
            courseId={pageData.courseId}
            onNavigate={handleNavigate}
          />
        );
      }
      if (currentPage === "assignment-detail" && pageData?.assignmentId) {
        return (
          <AssignmentDetail
            assignmentId={pageData.assignmentId}
            onNavigate={handleNavigate}
          />
        );
      }
      if (currentPage === "assignments") {
        return <StudentAssignments user={user} onNavigate={handleNavigate} />;
      }
      if (currentPage === "documents") {
        return <StudentDocuments user={user} onNavigate={handleNavigate} />;
      }
      if (currentPage === "profile") {
        return <ProfilePage user={user} />;
      }
    }

    // Teacher pages
    if (user.role === "teacher") {
      if (currentPage === "courses") {
        return <TeacherCourses user={user} onNavigate={handleNavigate} />;
      }
      if (currentPage === "course-detail" && pageData?.courseId) {
        return (
          <CourseDetail
            courseId={pageData.courseId}
            onNavigate={handleNavigate}
          />
        );
      }
      if (currentPage === "assignments") {
        return <TeacherAssignments user={user} onNavigate={handleNavigate} />;
      }
      if (currentPage === "documents") {
        return <TeacherDocuments user={user} />;
      }
      if (currentPage === "students") {
        return <TeacherStudents user={user} />;
      }
      if (currentPage === "profile") {
        return <ProfilePage user={user} />;
      }
    }

    // Admin pages
    if (user.role === "admin") {
      if (currentPage === "users") {
        return <UserManagement />;
      }
      if (currentPage === "courses") {
        return <AdminCourses />;
      }
      if (currentPage === "settings") {
        return <ProfilePage user={user} />;
      }
      if (currentPage === "profile") {
        return <ProfilePage user={user} />;
      }
    }

    return <div>Trang không tồn tại</div>;
  };

  return (
    <>
      <DashboardLayout
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={logout}
      >
        {renderPage()}
      </DashboardLayout>
      <ToastContainer toasts={toasts} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
