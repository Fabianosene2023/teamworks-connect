import React from "react";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  status: "not-started" | "in-progress" | "completed" | "on-hold";
  dueDate?: string;
  department: string;
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  color?: string;
}

const getStatusColor = (status: ProjectCardProps["status"]) => {
  switch (status) {
    case "not-started":
      return "bg-gray-200 text-gray-700";
    case "in-progress":
      return "bg-blue-100 text-blue-700";
    case "completed":
      return "bg-green-100 text-green-700";
    case "on-hold":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-200 text-gray-700";
  }
};

const getStatusText = (status: ProjectCardProps["status"]) => {
  switch (status) {
    case "not-started":
      return "Not Started";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "on-hold":
      return "On Hold";
    default:
      return "Unknown";
  }
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  status,
  dueDate,
  department,
  members,
  color = "bg-team-blue-light border-l-team-blue",
}) => {
  return (
    <Card className={cn("border-l-4", color)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="mb-1">{department}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="hover:bg-gray-100 p-1 rounded-md">
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{description}</p>
        <div className="flex justify-between items-center">
          <Badge className={getStatusColor(status)}>{getStatusText(status)}</Badge>
          {dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <CalendarClock size={14} />
              <span>{dueDate}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex justify-between">
        <div className="flex -space-x-2">
          {members.slice(0, 3).map((member) => (
            <Avatar key={`${member.id}-${member.name}`} className="border-2 border-white h-7 w-7">
              <AvatarImage
                src={member.avatar}
                alt={member.name}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <AvatarFallback className="text-xs">
                {member.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          ))}
          {members.length > 3 && (
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-200 text-xs font-medium text-gray-600 border-2 border-white">
              +{members.length - 3}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
