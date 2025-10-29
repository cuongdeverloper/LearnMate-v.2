import React, { useEffect } from "react";
import { formatDate } from "../../lib/assignments";
import { Card } from "../ui/Card";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuizzes, selectQuiz } from "../../redux/action/courseActions";

const statusFor = (now, deadline, attempted, maxAttempts) => {
  if (attempted === 0 && now > deadline) return "Overdue";
  if (attempted === maxAttempts || (attempted > 0 && now > deadline))
    return "Completed";

  return "Active";
};

const currentYear = new Date().getFullYear();

const QuizzesTab = () => {
  const now = new Date();
  const dispatch = useDispatch();

  const { selectedCourse, quizzes, submitting, loading, error } = useSelector(
    (state) => state.courses
  );

  useEffect(() => {
    if (selectedCourse) {
      dispatch(fetchQuizzes(selectedCourse._id));
    }
  }, [dispatch, selectedCourse, submitting]);

  const handleSelectQuiz = (quizId) => {
    dispatch(selectQuiz(quizId));
  };

  return (
    <Card className="p-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Thời hạn</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Các nỗ lực</TableHead>
            <TableHead>Điểm số</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes &&
            quizzes.length > 0 &&
            quizzes?.map((q) => {
              const status = statusFor(
                now,
                q.deadline,
                q.attempted,
                q.maxAttempts
              );

              return (
                <TableRow key={q._id}>
                  <TableCell className="font-medium">{q.title}</TableCell>
                  <TableCell>{formatDate(q.deadline)}</TableCell>
                  <TableCell>
                    {status === "Upcoming" && (
                      <Badge variant="secondary">Upcoming</Badge>
                    )}
                    {status === "Active" && (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                        Active
                      </Badge>
                    )}

                    {status === "Completed" ? (
                      q.attempted > 0 ? (
                        <Badge className="bg-slate-800 hover:bg-slate-800 text-white">
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-800 hover:bg-slate-800 text-white">
                          Overdue
                        </Badge>
                      )
                    ) : (
                      <></>
                    )}
                  </TableCell>
                  <TableCell>
                    {q?.attempted} / {q?.maxAttempts}
                  </TableCell>
                  <TableCell>
                    {q.attempted > 0
                      ? Number(q.newestScore).toFixed(0) + "%"
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {status === "Active" && (
                      <Button
                        className="text-white"
                        asChild
                        onClick={() => handleSelectQuiz(q._id)}
                      >
                        <Link to={`/user/quizzes/${q._id}/take`}>
                          {q.attempted > 0 && q.attempted < q.maxAttempts
                            ? "Thử lại " +
                              "(còn " +
                              (q.maxAttempts - q.attempted) +
                              " lần thử)"
                            : q.attempted === 0
                            ? "Bắt đầu"
                            : "Xem kết quả"}
                        </Link>
                      </Button>
                    )}
                    {status === "Completed" && (
                      <Button
                        className="text-white"
                        asChild
                        variant="secondary"
                        onClick={() => handleSelectQuiz(q._id)}
                        disabled={q.attempted === q.maxAttempts}
                      >
                        <Link to={`/user/quizzes/${q._id}/result`}>
                          {q.attempted < q.maxAttempts && "Thử lại"}
                          {q.attempted >= q.maxAttempts && "Xem kết quả"}
                        </Link>
                      </Button>
                    )}
                    {status === "Upcoming" && (
                      <Button
                        asChild
                        variant="outline"
                        onClick={() => handleSelectQuiz(q._id)}
                      >
                        <Link to={`/user/quizzes/${q._id}`}>Xem thông tin</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default QuizzesTab;
