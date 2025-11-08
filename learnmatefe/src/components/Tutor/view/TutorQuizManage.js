import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { getSubjectsByTutor, getQuizzesByTutorWithStatus } from "../ApiTutor";

const TutorQuizManage = () => {
    const [subjects, setSubjects] = useState([]);
    const [subjectId, setSubjectId] = useState("");
    const [topics, setTopics] = useState([]);
    const [topic, setTopic] = useState("");
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await getSubjectsByTutor();
                console.log(res)
                setSubjects(res.subjects || []);
            } catch (err) {
                console.error("❌ Lỗi khi load subjects:", err);
                toast.error("Không thể load danh sách môn học");
            }
        })();
    }, []);

    // 🔹 Load quiz khi subject hoặc topic thay đổi
    useEffect(() => {
        if (!subjectId) {
            setQuizzes([]);
            setTopics([]);
            return;
        }

        (async () => {
            try {
                setLoading(true);
                const res = await getQuizzesByTutorWithStatus(subjectId, topic);
                console.log(res)
                if (!res.success) throw new Error(res.message);

                setQuizzes(res.data || []);

                // trích topic duy nhất từ quizzes để filter
                const uniqueTopics = [
                    ...new Set((res.data || []).map((q) => q.topic).filter(Boolean)),
                ];
                setTopics(uniqueTopics.map((t) => ({ label: t, value: t })));
            } catch (err) {
                console.error("❌ Lỗi khi load quiz:", err);
                toast.error("Không thể load quiz");
            } finally {
                setLoading(false);
            }
        })();
    }, [subjectId, topic]);

    return (
        <div className="p-6 bg-white rounded-xl shadow-md space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">📊 Danh sách Quiz Học sinh</h2>

            {/* 🔹 Filter môn học */}
            <div>
                <h3 className="font-medium mb-2">Chọn môn học</h3>
                <Select
                    options={subjects.map((s) => ({ value: s._id, label: s.name }))}
                    onChange={(val) => {
                        setSubjectId(val?.value || "");
                        setTopic("");
                    }}
                    placeholder="Chọn môn học"
                />
            </div>

            {/* 🔹 Filter topic */}
            {topics.length > 0 && (
                <div>
                    <h3 className="font-medium mb-2">Chọn Topic</h3>
                    <Select
                        options={[{ label: "Tất cả", value: "" }, ...topics]}
                        onChange={(val) => setTopic(val?.value || "")}
                        placeholder="Chọn topic"
                    />
                </div>
            )}

            {/* 🔹 Bảng danh sách quiz */}
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border">Tiêu đề Quiz</th>
                            <th className="px-4 py-2 border">Môn học</th>
                            <th className="px-4 py-2 border">Topic</th>
                            <th className="px-4 py-2 border">Học viên</th>
                            <th className="px-4 py-2 border">Trạng thái</th>
                            <th className="px-4 py-2 border">Số lần attempt</th>
                            <th className="px-4 py-2 border">Điểm</th>
                            <th className="px-4 py-2 border">Thời gian mở</th>
                            <th className="px-4 py-2 border">Thời gian đóng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="text-center py-4">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : quizzes.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-4">
                                    Không có quiz
                                </td>
                            </tr>
                        ) : (
                            quizzes.map((q) => (
                                <tr key={q._id}>
                                    <td className="px-4 py-2 border">{q.title}</td>
                                    <td className="px-4 py-2 border">{q.subject?.name}</td>
                                    <td className="px-4 py-2 border">{q.topic || "Chưa phân loại"}</td>
                                    <td className="px-4 py-2 border">
                                        {q.booking?.learnerId?.username || "Chưa gán"}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {q.attempted ? (
                                            <span className="text-green-600 font-semibold">Đã làm</span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">Chưa làm</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border">{q.attemptsCount || 0}</td>
                                    <td className="px-4 py-2 border">
                                        {q.attempted ? (
                                            <span className="text-green-600 font-semibold">{q.score + `/100` ?? "Chưa chấm"}</span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">Chưa làm</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {new Date(q.openTime).toLocaleString("vi-VN")}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {new Date(q.closeTime).toLocaleString("vi-VN")}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TutorQuizManage;
