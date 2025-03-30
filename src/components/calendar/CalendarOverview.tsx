
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CalendarOverview: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  // Mock events for demonstration
  const events = [
    { id: 1, date: new Date(2023, 9, 15), title: "Team Meeting" },
    { id: 2, date: new Date(2023, 9, 20), title: "Project Deadline" },
    { id: 3, date: new Date(2023, 9, 25), title: "Client Presentation" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          <div className="space-y-2">
            <h3 className="font-medium">Upcoming Events</h3>
            {events.map((event) => (
              <div key={event.id} className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-team-blue" />
                <span className="font-medium">
                  {event.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span>{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarOverview;
