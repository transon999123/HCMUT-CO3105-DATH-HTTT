import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, Camera, Save, X, Loader2 } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../lib/authContext";


interface ProfilePageProps {
  user: any; // Dùng any tạm thời hoặc interface User chi tiết
}

export function ProfilePage({ user: initialUser }: ProfilePageProps) {
  const { user: authUser, updateUser } = useAuth(); // <--- Lấy hàm updateUser
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State cho form data
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    gender: "Other",
    date_of_birth: "",
  });

  // State cho Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // 1. Load dữ liệu từ API khi vào trang
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/users/profile");
      setProfile(res.data);
      
      // Format ngày sinh để hiển thị trong input date (YYYY-MM-DD)
      let dob = "";
      if (res.data.date_of_birth) {
        const date = new Date(res.data.date_of_birth);
        // Xử lý múi giờ để không bị lùi 1 ngày
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        dob = localDate.toISOString().split('T')[0];
      }

      setFormData({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        phone_number: res.data.phone_number || "",
        gender: res.data.gender || "Other",
        date_of_birth: dob,
      });
      
      setAvatarPreview(res.data.avatar_url);
    } catch (error) {
      console.error("Lỗi tải hồ sơ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Xử lý chọn ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Tạo URL tạm để preview
    }
  };

  // 3. Lưu thay đổi
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const data = new FormData();
      // ... append các trường dữ liệu như cũ ...
      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("phone_number", formData.phone_number);
      data.append("gender", formData.gender);
      data.append("date_of_birth", formData.date_of_birth);

      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      // Gọi API
      const res = await api.put("/users/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // --- LOGIC MỚI: CẬP NHẬT CONTEXT ---
      if (res.data.success && res.data.user) {
          const updatedBackendUser = res.data.user;
          
          // Cập nhật lại thông tin user trong Context (bao gồm Avatar mới)
          updateUser({
              name: `${updatedBackendUser.last_name} ${updatedBackendUser.first_name}`,
              avatar: updatedBackendUser.avatar_url // Backend trả về key là 'avatar_url'
          });
      }
      // ------------------------------------

      alert("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi cập nhật hồ sơ!");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName?.[0] || "") + (lastName?.[0] || "");
  };

  if (isLoading) return <div className="p-8 text-center">Đang tải hồ sơ...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover / Header Profile */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold uppercase">
                    {getInitials(profile?.first_name, profile?.last_name)}
                  </div>
                )}
              </div>
              
              {/* Nút Upload Avatar (Chỉ hiện khi Edit) */}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                  <Camera className="w-5 h-5 text-gray-600" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Edit Button */}
            {!isEditing ? (
                <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 shadow-sm transition"
                >
                    Chỉnh sửa hồ sơ
                </button>
            ) : (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setAvatarFile(null); // Reset file
                            fetchProfile(); // Reset form về data cũ
                        }}
                        className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:opacity-90 shadow-md flex items-center gap-2 transition"
                    >
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin"/>}
                        Lưu thay đổi
                    </button>
                </div>
            )}
          </div>

          {/* Form Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Họ và Tên */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin cơ bản</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                        <input
                            disabled={!isEditing}
                            value={formData.last_name}
                            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                        <input
                            disabled={!isEditing}
                            value={formData.first_name}
                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <select
                        disabled={!isEditing}
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    >
                        <option value="Male">Nam</option>
                        <option value="Female">Nữ</option>
                        <option value="Other">Khác</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                    <div className="relative">
                        <input
                            type="date"
                            disabled={!isEditing}
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                        />
                        {!isEditing && <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
                    </div>
                </div>
            </div>

            {/* Thông tin liên hệ */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin liên hệ</h3>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Không thể thay đổi)</label>
                    <div className="relative">
                        <input
                            disabled
                            value={profile?.email}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <div className="relative">
                        <input
                            disabled={!isEditing}
                            value={formData.phone_number}
                            onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Chưa cập nhật"
                        />
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò hệ thống</label>
                    <div className="relative">
                        <input
                            disabled
                            value={profile?.role}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}