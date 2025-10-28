import React from "react";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, CheckCircle2, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { formatDate } from "../../lib/assignments";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";

const ViewAssignmentFeedback = () => {
  const navigate = useNavigate();
  const { id: assignmentId, courseId } = useParams();

  const {
    selectedAssignment: assignment,
    submitting,
    loading,
    feedback,
    error,
  } = useSelector((state) => state.assignments);

  if (!courseId || !assignmentId) {
    return <div>Invalid assignment Id</div>;
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(`/student/course/${courseId}`)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="bg-card border border-border rounded-lg shadow-sm p-8 text-center">
            <p className="text-foreground mb-4">Assignment not found</p>
            <Button onClick={() => navigate(`/student/course/${courseId}`)}>
              Go back to course
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment.feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(`/student/course/${courseId}`)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="bg-card border border-border rounded-lg shadow-sm p-8 text-center">
            <p className="text-foreground mb-4">
              No feedback available yet for this assignment.
            </p>
            <Button onClick={() => navigate(`/student/course/${courseId}`)}>
              Go back to course
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const radarData = assignment.rubric
    ? assignment.rubric.map((criteria) => ({
        name: criteria.name,
        score: (criteria.score / criteria.maxScore) * 100,
        fullMark: 100,
      }))
    : [];

  const gradePercentage = assignment.grade
    ? (assignment.grade / assignment.maxGrade) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(`/user/course/${courseId}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </Button>
        <Card className="p-8 mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">Feedback</h1>
          <p>{assignment.title}</p>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Your Grade
            </h3>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary">
                {assignment.grade}/{assignment.maxGrade}
              </p>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${gradePercentage}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {gradePercentage.toFixed(1)}%
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-green-50/30 border-green-200">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Status
            </h3>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="text-lg font-semibold text-green-900">
                Graded
              </span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Submitted
            </h3>
            <p className="text-lg font-semibold text-foreground">
              {assignment.submittedDate
                ? formatDate(assignment.submittedDate)
                : "N/A"}
            </p>
          </Card>
        </div>
        <Card className="p-8 mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Teacher Feedback
          </h3>
          <div className="bg-muted/30 p-6 rounded-lg border border-border">
            <p className="text-foreground leading-relaxed">
              {assignment.feedback}
            </p>
          </div>
        </Card>

        {radarData.length > 0 && (
          <Card className="p-8 mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Rubric Breakdown
            </h3>
            <div className="flex justify-center w-full">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart
                  data={radarData}
                  margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
                >
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="name"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#7c3aed"
                    fill="#7c3aed"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 space-y-2">
              <h4 className="font-semibold text-foreground mb-4">
                Detailed Scores
              </h4>
              {assignment.rubric &&
                assignment.rubric.map((criteria) => (
                  <div
                    key={criteria.name}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <span className="font-medium text-foreground">
                      {criteria.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${
                              (criteria.score / criteria.maxScore) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-primary w-12 text-right">
                        {criteria.score}/{criteria.maxScore}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
        <Card className="p-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Your Submission
          </h3>
          <Button className="gap-2" variant="outline">
            <Download className="w-4 h-4" />
            Download your submission
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ViewAssignmentFeedback;
