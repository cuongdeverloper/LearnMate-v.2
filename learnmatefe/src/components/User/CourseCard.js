import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import Progress from "../ui/Progress";

const CourseCard = ({
  id,
  course,
  progress = 80,
  nextDue = "Project due: Oct 25",
}) => {
  const navigate = useNavigate();
  const handleEnter = () => {
    navigate(`/user/my-courses/${course._id}`);
  };
  return (
    <Card className="h-full hover:shadow-lg hover-scale-103 transition-all duration-300 cursor-pointer group">
      <CardHeader className="pb-3">
        <h3
          className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors"
          onClick={handleEnter}
        >
          {course?.subjectId?.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {course?.tutorId?.user?.username}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              Progress
            </span>
            <span className="text-sm font-semibold text-primary">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="bg-accent/50 rounded-md p-3">
          <p className="text-sm text-foreground">{nextDue}</p>
        </div>

        <Button
          onClick={handleEnter}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          Enter Course
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
