const express = require('express');
const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken'); // <--- Nhớ import cái này
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu file và tên file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Lưu vào thư mục 'uploads'
    },
    filename: function (req, file, cb) {
        // Đặt tên file = Thời gian hiện tại + Tên gốc (để tránh bị trùng đè lên nhau)
        // Ví dụ: 1700000000-baitap.pdf
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// QUAN TRỌNG: Mở thư mục uploads ra cho bên ngoài truy cập (để tải file về)
// Khi truy cập http://localhost:5000/uploads/tenfile.pdf sẽ xem được file
app.use('/uploads', express.static('uploads'));


app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. API Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Validate đầu vào
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    try {
        // Query DB tìm user
        // Lưu ý: Đồ án này đang dùng pass thường (plain text). 
        // Nếu muốn xịn hơn thì sau này dùng bcrypt để mã hóa.
        const [users] = await db.query(
            'SELECT * FROM Users WHERE username = ? AND password = ?', 
            [username, password]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
        }

        const user = users[0];

        // --- TẠO TOKEN (Cái vé) ---
        const token = jwt.sign(
            { 
                userId: user.user_id, 
                role: user.role,       // Lưu role vào vé để tiện phân quyền sau này
                username: user.username 
            },
            process.env.JWT_SECRET,   // Khóa bí mật lấy từ .env
            { expiresIn: '24h' }      // Vé hết hạn sau 24h
        );

        // Trả về cho Frontend
        res.json({
            success: true,
            message: "Đăng nhập thành công!",
            token: token, // <--- Quan trọng nhất
            user: {
                id: user.user_id,
                username: user.username,
                fullName: `${user.last_name} ${user.middle_name || ''} ${user.first_name}`,
                role: user.role,
                email: user.email,
                avatar: user.avatar || null // Nếu có
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
});


// --- MIDDLEWARE: Kiểm tra đăng nhập ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Header thường có dạng: "Bearer <token_loằng_ngoằng>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Chưa đăng nhập! Vui lòng gửi kèm Token." });
    }

    try {
        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Lưu thông tin user (id, role) vào biến req để dùng ở bước sau
        next(); // Cho phép đi tiếp
    } catch (error) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
};


// 3. API Lấy danh sách lớp học (Phân quyền)
app.get('/api/classes', verifyToken, async (req, res) => {
    // Lấy thông tin từ token (do middleware verifyToken cung cấp)
    const { userId, role } = req.user; 

    try {
        let query = '';
        let params = [];

        if (role === 'Admin') {
            // Admin thấy tất cả lớp + tên giáo viên dạy lớp đó
            query = `
                SELECT Classes.*, Users.first_name, Users.last_name 
                FROM Classes 
                LEFT JOIN Users ON Classes.teacher_id = Users.user_id
            `;
        } 
        else if (role === 'Teacher') {
            // Teacher chỉ thấy lớp mình dạy
            query = 'SELECT * FROM Classes WHERE teacher_id = ?';
            params = [userId];
        } 
        else if (role === 'Student') {
            // Student chỉ thấy lớp mình đã đăng ký (JOIN bảng Enrollments)
            query = `
                SELECT Classes.* FROM Classes 
                JOIN Enrollments ON Classes.class_id = Enrollments.class_id 
                WHERE Enrollments.student_id = ?
            `;
            params = [userId];
        }

        // Thực thi SQL
        const [rows] = await db.query(query, params);
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy danh sách lớp" });
    }
});

// 4. API Tạo lớp học mới (Chỉ Admin)
app.post('/api/classes', verifyToken, async (req, res) => {
    const { role, userId } = req.user; // Lấy thông tin từ Token

    // 1. Chặn nếu không phải Admin
    if (role !== 'Admin') {
        return res.status(403).json({ message: "Bạn không có quyền tạo lớp học!" });
    }

    // 2. Lấy dữ liệu từ Frontend gửi lên
    const { 
        class_name, 
        class_description, 
        start_time, 
        end_time, 
        days_of_week, // Ví dụ: "Thứ 2, Thứ 4"
        teacher_id    // ID của giáo viên dạy lớp này (nếu có)
    } = req.body;

    if (!class_name) {
        return res.status(400).json({ message: "Tên lớp học là bắt buộc!" });
    }

    try {
        // 3. Insert vào Database
        const sql = `
            INSERT INTO Classes 
            (class_name, class_description, start_time, end_time, days_of_week, teacher_id, created_by_admin_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(sql, [
            class_name, 
            class_description, 
            start_time, 
            end_time, 
            days_of_week, 
            teacher_id, 
            userId // ID của Admin đang tạo
        ]);

        res.json({ 
            success: true, 
            message: "Tạo lớp học thành công!",
            classId: result.insertId 
        });

    } catch (error) {
        console.error("Lỗi tạo lớp:", error);
        res.status(500).json({ message: "Lỗi Server khi tạo lớp" });
    }
});

// 5. API Đăng ký lớp học (Chỉ Student)
app.post('/api/enroll', verifyToken, async (req, res) => {
    const { role, userId } = req.user;
    const { class_id } = req.body;

    // 1. Kiểm tra quyền Student
    if (role !== 'Student') {
        return res.status(403).json({ message: "Chỉ sinh viên mới được đăng ký lớp!" });
    }

    if (!class_id) {
        return res.status(400).json({ message: "Vui lòng chọn lớp để đăng ký!" });
    }

    try {
        // 2. Insert vào bảng Enrollment
        // Lưu ý: Trong DB mình đã set UNIQUE(student_id, class_id)
        // nên nếu đăng ký trùng, MySQL sẽ báo lỗi, ta bắt lỗi đó ở catch.
        await db.query(
            'INSERT INTO Enrollments (student_id, class_id) VALUES (?, ?)',
            [userId, class_id]
        );

        res.json({ success: true, message: "Đăng ký lớp thành công!" });

    } catch (error) {
        // Mã lỗi 1062 là Duplicate entry (đã đăng ký rồi)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Bạn đã đăng ký lớp này rồi!" });
        }
        console.error(error);
        res.status(500).json({ message: "Lỗi Server khi đăng ký lớp" });
    }
});

// 6. API Tạo Bài tập mới (Chỉ Teacher)
app.post('/api/assignments', verifyToken, async (req, res) => {
    const { role } = req.user;

    // Chỉ Teacher (hoặc Admin nếu muốn) được tạo
    if (role !== 'Teacher' && role !== 'Admin') {
        return res.status(403).json({ message: "Bạn không có quyền tạo bài tập!" });
    }

    const { 
        class_id, 
        title, 
        description, 
        start_date, 
        end_date 
    } = req.body;

    try {
        // Insert vào bảng Assignments
        const [result] = await db.query(
            `INSERT INTO Assignments (class_id, title, description, start_date, end_date) 
             VALUES (?, ?, ?, ?, ?)`,
            [class_id, title, description, start_date, end_date]
        );

        res.json({ 
            success: true, 
            message: "Tạo bài tập thành công!",
            assignmentId: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi tạo bài tập" });
    }
});

// 7. API Lấy danh sách bài tập của 1 lớp (Ai trong lớp cũng xem được)
app.get('/api/classes/:classId/assignments', verifyToken, async (req, res) => {
    const { classId } = req.params; // Lấy ID lớp từ trên URL

    try {
        // Query đơn giản lấy hết bài tập của lớp đó
        const [rows] = await db.query(
            'SELECT * FROM Assignments WHERE class_id = ? ORDER BY start_date DESC', 
            [classId]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy danh sách bài tập" });
    }
});

// 8. API Nộp bài tập (Cập nhật logic chặn deadline)
app.post('/api/submissions', verifyToken, upload.single('file'), async (req, res) => {
    const { role, userId } = req.user;
    const { assignment_id, submission_description } = req.body;

    if (role !== 'Student') {
        return res.status(403).json({ message: "Chỉ sinh viên mới được nộp bài!" });
    }

    try {
        // --- CHECK DEADLINE MỚI THÊM ---
        const [assignment] = await db.query(
            'SELECT end_date FROM Assignments WHERE assignment_id = ?', 
            [assignment_id]
        );

        if (assignment.length === 0) {
            return res.status(404).json({ message: "Bài tập không tồn tại" });
        }

        const endDate = new Date(assignment[0].end_date);
        const now = new Date();

        if (now > endDate) {
            // Nếu quá hạn thì chặn luôn, không cho insert vào DB
            return res.status(400).json({ message: "Đã hết hạn nộp bài! Bạn bị 0 điểm." });
        }
        // -------------------------------

        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng đính kèm file bài làm!" });
        }

        // ... (Phần code lưu vào DB giữ nguyên như cũ) ...
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        const sql = `INSERT INTO Submissions ...`; // (Copy lại đoạn cũ của bạn)
        await db.query(sql, [assignment_id, userId, fileUrl, submission_description]);

        res.json({ success: true, message: "Nộp bài thành công!", fileUrl: fileUrl });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi nộp bài" });
    }
});

// 9. API Chấm điểm (Teacher)
app.put('/api/submissions/:submissionId', verifyToken, async (req, res) => {
    const { role } = req.user;
    const { submissionId } = req.params;
    const { score, teacher_comment } = req.body;

    if (role !== 'Teacher') {
        return res.status(403).json({ message: "Chỉ giáo viên mới được chấm điểm!" });
    }

    try {
        // Update bảng Submissions
        const sql = `
            UPDATE Submissions 
            SET score = ?, teacher_comment = ? 
            WHERE submission_id = ?
        `;

        await db.query(sql, [score, teacher_comment, submissionId]);

        res.json({ success: true, message: "Đã chấm điểm thành công!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi chấm điểm" });
    }
});

// 10. API Xem kết quả bài làm (Có xử lý Tự động 0 điểm)
app.get('/api/assignments/:assignmentId/my-submission', verifyToken, async (req, res) => {
    const { userId } = req.user;
    const { assignmentId } = req.params;

    try {
        // Bước 1: Lấy thông tin bài tập trước (để xem deadline)
        const [assignments] = await db.query(
            'SELECT end_date FROM Assignments WHERE assignment_id = ?', 
            [assignmentId]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ message: "Bài tập không tồn tại" });
        }
        
        const endDate = new Date(assignments[0].end_date);
        const now = new Date();

        // Bước 2: Tìm bài nộp của sinh viên
        const sql = `
            SELECT * FROM Submissions 
            WHERE assignment_id = ? AND student_id = ?
        `;
        const [rows] = await db.query(sql, [assignmentId, userId]);

        // TRƯỜNG HỢP 1: Đã nộp bài
        if (rows.length > 0) {
            return res.json({ 
                submitted: true, 
                status: "Đã nộp",
                data: rows[0] 
            });
        }

        // TRƯỜNG HỢP 2: Chưa nộp + Đã quá hạn (Overdue)
        // Logic: Tự động coi như 0 điểm
        if (now > endDate) {
            return res.json({ 
                submitted: false,
                status: "Missing", // Đánh dấu là Mất bài/Quá hạn
                data: {
                    score: 0, // <--- Tự động cho 0 điểm
                    teacher_comment: "Hệ thống: Bạn đã không nộp bài đúng hạn."
                }
            });
        }

        // TRƯỜNG HỢP 3: Chưa nộp + Vẫn còn hạn
        res.json({ 
            submitted: false, 
            status: "Not Submitted",
            message: "Bạn chưa nộp bài này." 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy thông tin bài làm" });
    }
});

// 11. API Upload Tài liệu (Chỉ Teacher/Admin)
app.post('/api/materials', verifyToken, upload.single('file'), async (req, res) => {
    const { role, userId } = req.user;
    const { class_id, title, material_type } = req.body;

    // 1. Phân quyền: Chỉ GV hoặc Admin mới được up tài liệu
    if (role !== 'Teacher' && role !== 'Admin') {
        return res.status(403).json({ message: "Bạn không có quyền đăng tài liệu!" });
    }

    // 2. Kiểm tra file
    if (!req.file) {
        return res.status(400).json({ message: "Vui lòng chọn file tài liệu!" });
    }

    if (!title || !class_id) {
        return res.status(400).json({ message: "Thiếu tiêu đề hoặc ID lớp!" });
    }

    try {
        // 3. Tạo đường dẫn URL
        const materialUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // 4. Lưu vào DB
        const sql = `
            INSERT INTO Materials (class_id, title, material_type, material_url, uploaded_by_teacher_id) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        await db.query(sql, [
            class_id, 
            title, 
            material_type || 'File', // Nếu không gửi type thì mặc định là 'File'
            materialUrl, 
            userId
        ]);

        res.json({ 
            success: true, 
            message: "Upload tài liệu thành công!", 
            url: materialUrl 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server khi upload tài liệu" });
    }
});

// 12. API Lấy danh sách tài liệu của lớp (Ai trong lớp cũng xem được)
app.get('/api/classes/:classId/materials', verifyToken, async (req, res) => {
    const { classId } = req.params;

    try {
        const [rows] = await db.query(
            'SELECT * FROM Materials WHERE class_id = ? ORDER BY upload_date DESC', 
            [classId]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy danh sách tài liệu" });
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});
