import React from "react";
import { Card } from "../ui/Card";
import { BarChart3 } from "lucide-react";

const ProgressTab = () => {
  const progressItems = [
    { label: "Assignments Completed", value: 2, total: 3, percentage: 67 },
    { label: "Quizzes Completed", value: 1, total: 3, percentage: 33 },
    { label: "Class Attendance", value: 8, total: 10, percentage: 80 },
    { label: "Overall Progress", value: 75, total: 100, percentage: 75 },
  ];

  return (
    <div className="space-y-6">
      {progressItems.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-foreground">{item.label}</h3>
            <span className="text-sm font-semibold text-primary">
              {item.percentage}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {item.value} of {item.total} completed
          </p>
        </div>
      ))}

      <Card className="p-4 bg-accent/30 border-accent">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">Course Grade</h4>
            <p className="text-2xl font-bold text-primary mb-2">A (92%)</p>
            <p className="text-sm text-muted-foreground">
              You're performing excellently! Keep up the great work.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProgressTab;
