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
  return "not_submitted";
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const isOverdue = (dueDate) => {
  return new Date() > new Date(dueDate);
};

export const getDaysUntilDue = (dueDate) => {
  const now = new Date();
  const timeDiff = new Date(dueDate).getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};
