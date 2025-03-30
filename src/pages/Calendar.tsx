
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

const Calendar = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Mock events for demonstration
  const events = [
    {
      id: 1,
      title: "Team Meeting",
      date: new Date(2023, 9, 15),
      time: "10:00 AM - 11:00 AM",
      department: "All Departments",
      type: "meeting",
    },
    {
      id: 2,
      title: "Project Deadline: Marketing Campaign",
      date: new Date(2023, 9, 20),
      department: "Marketing",
      type: "deadline",
    },
    {
      id: 3,
      title: "Client Presentation",
      date: new Date(2023, 9, 25),
      time: "2:00 PM - 3:30 PM",
      department: "Sales",
      type: "meeting",
    },
    {
      id: 4,
      title: "Website Launch",
      date: new Date(2023, 9, 28),
      department: "Design",
      type: "event",
    },
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-700";
      case "deadline":
        return "bg-red-100 text-red-700";
      case "event":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get current month name
  const currentMonth = date
    ? date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  // Filter events for the selected date
  const selectedDateEvents = events.filter((event) => {
    if (!date || !event.date) return false;
    return (
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  });

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              View and manage your events and deadlines
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="lg:w-3/4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold">{currentMonth}</h2>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">Today</Button>
                </div>
              </div>
              <div className="flex justify-center">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:w-1/4">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">
                {date
                  ? date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </h2>

              {selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div key={event.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Badge>
                      </div>
                      {event.time && <p className="text-sm text-gray-500 mt-1">{event.time}</p>}
                      <p className="text-xs text-gray-500 mt-1">{event.department}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  No events scheduled for this day
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Calendar;
