import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
} from "lucide-react";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/Tabs";
import AssignmentsTab from "../../components/User/AssignmentsTab";
import QuizzesTab from "../../components/User/QuizzesTab";
import ProgressTab from "../../components/User/ProgressTab";
import CourseSchedule from "../../components/User/CourseSchedule";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuizzesByCourseId } from "../../redux/action/quizActions";

const COURSE_DATA = {
  1: {
    id: "1",
    title: "English 10A",
    instructor: "Linh Tran",
    description: "Advanced English language and literature course",
  },
  2: {
    id: "2",
    title: "Mathematics Advanced",
    instructor: "Nguyen Minh",
    description: "Advanced mathematics and calculus concepts",
  },
  3: {
    id: "3",
    title: "Physics Fundamentals",
    instructor: "Tran Duc",
    description: "Introduction to physics principles and experiments",
  },
  4: {
    id: "4",
    title: "Chemistry Essentials",
    instructor: "Pham Huong",
    description: "Essential chemistry concepts and lab work",
  },
  5: {
    id: "5",
    title: "History and Culture",
    instructor: "Hoang Van",
    description: "World history and cultural studies",
  },
  6: {
    id: "6",
    title: "Computer Science Basics",
    instructor: "Le Thao",
    description: "Introduction to computer science and programming",
  },
};

const CourseDetails = () => {
  const dispatch = useDispatch();
  const {
    list: myCourses,
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

  const { id: courseId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    myCourses.forEach((c) => {
      if (c._id === courseId) {
        dispatch({ type: "SELECT_COURSE", payload: c });
      }
    });

    dispatch(fetchQuizzesByCourseId(courseId));
  }, [dispatch, myCourses, courseId]);

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/user/my-courses")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Button>
          <div className="bg-card border border-border rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Course Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The course you're looking for doesn't exist.
            </p>
            <Button
              onClick={() => navigate("/user/my-courses")}
              variant="default"
            >
              Return to Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/user/my-courses")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Button>
        <div className="bg-card border border-border rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {selectedCourse?.subjectId?.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Instructor:{" "}
            <span className="font-semibold text-foreground">
              {selectedCourse?.tutorId.user.username}
            </span>
          </p>
          <p className="text-foreground">{selectedCourse?.subjectId?.name}</p>
        </div>
        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
              <TabsTrigger value="schedule" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="assignments" className="gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Assignments</span>
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Quizzes</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
            </TabsList>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="mt-6">
              <CourseSchedule />
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="mt-6">
              <AssignmentsTab courseTitle={selectedCourse?.subjectId?.name} />
            </TabsContent>

            {/* Quizzes Tab */}
            <TabsContent value="quizzes" className="mt-6">
              <QuizzesTab />
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="mt-6">
              <ProgressTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
