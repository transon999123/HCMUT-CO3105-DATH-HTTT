// ProfilePage.tsx
import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { User as UserType } from "../../lib/mockData";

interface ProfilePageProps {
  user: UserType;
}

export function ProfilePage({ user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    studentId: user.studentId || "",
    class: user.class || "",
    major: user.major || "",
  });

  const handleSave = () => {
    // Mock save profile
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {/* Thông tin cá nhân */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Thông tin cá nhân</h2>
            <button
              className={`px-4 py-2 rounded-md ${
                isEditing
                  ? "border border-gray-300 hover:bg-gray-50"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                {getInitials(user.name)}
              </div>
              {!isEditing && (
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                  Thay đổi ảnh đại diện
                </button>
              )}
            </div>

            {/* Form Section */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Họ và tên
                </label>
                {isEditing ? (
                  <input
                    id="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{profileData.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                {isEditing ? (
                  <input
                    id="email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{profileData.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    id="phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{profileData.phone || "Chưa cập nhật"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="studentId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mã sinh viên
                </label>
                {isEditing ? (
                  <input
                    id="studentId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profileData.studentId}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        studentId: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{profileData.studentId || "Chưa cập nhật"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="class"
                  className="block text-sm font-medium text-gray-700"
                >
                  Lớp
                </label>
                {isEditing ? (
                  <input
                    id="class"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profileData.class}
                    onChange={(e) =>
                      setProfileData({ ...profileData, class: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{profileData.class || "Chưa cập nhật"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="major"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ngành học
                </label>
                {isEditing ? (
                  <input
                    id="major"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profileData.major}
                    onChange={(e) =>
                      setProfileData({ ...profileData, major: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{profileData.major || "Chưa cập nhật"}</span>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Địa chỉ
                </label>
                {isEditing ? (
                  <input
                    id="address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{profileData.address || "Chưa cập nhật"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
