import React, { useEffect } from "react";
import { format } from "date-fns";
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
import { fetchQuizzesByCourseId } from "../../redux/action/quizActions";

const statusFor = (now, start, end) => {
  if (now < start) return "Upcoming";
  if (now > end) return "Completed";
  return "Active";
};

const currentYear = new Date().getFullYear();

const QuizzesTab = () => {
  const now = new Date();
  const dispatch = useDispatch();

  const {
    selectedCourse,
    loading: courseLoading,
    error: courseError,
  } = useSelector((state) => state.courses);

  const {
    list: quizzes,
    selectedQuiz,
    userAnswers,
    submitting,
    loading: quizLoading,
    score,
    error: quizError,
  } = useSelector((state) => state.quizzes);

  useEffect(() => {
    if (selectedCourse) {
      dispatch(fetchQuizzesByCourseId(selectedCourse._id));
    }
  }, [dispatch, selectedCourse]);

  const handleSelectQuiz = (quiz) => {
    dispatch({ type: "QUIZ_SELECT", payload: quiz });
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
                q?.startAt || new Date(currentYear, 9, 18, 0, 0),
                q?.endAt || new Date(currentYear, 9, 28, 23, 59)
              );
              const displayDate = format(
                q?.startAt || new Date(currentYear, 9, 18, 0, 0),
                "MM d"
              );

              return (
                <TableRow key={q._id}>
                  <TableCell className="font-medium">{q.title}</TableCell>
                  <TableCell>{displayDate}</TableCell>
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
                      q.attempts > 0 ? (
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
                  <TableCell>{q?.attempts > 0 ? q?.attempts : "—"}</TableCell>
                  <TableCell>
                    {q.score !== undefined
                      ? `${Math.round(q.score * 100)}%`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {status === "Active" && (
                      <Button
                        className="text-white"
                        asChild
                        onClick={() => handleSelectQuiz(q)}
                      >
                        <Link to={`/user/quiz/${q._id}/take`}>Bắt đầu</Link>
                      </Button>
                    )}
                    {status === "Completed" && (
                      <Button
                        className="text-white"
                        asChild
                        variant="secondary"
                        onClick={() => handleSelectQuiz(q)}
                      >
                        <Link to={`/user/quiz/${q._id}/result`}>
                          Xem kết quả
                        </Link>
                      </Button>
                    )}
                    {status === "Upcoming" && (
                      <Button
                        asChild
                        variant="outline"
                        onClick={() => handleSelectQuiz(q)}
                      >
                        <Link to={`/user/quiz/${q._id}`}>Xem thông tin</Link>
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
