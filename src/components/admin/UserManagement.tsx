// src/components/admin/UserManagement.tsx
import { useState, useEffect } from "react";
import { Search, Plus, Lock, Trash2, Edit, RefreshCw } from "lucide-react";
import api from "../../services/api";

// Định nghĩa kiểu dữ liệu User hiển thị trên bảng
interface UserDisplay {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  code: string; // Username hoặc Mã SV/GV
  status: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDisplay | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Student", // Mặc định khớp với ENUM trong DB
    password: "",
    phone: "",
    code: "", // Dùng làm username
  });

  // 1. Load dữ liệu từ DB ngay khi mở trang
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/users");
      
      // Map dữ liệu từ Backend (snake_case) sang Frontend (camelCase)
      const mappedUsers = response.data.map((u: any) => ({
        id: u.user_id,
        name: `${u.last_name || ''} ${u.middle_name || ''} ${u.first_name || ''}`.trim(),
        email: u.email,
        role: u.role,
        phone: u.phone_number || "Chưa cập nhật",
        code: u.username,
        status: "Hoạt động" // Tạm thời hardcode, sau này có thể thêm cột status vào DB
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Lỗi tải users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert("Vui lòng điền các trường bắt buộc!");
      return;
    }

    try {
      await api.post("/admin/users", formData);
      alert("Tạo tài khoản thành công!");
      setCreateDialogOpen(false);
      
      // Reset form
      setFormData({ name: "", email: "", role: "Student", password: "", phone: "", code: "" });
      
      // QUAN TRỌNG: Load lại danh sách ngay lập tức để thấy dòng mới
      fetchUsers(); 

    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi tạo tài khoản");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      alert("Đã xóa tài khoản!");
      setDeleteDialogOpen(false);
      fetchUsers(); // Load lại danh sách
    } catch (error) {
      alert("Không thể xóa (có thể user đang có dữ liệu liên quan)");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'admin') return "bg-red-100 text-red-800";
    if (r === 'teacher') return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tài khoản</h1>
          <p className="text-gray-500">Quản lý tất cả tài khoản trong hệ thống</p>
        </div>

        <div className="flex gap-2">
            <button onClick={fetchUsers} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600" title="Làm mới">
                <RefreshCw className="w-5 h-5" />
            </button>
            <button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
            >
            <Plus className="w-5 h-5" />
            Thêm tài khoản
            </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          placeholder="Tìm kiếm theo tên, email hoặc mã..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between">
          <h3 className="font-semibold text-gray-700">Danh sách ({filteredUsers.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-4 px-6 font-medium text-gray-500 text-sm">Họ và tên</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-sm">Email / Username</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-sm">Vai trò</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-sm">SĐT</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-6 font-medium text-gray-900">{user.name}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                        <span className="text-gray-900">{user.email}</span>
                        <span className="text-xs text-gray-500">Mã: {user.code}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-500">{user.phone}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Chỉ cho xóa nếu không phải là chính mình (Admin đang login) */}
                      <button 
                        onClick={() => { setSelectedUser(user); setDeleteDialogOpen(true); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE USER DIALOG --- */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Thêm tài khoản mới</h2>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Họ và tên *</label>
                    <input className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input className="w-full border rounded-lg p-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Username (Mã) *</label>
                        <input className="w-full border rounded-lg p-2" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="VD: sv001" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Vai trò</label>
                        <select className="w-full border rounded-lg p-2 bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="Student">Sinh viên</option>
                            <option value="Teacher">Giảng viên</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">SĐT</label>
                        <input className="w-full border rounded-lg p-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Mật khẩu *</label>
                    <input className="w-full border rounded-lg p-2" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setCreateDialogOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
                <button onClick={handleCreateUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Tạo tài khoản</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRM DIALOG --- */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa tài khoản?</h3>
                <p className="text-gray-500 text-sm mb-6">Bạn có chắc chắn muốn xóa <b>{selectedUser?.name}</b> không? Hành động này không thể hoàn tác.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setDeleteDialogOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
                    <button onClick={handleDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Xóa vĩnh viễn</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}