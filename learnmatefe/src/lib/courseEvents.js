export const EVENT_COLORS = {
  class: "bg-blue-100 border-blue-300 text-blue-900",
  assignment: "bg-red-100 border-red-300 text-red-900",
  quiz: "bg-green-100 border-green-300 text-green-900",
};

export const EVENT_LABELS = {
  class: "Class",
  assignment: "Assignment",
  quiz: "Quiz",
};

export const SAMPLE_EVENTS = [
  {
    id: "1",
    title: "Grammar Lesson 3",
    type: "class",
    date: new Date(2024, 9, 18),
    startTime: "10:00",
    endTime: "11:30",
    description: "Grammar fundamentals: tenses and aspects",
    location: "Room 101",
    notes: "Bring worksheet",
  },
  {
    id: "2",
    title: "Essay submission",
    type: "assignment",
    date: new Date(2024, 9, 20),
    startTime: "23:59",
    description: "Submit your essay on modern literature",
    notes: "2000-3000 words",
  },
  {
    id: "3",
    title: "Vocabulary Quiz",
    type: "quiz",
    date: new Date(2024, 9, 21),
    startTime: "10:00",
    endTime: "10:30",
    description: "Covers Lesson 1–3",
    location: "Online",
  },
  {
    id: "4",
    title: "Reading Practice",
    type: "class",
    date: new Date(2024, 9, 25),
    startTime: "14:00",
    endTime: "15:00",
    description: "Practice reading comprehension",
    location: "Room 102",
  },
  {
    id: "5",
    title: "Listening Test",
    type: "quiz",
    date: new Date(2024, 9, 28),
    startTime: "09:00",
    endTime: "09:45",
    description: "Listening comprehension assessment",
    location: "Language Lab",
  },
  {
    id: "6",
    title: "Speaking Project",
    type: "assignment",
    date: new Date(2024, 10, 2),
    startTime: "23:59",
    description: "Record a 5-minute presentation",
    notes: "Submit video file",
  },
];
