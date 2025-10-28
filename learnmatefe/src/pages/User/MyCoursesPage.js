import { BookOpen, Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllMyCourses } from "../../redux/action/courseActions";

import CourseListHeader from "../../components/User/CourseListHeader";
import CourseCard from "../../components/User/CourseCard";
import AllCoursesSchedule from "./AllCoursesSchedule";

const MyCoursesPage = () => {
  const dispatch = useDispatch();
  const {
    myCourses = [],
    loading,
    error,
  } = useSelector((state) => state.courses);

  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name-asc");
  const [hasCourses, setHasCourses] = useState(true);

  useEffect(() => {
    dispatch(fetchAllMyCourses());
  }, [dispatch]);

  const filteredAndSortedCourses = useMemo(() => {
    let courses = [...myCourses];

    if (searchQuery) {
      courses = courses.filter(
        (course) =>
          course.subject.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course?.tutor?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter === "active") {
      courses = courses.filter((course) => course.progress < 100);
    } else if (filter === "completed") {
      courses = courses.filter((course) => course.progress === 100);
    } else if (filter === "upcoming") {
      courses = courses.filter((course) => course.progress === 0);
    }

    if (sort === "name-asc") {
      courses.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "name-desc") {
      courses.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sort === "progress-asc") {
      courses.sort((a, b) => a.progress - b.progress);
    } else if (sort === "progress-desc") {
      courses.sort((a, b) => b.progress - a.progress);
    }

    return courses;
  }, [searchQuery, filter, sort]);

  return (
    <div className="flex">
      <div className="w-80 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1>Student Portal</h1>
        </div>
        <nav className="p-4">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center w-full p-3 mb-2 rounded-lg border-0 transition-colors ${
              activeTab === "schedule"
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Calendar className="mr-3" size={20} />
            <span className="font-medium">All Courses Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center w-full p-3 mb-2 rounded-lg border-0 transition-colors ${
              activeTab === "courses"
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BookOpen className="mr-3" size={20} />
            <span className="font-medium">Courses</span>
          </button>
        </nav>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === "schedule" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Today's Schedule
              </h2>
              <div className="space-y-4">
                <AllCoursesSchedule />
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <CourseListHeader
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  currentFilter={filter}
                  onFilterChange={setFilter}
                  currentSort={sort}
                  onSortChange={setSort}
                />

                {hasCourses && filteredAndSortedCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="text-center max-w-md">
                      <div className="mb-6"></div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Không tìm thấy khoá học nào
                      </h3>
                      {!searchQuery && (
                        <p className="text-muted-foreground">
                          Bạn chưa đăng ký khóa học nào.
                        </p>
                      )}
                      {searchQuery && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCoursesPage;
