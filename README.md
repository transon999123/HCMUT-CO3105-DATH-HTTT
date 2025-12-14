# Đồ án môn học: Hệ thống Thông tin (CO3105) - Đại học Bách Khoa TP.HCM (HCMUT)  
## Tên đề tài: Hệ thống Quản lý Lớp học - GVHD: Trương Quỳnh Chi

## Danh sách SV:
| STT | Họ và tên | MSSV | Tỉ lệ hoàn thành |
|-----|-----------|------|---|
| 1 | Trần Hữu Nguyên Sơn (leader) | 2312981 | 100% |
| 2 | Đào Xuân Sơn | 2312954 | 100% |
| 3 | Nguyễn Thị Quỳnh Tâm | 2313037 | 100% |
| 4 | Lê Quốc Thái | 2313097 | 100% |

## Biểu đồ Gantt công việc:
| ĐATH | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 | T11 | T12 | T13 | T14 |
|------|----|----|----|----|----|----|----|----|----|-----|-----|-----|-----|-----|
| Planning & analyzing (done) | x | x | | | | | | | | | | | | |
| Design (done) | | x | x | x | x | x | x | | | | | | | |
| Implementation (done) | | | | | | x | x | x | x | x | x | x | x | x |
| Testing (done) | | | | | | | | | | | | x | x | x |
| Report | | | | | | | | | | | | | | x |

## Biểu đồ công việc từng thành viên:
| Task/SV | NSơn (lead) | XSơn | Thái | Tâm |
|---------|-------------|------|------|-----|
| Lên ý tưởng | x | x | x | x |
| Vẽ Usecase | | x | x | |
| Vẽ workflow | | x | | x |
| ERD | x | | | |
| Prototype | | x | x | x |
| Back-end | x | | | |
| Front-end | x | x | | x |
| Testing & presenting | x | x | x | x |
| Report & slides | x | x | x | x |

## Tên đề tài: Hệ thống Quản lý Lớp học (Classroom Management System – CMS)
### Mô tả:
Đây là một nền tảng web được xây dựng nhằm số hóa và hợp lý hóa các hoạt động quản lý, giảng dạy và học tập trong phạm vi lớp học của một trung tâm giáo dục (học thêm). Hệ thống tập trung vào các chức năng cốt lõi: 
- quản lý lớp học
- giao và nộp bài
- chấm điểm
- trao đổi.

**Repository:** [https://github.com/transon999123/HCMUT-CO3105-DATH-HTTT.git](https://github.com/transon999123/HCMUT-CO3105-DATH-HTTT.git)

---

## Công nghệ sử dụng

### Frontend
- **Core:** React (Vite), TypeScript
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Data Visualization:** Recharts
- **State Management:** React Context API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Token)
- **File Upload:** Multer

---

## Hướng dẫn Cài đặt & Chạy dự án

### 1. Yêu cầu tiên quyết
- Node.js (v18 trở lên)
- MySQL Server (XAMPP)
- Git

### 2. Clone dự án
```bash
git clone [https://github.com/transon999123/HCMUT-CO3105-DATH-HTTT.git](https://github.com/transon999123/HCMUT-CO3105-DATH-HTTT.git)
cd HCMUT-CO3105-DATH-HTTT
```

### 3. Cài đặt Database
- Mở phpMyAdmin hoặc MySQL Workbench.
- Tạo database mới tên là EduClassDB.
- Import file backend/skool.sql vào database vừa tạo để khởi tạo bảng và dữ liệu mẫu.

### 4. Cài backend
```bash
cd backend

# Cài đặt các thư viện
npm install

# Cấu hình biến môi trường
# Tạo file .env và điền thông tin tương ứng với MySQL của bạn:
# DB_HOST=<your_local_ip_adress>
# DB_USER=<your_name>
# DB_PASSWORD=<your_pass>
# DB_NAME=EduClassDB
# JWT_SECRET=<your_secret_key>
# PORT=5000

# Chạy server
npm start
# Hoặc chế độ dev: npm run dev
```
### 5. Cài Frontend
```bash
cd frontend

# Cài đặt thư viện
npm install

# Chạy ứng dụng
npm run dev

Truy cập ứng dụng tại: http://localhost:<port_on_terminal>
```
## Tính năng chính
### Quản trị viên (Admin)
- Dashboard thống kê: Xem tổng quan số lượng user, lớp học, biểu đồ tăng trưởng.
- Quản lý User: Thêm, xóa, sửa thông tin Giảng viên và Sinh viên.
- Quản lý Lớp học: Tạo lớp học mới, phân công Giảng viên, chỉnh sửa thông tin lớp (Màu sắc, Lịch học).
- Enrollment: Thêm/Xóa sinh viên khỏi lớp học.

### Giảng viên (Teacher)
- Quản lý Lớp dạy: Xem danh sách lớp được phân công với giao diện thẻ màu trực quan.
- Bài tập (Assignments): Tạo bài tập mới, đính kèm file đề bài, thiết lập deadline và thang điểm.
- Chấm điểm: Xem danh sách nộp bài, chấm điểm và gửi nhận xét cho sinh viên.
- Tài liệu (Materials): Upload bài giảng, slide, video cho lớp.
- Quản lý Sinh viên: Xem danh sách sinh viên trong lớp.

### Sinh viên (Student)
- Lớp học của tôi: Xem các lớp đã được ghi danh.
- Nộp bài: Upload file bài làm, xem điểm số và nhận xét từ GV.
- Tài liệu: Tải xuống tài liệu học tập.
- Thảo luận (Forum): Trao đổi, hỏi đáp trong từng lớp học (có hỗ trợ gửi ảnh).
- Thông báo: Nhận thông báo Real-time (khi có bài tập mới, có điểm, v.v.).

## API Documentation
Danh sách API đính kèm ở:
![API Backend](https://github.com/transon999123/HCMUT-CO3105-DATH-HTTT/blob/436664160b809f5d3ab000a644126efb4eaa164b/backend/api_backend%20(1).xlsx)

## Liên hệ:
- Leader: Trần Hữu Nguyên Sơn
- MSSV: 2312981
- Email liên hệ tại: ![son.tran2312981n48@hcmut.edu.vn](son.tran2312981n48@hcmut.edu.vn)






