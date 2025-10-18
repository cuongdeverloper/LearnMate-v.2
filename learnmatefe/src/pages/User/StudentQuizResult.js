import React from "react";
import { useLocation, useParams } from "react-router-dom";

const StudentQuizResult = () => {
  const { id } = useParams();
  const location = useLocation();
  const payload = location.state;
  const time = payload
    ? `${Math.floor(payload.timeTaken / 60)}:${String(
        payload.timeTaken % 60
      ).padStart(2, "0")}`
    : "-";
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Quiz Result - Grammar Test 1
          </h1>
          <p className="text-muted-foreground">Quiz ID: {id}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Score</div>
            <div className="text-2xl font-semibold">-</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Correct</div>
            <div className="text-2xl font-semibold">-</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Time Taken</div>
            <div className="text-2xl font-semibold">-</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Rank</div>
            <div className="text-2xl font-semibold">-</div>
          </div>
        </div>
        <div className="mt-8 rounded-lg border p-6">
          <div className="font-medium mb-2">Detailed analytics</div>
          <p className="text-muted-foreground text-sm">
            A detailed breakdown (charts and per-question results) can be added
            next. If you want me to build the full analytics now, let me know
            and I'll implement it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizResult;
