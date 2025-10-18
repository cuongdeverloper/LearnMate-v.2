import React from "react";
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

const statusFor = (now, start, end) => {
  if (now < start) return "Upcoming";
  if (now > end) return "Completed";
  return "Active";
};

const currentYear = new Date().getFullYear();

const quizzes = [
  {
    id: "vocab-basics",
    title: "Vocabulary Basics",
    startAt: new Date(currentYear, 9, 15, 0, 0),
    endAt: new Date(currentYear, 9, 15, 23, 59),
    attempts: 1,
    score: 0.85,
  },
  {
    id: "grammar-test-1",
    title: "Grammar Test 1",
    startAt: new Date(currentYear, 9, 18, 0, 0),
    endAt: new Date(currentYear, 9, 18, 23, 59),
    attempts: 0,
  },
  {
    id: "reading-comp",
    title: "Reading Comprehension",
    startAt: new Date(currentYear, 9, 25, 0, 0),
    endAt: new Date(currentYear, 9, 25, 23, 59),
    attempts: 0,
  },
];

const QuizzesTab = () => {
  const now = new Date();

  return (
    <Card className="p-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Available Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>Score</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.map((q) => {
            const status = statusFor(now, q.startAt, q.endAt);
            const displayDate = format(q.startAt, "MM d");

            return (
              <TableRow key={q.id}>
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
                  {status === "Completed" && (
                    <Badge className="bg-slate-800 hover:bg-slate-800 text-white">
                      Completed
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{q.attempts > 0 ? q.attempts : "—"}</TableCell>
                <TableCell>
                  {q.score !== undefined
                    ? `${Math.round(q.score * 100)}%`
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {status === "Active" && (
                    <Button asChild>
                      <Link to={`/user/quiz/${q.id}/take`}>Start Quiz</Link>
                    </Button>
                  )}
                  {status === "Completed" && (
                    <Button asChild variant="secondary">
                      <Link to={`/user/quiz/${q.id}/result`}>View Result</Link>
                    </Button>
                  )}
                  {status === "Upcoming" && (
                    <Button asChild variant="outline">
                      <Link to={`/user/quiz/${q.id}`}>View Details</Link>
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
