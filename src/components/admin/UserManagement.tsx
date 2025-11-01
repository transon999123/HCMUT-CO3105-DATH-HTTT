import { useState } from "react";
import { Search, Plus, Lock, Trash2, Edit } from "lucide-react";
import { DEMO_USERS, User } from "../../lib/mockData";

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [users, setUsers] = useState(DEMO_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student" as "admin" | "teacher" | "student",
    password: "",
    phone: "",
    studentId: "",
    teacherId: "",
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.teacherId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const variants: {
      [key: string]: { bgColor: string; textColor: string; label: string };
    } = {
      admin: {
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        label: "Quản trị viên",
      },
      teacher: {
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        label: "Giảng viên",
      },
      student: {
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        label: "Sinh viên",
      },
    };
    return variants[role] || variants.student;
  };

  const handleCreateUser = () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone || undefined,
      studentId:
        formData.role === "student"
          ? formData.studentId || `SV${Date.now()}`
          : undefined,
      teacherId:
        formData.role === "teacher"
          ? formData.teacherId || `GV${Date.now()}`
          : undefined,
    };

    setUsers([...users, newUser]);
    setCreateDialogOpen(false);
    setFormData({
      name: "",
      email: "",
      role: "student",
      password: "",
      phone: "",
      studentId: "",
      teacherId: "",
    });
    alert("Tạo người dùng thành công!");
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    setUsers(
      users.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
            }
          : u
      )
    );
    setEditDialogOpen(false);
    setSelectedUser(null);
    alert("Cập nhật thông tin thành công!");
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    setUsers(users.filter((u) => u.id !== selectedUser.id));
    setDeleteDialogOpen(false);
    setSelectedUser(null);
    alert("Xóa người dùng thành công!");
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      phone: user.phone || "",
      studentId: user.studentId || "",
      teacherId: user.teacherId || "",
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const toggleUserStatus = (userId: string) => {
    alert("Đã thay đổi trạng thái tài khoản");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-gray-600">
            Quản lý tất cả tài khoản trong hệ thống
          </p>
        </div>

        <button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tạo người dùng mới
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Create User Dialog */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">Tạo người dùng mới</h2>
            <p className="text-gray-600 mb-4">
              Nhập thông tin để tạo tài khoản mới
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="example@bkedu.vn"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Sinh viên</option>
                  <option value="teacher">Giảng viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              {formData.role === "student" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã sinh viên
                  </label>
                  <input
                    placeholder="SV2024001"
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {formData.role === "teacher" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã giảng viên
                  </label>
                  <input
                    placeholder="GV001"
                    value={formData.teacherId}
                    onChange={(e) =>
                      setFormData({ ...formData, teacherId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => setCreateDialogOpen(false)}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateUser}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Tạo tài khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {editDialogOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              Chỉnh sửa thông tin người dùng
            </h2>
            <p className="text-gray-600 mb-4">Cập nhật thông tin tài khoản</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => setEditDialogOpen(false)}
              >
                Hủy
              </button>
              <button
                onClick={handleEditUser}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              Xác nhận xóa người dùng
            </h2>
            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn xóa người dùng "{selectedUser.name}"? Hành
              động này không thể hoàn tác.
            </p>

            <div className="flex gap-2 mt-6">
              <button
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">
            Danh sách người dùng ({filteredUsers.length})
          </h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Tên</th>
                  <th className="text-left py-3 font-medium">Email</th>
                  <th className="text-left py-3 font-medium">Vai trò</th>
                  <th className="text-left py-3 font-medium">Mã SV/GV</th>
                  <th className="text-left py-3 font-medium">Trạng thái</th>
                  <th className="text-right py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const roleInfo = getRoleBadge(user.role);
                  return (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{user.name}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.bgColor} ${roleInfo.textColor}`}
                        >
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="py-3">
                        {user.studentId || user.teacherId || "-"}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Hoạt động
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-2 hover:bg-gray-100 rounded"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 rounded"
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 rounded text-red-600"
                            onClick={() => openDeleteDialog(user)}
                          >
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy người dùng nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
