export const calculateAssignmentStatus = (assignment, today = new Date()) => {
  if (assignment.grade !== undefined) {
    return "graded";
  }
  if (assignment.submitted) {
    return "submitted";
  }
  if (today > assignment.dueDate) {
    return "overdue";
  }
  return "pending";
};

export const SAMPLE_ASSIGNMENTS = {
  1: [
    {
      id: "assign-1",
      courseId: "1",
      title: "Climate Essay",
      description: "Write about the causes of climate change.",
      dueDate: new Date(2024, 9, 20),
      submitted: true,
      submittedDate: new Date(2024, 9, 19),
      grade: 92,
      maxGrade: 100,
      feedback:
        "Excellent argumentation and structure. Your analysis of climate patterns is thorough and well-supported by data.",
      notes: "Included diagrams and sources.",
      rubric: [
        { name: "Content", score: 9, maxScore: 10 },
        { name: "Grammar", score: 10, maxScore: 10 },
        { name: "Structure", score: 9, maxScore: 10 },
        { name: "Creativity", score: 9, maxScore: 10 },
        { name: "Formatting", score: 9, maxScore: 10 },
      ],
    },
    {
      id: "assign-2",
      courseId: "1",
      title: "Reading Report",
      description: "Read Chapter 5-7 and submit a comprehensive report.",
      dueDate: new Date(2024, 9, 28),
      submitted: false,
      maxGrade: 100,
    },
    {
      id: "assign-3",
      courseId: "1",
      title: "Poetry Analysis",
      description: "Analyze three poems from the provided list.",
      dueDate: new Date(2024, 9, 10),
      submitted: false,
      maxGrade: 100,
    },
    {
      id: "assign-4",
      courseId: "1",
      title: "Grammar Exercises",
      description: "Complete all grammar exercises from Unit 3.",
      dueDate: new Date(2024, 9, 15),
      submitted: true,
      submittedDate: new Date(2024, 9, 14),
      grade: 88,
      maxGrade: 100,
      feedback: "Good work. A few minor mistakes in the conditional sentences.",
      rubric: [
        { name: "Content", score: 8, maxScore: 10 },
        { name: "Grammar", score: 8, maxScore: 10 },
        { name: "Structure", score: 9, maxScore: 10 },
        { name: "Creativity", score: 8, maxScore: 10 },
        { name: "Formatting", score: 9, maxScore: 10 },
      ],
    },
  ],
};

export const getAssignmentsForCourse = (courseId) => {
  return SAMPLE_ASSIGNMENTS[courseId] || [];
};

export const getAssignmentById = (courseId, assignmentId) => {
  return getAssignmentsForCourse(courseId).find((a) => a.id === assignmentId);
};

export const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const isOverdue = (dueDate) => {
  return new Date() > dueDate;
};

export const getDaysUntilDue = (dueDate) => {
  const now = new Date();
  const timeDiff = dueDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};
