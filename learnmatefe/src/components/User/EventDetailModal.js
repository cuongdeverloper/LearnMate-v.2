import React from "react";
import { EVENT_COLORS, EVENT_LABELS } from "../../lib/courseEvents";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Calendar, FileText, MapPin } from "lucide-react";
import { Button } from "../ui/Button";

const EventDetailModal = ({ event, isOpen, onClose }) => {
  if (!event) return null;

  const eventColor = EVENT_COLORS[event.type];
  const eventLabel = EVENT_LABELS[event.type];

  const dateStr = event.date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col items-start">
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${eventColor}`}
              >
                {eventLabel}
              </div>
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-foreground">
            <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium">{dateStr}</p>
              <p className="text-sm text-muted-foreground">
                {event.startTime}
                {event.endTime && ` - ${event.endTime}`}
              </p>
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-3 text-foreground">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p>{event.location}</p>
            </div>
          )}

          {event.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-foreground">{event.description}</p>
            </div>
          )}

          {event.notes && (
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="text-foreground">{event.notes}</p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t flex gap-2">
            {event.type === "assignment" && (
              <>
                <Button className="flex-1" variant="default">
                  View Assignment
                </Button>
                <Button className="flex-1" variant="outline">
                  Submit
                </Button>
              </>
            )}
            {event.type === "quiz" && (
              <Button className="w-full" variant="default">
                Open Quiz
              </Button>
            )}
            {event.type === "class" && (
              <Button className="w-full" variant="outline">
                Add to Calendar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailModal;
