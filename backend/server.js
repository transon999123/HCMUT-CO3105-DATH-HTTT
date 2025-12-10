const express = require('express');
const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken'); // <--- Nhớ import cái này
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// ... Các API khác giữ nguyên ...

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});