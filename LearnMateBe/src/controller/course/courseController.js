const Assignment = require("../../modal/Assignment");
const Booking = require("../../modal/Booking");
const Quiz = require("../../modal/Quiz");
const Schedule = require("../../modal/Schedule");

const computeProgressFromArrays = (
  bookingId,
  allQuizzes,
  allAssignments,
  allSchedules
) => {
  const idStr = bookingId.toString();

  const quizzes = allQuizzes.filter((q) => q.bookingId.toString() === idStr);
  const assignments = allAssignments.filter(
    (a) => a.bookingId.toString() === idStr
  );
  const schedules = allSchedules.filter(
    (at) => at.bookingId.toString() === idStr
  );

  const quizProgress = quizzes.length
    ? (quizzes.filter((q) => q.attempted > 0).length / quizzes.length) * 100
    : 0;

  const assignmentProgress = assignments.length
    ? (assignments.filter((a) => a.submittedAt).length / assignments.length) *
      100
    : 0;

  const attendanceProgress = schedules.length
    ? (schedules.filter((s) => s.attended).length / schedules.length) * 100
    : 0;

  const totalProgress =
    quizProgress * 0.3 + assignmentProgress * 0.5 + attendanceProgress * 0.2;

  return Math.round(totalProgress);
};

const calculateProgressForManyCourses = async (bookingIds) => {
  if (!bookingIds || bookingIds.length === 0) return {};

  const [allQuizzes, allAssignments, allSchedules] = await Promise.all([
    Quiz.find({ bookingId: { $in: bookingIds } }),
    Assignment.find({ bookingId: { $in: bookingIds } }),
    Schedule.find({ bookingId: { $in: bookingIds } }),
  ]);

  const progressMap = {};

  bookingIds.forEach((id) => {
    progressMap[id.toString()] = computeProgressFromArrays(
      id,
      allQuizzes,
      allAssignments,
      allSchedules
    );
  });

  return progressMap;
};

const getMyAllCoursesDetails = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const bookings = await Booking.find({
      learnerId: userId,
      status: "approve",
    })
      .populate({
        path: "tutorId",
        select: "user",
        populate: {
          path: "user",
          select: "username",
        },
      })
      .populate({
        path: "subjectId",
        select: "name classLevel",
      })
      .sort({ createdAt: -1 });

    const bookingIds = bookings.map((b) => b._id);

    const [allQuizzes, allAssignments] = await Promise.all([
      Quiz.find({
        bookingId: { $in: bookingIds },
        attempted: 0,
        deadline: { $gt: new Date() },
      }).sort({ deadline: 1 }),

      Assignment.find({
        bookingId: { $in: bookingIds },
        submitted: false,
        deadline: { $gt: new Date() },
      }).sort({ deadline: 1 }),
    ]);

    const progressMap = await calculateProgressForManyCourses(bookingIds);

    const myCourses = bookings.map((b) => {
      const quizzes = allQuizzes
        .filter((q) => q.bookingId.toString() == b._id.toString())
        .slice(0, 3);
      const assignments = allAssignments
        .filter((a) => a.bookingId.toString() == b._id.toString())
        .slice(0, 3);

      return {
        id: b._id.toString(),
        name: b.name,
        tutor: {
          name: b.tutorId.user.username,
          education: b.tutorId.education,
          avatar: b.tutorId.user.image,
          rating: b.tutorId.rating,
        },
        subject: {
          name: b.subjectId.name,
          level: b.subjectId.classLevel,
        },
        progress: progressMap[b._id.toString()],
        upcomingTasks: {
          quizzes,
          assignments,
        },
      };
    });

    console.log("My Courses:", myCourses);

    res.status(200).json({ data: myCourses, success: true });
  } catch (error) {
    console.error("GetMyCourses Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

const getMyCourseDetails = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: null });
  } catch (error) {
    console.error("GetMyCourseDetails Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

const getScheduleTasksForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ bookingId: courseId }).sort({
      createdAt: -1,
    });
    const assignments = await Assignment.find({ bookingId: courseId }).sort({
      createdAt: -1,
    });
    const schedules = await Schedule.find({ bookingId: courseId }).sort({
      createdAt: -1,
    });

    const result = {
      quizzes,
      assignments,
      schedules,
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("GetScheduleTasks Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};
const getQuizzesForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ bookingId: courseId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    console.error("GetMyCourseDetails Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};
const getAssignmentsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = await Assignment.find({ bookingId: courseId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    console.error("GetMyCourseDetails Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

const getProgressDetailsForCourse = async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log("Booking ID:", bookingId);

    const [quizzes, assignments, schedules] = await Promise.all([
      Quiz.find({ bookingId }),
      Assignment.find({ bookingId }),
      Schedule.find({ bookingId }),
    ]);

    const quizTaken = quizzes.filter((q) => q.attempted > 0).length;
    const assignmentSubmitted = assignments.filter((a) => a.submittedAt).length;
    const scheduleAttended = schedules.filter((s) => s.attended).length;

    const totalQuizzes = quizzes.length;
    const totalAssignments = assignments.length;
    const totalSchedules = schedules.length;

    const quizProgress = totalQuizzes ? (quizTaken / totalQuizzes) * 100 : 0;

    const assignmentProgress = totalAssignments
      ? (assignmentSubmitted / totalAssignments) * 100
      : 0;

    const attendanceProgress = totalSchedules
      ? (scheduleAttended / totalSchedules) * 100
      : 0;

    const totalProgress =
      quizProgress * 0.3 + assignmentProgress * 0.5 + attendanceProgress * 0.2;

    const result = {
      quizTaken,
      totalQuizzes,
      quizProgress,

      assignmentSubmitted,
      totalAssignments,
      assignmentProgress,

      scheduleAttended,
      totalSchedules,
      attendanceProgress,
      totalProgress,
    };

    res.status(200).json({ data: result, success: true });
  } catch (error) {
    console.error("GetCourseProgress Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

module.exports = {
  getMyAllCoursesDetails,
  getMyCourseDetails,
  getScheduleTasksForCourse,
  getQuizzesForCourse,
  getAssignmentsForCourse,
  getProgressDetailsForCourse,
};
