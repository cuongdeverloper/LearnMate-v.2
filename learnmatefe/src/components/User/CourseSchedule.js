import React, { useEffect, useMemo, useState } from "react";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TaskDetailModal from "./TaskDetailModal";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssignments,
  fetchQuizzes,
  fetchSchedule,
} from "../../redux/action/courseActions";

export const TASK_COLORS = {
  assignment: "bg-red-100 border-red-300 text-red-900",
  quiz: "bg-green-100 border-green-300 text-green-900",
};

export const TASK_LABELS = {
  assignment: "Assignment",
  quiz: "Quiz",
};

const getTasksList = (assignments, quizzes) => {
  const tasks = [
    ...assignments.map((a) => ({
      id: a._id,
      title: a.title,
      type: "assignment",
      deadline: a.deadline,
      description: a.description,
    })),
    ...quizzes.map((q) => ({
      id: q._id,
      title: q.title,
      type: "quiz",
      deadline: q.deadline,
      description: q.description,
    })),
  ];
  return tasks;
};

const CourseSchedule = () => {
  const dispatch = useDispatch();

  const {
    myCourses,
    selectedCourse,
    quizzes,
    assignments,
    schedule,
    loading: error,
  } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchAssignments(selectedCourse));
    dispatch(fetchQuizzes(selectedCourse));
    dispatch(fetchSchedule(selectedCourse));
  }, [dispatch, selectedCourse]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tasks, setTasks] = useState(getTasksList(assignments, quizzes));

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDayOfMonth, daysInMonth]);

  const getTasksForDate = (day) => {
    return tasks.filter((t) => {
      return (
        new Date(t.deadline).getDate() === day &&
        new Date(t.deadline).getMonth() === currentDate.getMonth() &&
        new Date(t.deadline).getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const hasClassOnDate = (day) => {
    return schedule.some((s) => {
      return (
        new Date(s.date).getDate() - 1 === day &&
        new Date(s.date).getMonth() === currentDate.getMonth() &&
        new Date(s.date).getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    return tasks
      .filter((t) => t.deadline >= now)
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      )
      .slice(0, 5);
  }, []);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  console.log("tasks", tasks);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4 text-lg">
              📅 Nhiệm vụ sắp tới
            </h3>
            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => {
                  const taskColor = TASK_COLORS[task.type];
                  const dateStr = new Date(task.deadline).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  );
                  return (
                    <button
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className={`w-full p-2 rounded-md border-l-4 hover:bg-accent transition-colors text-left ${taskColor}`}
                    >
                      <p className="text-sm font-medium line-clamp-1">
                        {task.title}
                      </p>
                      <p className="text-xs opacity-75 mt-1">{dateStr}</p>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No upcoming events
                </p>
              )}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {monthName}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={previousMonth}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                  className="h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {[
                "Chủ nhật",
                "Thứ 2",
                "Thứ 3",
                "Thứ 4",
                "Thứ 5",
                "Thứ 6",
                "Thứ 7",
              ].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dateTasks = day ? getTasksForDate(day) : [];
                const hasClass = day ? hasClassOnDate(day) : false;
                const isToday =
                  day &&
                  new Date().getDate() === day &&
                  new Date().getMonth() === currentDate.getMonth() &&
                  new Date().getFullYear() === currentDate.getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border rounded-lg ${
                      day
                        ? isToday
                          ? "bg-primary/10 border-primary"
                          : "bg-background hover:bg-accent/50"
                        : "bg-muted/30"
                    } ${day && hasClass ? "bg-green-200" : ""}`}
                  >
                    {day && (
                      <>
                        <p
                          className={`text-sm font-semibold mb-1 ${
                            isToday ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {day}
                        </p>
                        <div className="space-y-1">
                          {dateTasks.slice(0, 2).map((task) => {
                            const taskColor = TASK_COLORS[task.type];
                            return (
                              <button
                                key={task.id}
                                onClick={() => handleTaskClick(task)}
                                className={`w-full text-xs px-1.5 py-1 rounded border truncate hover:shadow-md transition-shadow ${taskColor}`}
                                title={task.title}
                              >
                                {task.title}
                              </button>
                            );
                          })}
                          {dateTasks.length > 2 && (
                            <p className="text-xs text-muted-foreground px-1.5">
                              +{tasks.length - 2} more
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        courseId={selectedCourse}
      />
    </div>
  );
};

export default CourseSchedule;
