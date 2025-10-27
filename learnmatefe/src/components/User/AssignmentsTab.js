import React from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  calculateAssignmentStatus,
  formatDate,
  getAssignmentsForCourse,
  getDaysUntilDue,
  isOverdue,
} from "../../lib/assignments";
import { AlertCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

const AssignmentsTab = ({ courseTitle }) => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  if (!courseId) return null;

  const assignments = getAssignmentsForCourse(courseId);

  const getStatusBadge = (status) => {
    switch (status) {
      case "graded":
        return <Badge variant="default">Graded</Badge>;
      case "submitted":
        return <Badge variant="secondary">Submitted</Badge>;
      case "overdue":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </Badge>
        );
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSubmit = (assignmentId) => {
    navigate(`/user/my-courses/${courseId}/assignments/${assignmentId}/submit`);
  };

  const handleViewFeedback = (assignmentId) => {
    return;
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Tiêu đề</TableHead>
              <TableHead className="font-semibold">Ngày đến hạn</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="text-center font-semibold">
                Điểm số
              </TableHead>
              <TableHead className="text-center font-semibold">
                Phản hồi
              </TableHead>
              <TableHead className="text-center font-semibold">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => {
              const status = calculateAssignmentStatus(assignment);
              const daysLeft = getDaysUntilDue(assignment.dueDate);
              const showOverdueWarning =
                isOverdue(assignment.dueDate) && !assignment.submitted;

              return (
                <TableRow key={assignment.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">
                    <div>
                      <p>{assignment.title}</p>
                      {showOverdueWarning && (
                        <p className="text-xs text-destructive mt-1">
                          ⚠️ Overdue
                        </p>
                      )}
                      {!showOverdueWarning &&
                        daysLeft > 0 &&
                        !assignment.submitted && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                          </p>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(assignment.dueDate)}
                  </TableCell>
                  <TableCell>{getStatusBadge(status)}</TableCell>
                  <TableCell className="text-center">
                    {assignment.grade !== undefined ? (
                      <span className="font-semibold text-primary">
                        {assignment.grade}/{assignment.maxGrade}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {assignment.feedback ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewFeedback(assignment.id)}
                      >
                        Xem phản hồi
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {!assignment.submitted && status !== "graded" ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSubmit(assignment.id)}
                      >
                        Nộp bài
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Đã nộp bài
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Chưa có bài tập nào.</p>
        </div>
      )}
    </div>
  );
};

export default AssignmentsTab;
