import React, { useMemo, useState } from "react";

import {
  SAMPLE_EVENTS,
  EVENT_COLORS,
  EVENT_LABELS,
} from "../../lib/courseEvents";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EventDetailModal from "./EventDetailModal";

const CourseSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 1));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const getEventsForDate = (day) => {
    return SAMPLE_EVENTS.filter((event) => {
      return (
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return SAMPLE_EVENTS.filter((event) => event.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">
              📅 Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => {
                  const eventColor = EVENT_COLORS[event.type];
                  const dateStr = event.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={`w-full p-2 rounded-md border-l-4 hover:bg-accent transition-colors text-left ${eventColor}`}
                    >
                      <p className="text-sm font-medium line-clamp-1">
                        {event.title}
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
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
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
                const events = day ? getEventsForDate(day) : [];
                const isToday =
                  day &&
                  new Date().getDate() === day &&
                  new Date().getMonth() === currentDate.getMonth();

                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border rounded-lg ${
                      day
                        ? isToday
                          ? "bg-primary/10 border-primary"
                          : "bg-background hover:bg-accent/50"
                        : "bg-muted/30"
                    }`}
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
                          {events.slice(0, 2).map((event) => {
                            const eventColor = EVENT_COLORS[event.type];
                            return (
                              <button
                                key={event.id}
                                onClick={() => handleEventClick(event)}
                                className={`w-full text-xs px-1.5 py-1 rounded border truncate hover:shadow-md transition-shadow ${eventColor}`}
                                title={event.title}
                              >
                                {event.title}
                              </button>
                            );
                          })}
                          {events.length > 2 && (
                            <p className="text-xs text-muted-foreground px-1.5">
                              +{events.length - 2} more
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
      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
};

export default CourseSchedule;
