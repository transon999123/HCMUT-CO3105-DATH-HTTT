import { useState, useEffect } from "react";
import { Send, Image as ImageIcon, MessageSquare, Reply, User, X } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../lib/authContext";

interface ForumTabProps {
  courseId: string;
}

export function ForumTab({ courseId }: ForumTabProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [replyTo, setReplyTo] = useState<any>(null); // Đang reply bài nào (nếu null là bài mới)
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Auto refresh mỗi 5 giây để giả lập Realtime
  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 5000); 
    return () => clearInterval(interval);
  }, [courseId]);

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/classes/${courseId}/forum`);
      setPosts(res.data);
    } catch (error) {
      console.error("Lỗi tải thảo luận");
    }
  };

  const handleSend = async () => {
    if (!content.trim() && !selectedImage) return;

    try {
      setIsSending(true);
      const formData = new FormData();
      formData.append("class_id", courseId);
      formData.append("content", content);
      if (replyTo) {
        formData.append("parent_id", replyTo.post_id);
      }
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await api.post("/forum", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Reset
      setContent("");
      setSelectedImage(null);
      setReplyTo(null);
      fetchPosts(); // Load lại ngay
    } catch (error) {
      alert("Lỗi gửi bài!");
    } finally {
      setIsSending(false);
    }
  };

  // Phân chia bài viết thành Chủ đề (Topics) và Trả lời (Replies)
  const topics = posts.filter(p => !p.parent_id);
  const getReplies = (parentId: number) => 
    posts.filter(p => p.parent_id === parentId).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  return (
    <div className="space-y-6">
      {/* KHUNG NHẬP LIỆU */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        {replyTo && (
          <div className="flex justify-between items-center bg-blue-50 p-2 mb-3 rounded-lg text-sm text-blue-800 border border-blue-100">
            <span className="flex items-center gap-2">
                <Reply className="w-4 h-4"/> Đang trả lời: <b>{replyTo.last_name} {replyTo.first_name}</b>
            </span>
            <button onClick={() => setReplyTo(null)}><X className="w-4 h-4"/></button>
          </div>
        )}
        
        <div className="flex gap-3">
            <div className="flex-1">
                <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder={replyTo ? "Viết câu trả lời..." : "Tạo chủ đề thảo luận mới..."}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                
                {/* Preview ảnh upload */}
                {selectedImage && (
                    <div className="mt-2 relative inline-block">
                        <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-20 rounded-md border" />
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className="flex justify-between items-center mt-3">
            <label className="cursor-pointer flex items-center gap-2 text-gray-500 hover:text-blue-600 transition">
                <ImageIcon className="w-5 h-5" />
                <span className="text-sm">Thêm ảnh</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
            </label>
            <button 
                onClick={handleSend}
                disabled={isSending || (!content.trim() && !selectedImage)}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition"
            >
                {isSending ? "Đang gửi..." : <><Send className="w-4 h-4"/> Gửi</>}
            </button>
        </div>
      </div>

      {/* DANH SÁCH THẢO LUẬN */}
      <div className="space-y-4">
        {topics.map(topic => (
            <div key={topic.post_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* Bài gốc */}
                <div className="p-5">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                            {topic.first_name?.[0]}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-900">{topic.last_name} {topic.first_name}</h4>
                                    <span className="text-xs text-gray-500">
                                        {new Date(topic.created_at).toLocaleString("vi-VN")} • {topic.role === 'Teacher' ? 'Giảng viên' : 'Sinh viên'}
                                    </span>
                                </div>
                            </div>
                            
                            <p className="mt-2 text-gray-800 whitespace-pre-wrap">{topic.content}</p>
                            {topic.image_url && (
                                <img src={topic.image_url} alt="Attachment" className="mt-3 max-h-60 rounded-lg border border-gray-200" />
                            )}

                            <div className="mt-3 flex items-center gap-4">
                                <button 
                                    onClick={() => setReplyTo(topic)}
                                    className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 font-medium"
                                >
                                    <MessageSquare className="w-4 h-4" /> Trả lời
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Các câu trả lời (Replies) */}
                {getReplies(topic.post_id).length > 0 && (
                    <div className="bg-gray-50/80 border-t border-gray-100 p-4 pl-12 space-y-4">
                        {getReplies(topic.post_id).map(reply => (
                            <div key={reply.post_id} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                                    {reply.first_name?.[0]}
                                </div>
                                <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-sm text-gray-900">{reply.last_name} {reply.first_name}</span>
                                        <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleString("vi-VN")}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                                    {reply.image_url && (
                                        <img src={reply.image_url} alt="Reply Img" className="mt-2 h-32 rounded border" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ))}

        {topics.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Chưa có thảo luận nào. Hãy là người đầu tiên!</p>
            </div>
        )}
      </div>
    </div>
  );
}